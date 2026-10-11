import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ViewStyle } from 'react-native';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useStrxMotion } from '../../context/StrxMotionContext';
import type { AnimateProp, PlaybackMode } from '../../types/animate';
import { getPresetRegistryVersion } from '../presets';
import {
  completeStylePair,
  completeTransformPair,
  emptyFrame,
  filterFrameByTransitionKind,
  flattenAnimatableStyle,
  normalizeFrame,
  TRANSFORM_KEYS,
  type AnimatableStaticStyle,
  type AnimatableValue,
  type AnimationFrame,
} from './frames';
import {
  createLayerState,
  EMPTY_LAYER,
  runLayer,
  sampleChannel,
  sampleLayer,
  setLayer,
  type LayerState,
} from './layer';
import {
  createMotionRuntimeOptions,
  createPlaybackPlans,
  createRuntimeConfig,
  getCachedAnimationPlan,
  getTransitionSpec,
  stableSerialize,
  type AnimationPlan,
  type StrxCompiledAnimation,
  type RuntimeConfig,
  type TransitionSpec,
} from './plan';

type TransformEntry = NonNullable<ViewStyle['transform']>[number];

/**
 * Options passed when playing a compiled animation through a controller.
 */
export interface StrxAnimationPlayOptions {
  /**
   * Extra delay, in milliseconds, added before the animation starts.
   */
  offset?: number;
  /**
   * Number of times to play the animation.
   *
   * Use `"infinite"` to repeat until `stop()` is called.
   */
  playCount?: number | 'infinite';
  /**
   * Called on the JS thread when the animation finishes. Not called when the
   * animation is stopped, reset, or replaced before finishing.
   */
  onFinish?: () => void;
}

/**
 * Imperative animation controller used by STRX event timelines.
 */
export interface StrxAnimationController {
  /**
   * Plays a compiled animation from its `from` frame to its `to` frame.
   */
  play: (
    animation: StrxCompiledAnimation,
    options?: StrxAnimationPlayOptions,
  ) => void;
  /**
   * Plays a compiled animation back toward its `from` frame.
   *
   * If this animation is the one currently applied, it reverses from the
   * current position; otherwise it plays the full `to -> from` pass.
   */
  reverse: (
    animation: StrxCompiledAnimation,
    options?: StrxAnimationPlayOptions,
  ) => void;
  /**
   * Clears values applied by event-driven playback, or immediately applies a
   * compiled animation's `from` frame when provided.
   */
  reset: (animation?: StrxCompiledAnimation) => void;
  /**
   * Cancels pending starts and freezes running animations where they are.
   */
  stop: () => void;
}

/**
 * Runtime animation engine returned by `useStrxAnimationEngine`.
 */
export interface StrxAnimationEngine {
  /** Animated style that should be merged after the component's static style. */
  animatedStyle: ReturnType<typeof useAnimatedStyle<ViewStyle>>;
  /** Imperative controller used by `Strx.useTimeline`. */
  controller: StrxAnimationController;
}

/**
 * Creates the full STRX animation engine for a component.
 *
 * The engine drives two independent layers, each interpolated by its own
 * progress value on the UI thread:
 *
 * - the **explicit** layer plays presets, `from:/to:` keyframes, `playback`
 *   phases, and timeline controller animations
 * - the **transition** layer animates `transition-*` changes of the static
 *   `style` prop, starting from the currently displayed values
 *
 * Because style changes only touch the transition layer, they never replay
 * explicit animations, and interrupted transitions continue without jumps.
 */
export function useStrxAnimationEngine(
  animate?: AnimateProp | null,
  style?: AnimatableStaticStyle,
  playback: PlaybackMode = 'parallel',
  interval = 100,
): StrxAnimationEngine {
  const motion = useStrxMotion();
  const motionOptions = useMemo(
    () => createMotionRuntimeOptions(motion),
    [motion],
  );

  // Inline array/object `animate` values change identity every render, so
  // derived values are memoized by serialized keys rather than references.
  const nextTransitionSpec = getTransitionSpec(animate, motionOptions);
  const transitionSpecKey = stableSerialize(nextTransitionSpec);
  const transitionSpec = useMemo(
    () => nextTransitionSpec,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transitionSpecKey],
  );

  const flattenedStyle = flattenAnimatableStyle(style);
  const styleKey = stableSerialize(flattenedStyle);
  const staticFrame = useMemo(
    () => normalizeFrame(flattenedStyle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [styleKey],
  );
  const transitionFrame = useMemo(
    () =>
      transitionSpec.enabled
        ? filterFrameByTransitionKind(staticFrame, transitionSpec.kind)
        : null,
    [staticFrame, transitionSpec],
  );

  const animationKey = stableSerialize({
    animate,
    playback,
    interval,
    motionOptions,
    presets: getPresetRegistryVersion(),
  });
  const playbackPlans = useMemo(
    () =>
      playback !== 'parallel' && Array.isArray(animate)
        ? createPlaybackPlans(animate, playback, interval, motionOptions)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationKey],
  );
  const explicitPlan = useMemo(
    () =>
      playbackPlans
        ? null
        : getCachedAnimationPlan(animationKey, animate, motionOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationKey, playbackPlans],
  );

  // The first paint already shows the `from` frame, so mount animations never
  // flash their final state before starting.
  const [initialExplicitLayer] = useState(() => {
    const firstPlan =
      explicitPlan ??
      (playbackPlans?.[0]?.offset === 0 ? playbackPlans[0].plan : null);

    return firstPlan
      ? createLayerState(firstPlan.from, firstPlan.to)
      : EMPTY_LAYER;
  });

  const base = useSharedValue<AnimationFrame>(staticFrame);
  const explicitState = useSharedValue<LayerState>(initialExplicitLayer);
  const explicitProgress = useSharedValue(0);
  const transitionState = useSharedValue<LayerState>(EMPTY_LAYER);
  const transitionProgress = useSharedValue(1);

  const explicitLayerRef = useRef<LayerState>(initialExplicitLayer);
  const activePlanRef = useRef<AnimationPlan | null>(null);
  const transitionLayerRef = useRef<LayerState>(EMPTY_LAYER);
  const previousTransitionFrameRef = useRef<AnimationFrame | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }

    timersRef.current = [];
  }, []);

  const playExplicit = useCallback(
    (
      plan: AnimationPlan,
      config: RuntimeConfig,
      direction: 'forward' | 'reverse',
      onFinish?: () => void,
    ) => {
      const resume = direction === 'reverse' && activePlanRef.current === plan;
      const state = resume
        ? null
        : createLayerState(plan.from, plan.to, explicitLayerRef.current);

      if (state) {
        explicitLayerRef.current = state;
      }

      activePlanRef.current = plan;
      runLayer(
        explicitState,
        explicitProgress,
        state,
        resume ? null : direction === 'forward' ? 0 : 1,
        direction === 'forward' ? 1 : 0,
        config,
        onFinish,
      );
    },
    [explicitProgress, explicitState],
  );

  const clearExplicit = useCallback(() => {
    const state = createLayerState(
      emptyFrame(),
      emptyFrame(),
      explicitLayerRef.current,
    );

    explicitLayerRef.current = state;
    activePlanRef.current = null;
    setLayer(explicitState, explicitProgress, state, 1);
  }, [explicitProgress, explicitState]);

  // Explicit animations: replay only when the animation itself changes.
  useLayoutEffect(() => {
    if (playbackPlans) {
      return;
    }

    if (!explicitPlan) {
      if (explicitLayerRef.current.keys.length > 0) {
        clearExplicit();
      }
      return;
    }

    playExplicit(explicitPlan, createRuntimeConfig(explicitPlan), 'forward');
  }, [clearExplicit, explicitPlan, playExplicit, playbackPlans]);

  // Serial/stagger playback of array entries.
  useLayoutEffect(() => {
    if (!playbackPlans) {
      return;
    }

    clearTimers();

    if (playbackPlans.length === 0) {
      clearExplicit();
      return;
    }

    for (const phase of playbackPlans) {
      const start = () =>
        playExplicit(phase.plan, createRuntimeConfig(phase.plan), 'forward');

      if (phase.offset <= 0) {
        start();
      } else {
        timersRef.current.push(setTimeout(start, phase.offset));
      }
    }

    return clearTimers;
  }, [clearExplicit, clearTimers, playExplicit, playbackPlans]);

  // Keep the static style available to the UI thread for released channels
  // and for composing static transforms with animated ones.
  useLayoutEffect(() => {
    base.value = staticFrame;
  }, [base, staticFrame]);

  // Implicit `transition-*` animations of static style changes.
  useLayoutEffect(() => {
    const previousFrame = previousTransitionFrameRef.current;
    previousTransitionFrameRef.current = transitionFrame;

    if (!transitionFrame) {
      if (transitionLayerRef.current.keys.length > 0) {
        const state = createLayerState(
          emptyFrame(),
          emptyFrame(),
          transitionLayerRef.current,
        );

        transitionLayerRef.current = state;
        setLayer(transitionState, transitionProgress, state, 1);
      }
      return;
    }

    if (!previousFrame || framesEqual(previousFrame, transitionFrame)) {
      return;
    }

    const pair = createTransitionPair(
      previousFrame,
      transitionFrame,
      sampleLayer(transitionLayerRef.current, transitionProgress.value),
    );
    const state = createLayerState(
      pair.from,
      pair.to,
      transitionLayerRef.current,
    );

    transitionLayerRef.current = state;
    runLayer(
      transitionState,
      transitionProgress,
      state,
      0,
      1,
      createTransitionRuntimeConfig(transitionSpec),
    );
  }, [transitionFrame, transitionProgress, transitionSpec, transitionState]);

  useEffect(
    () => () => {
      clearTimers();
      cancelAnimation(explicitProgress);
      cancelAnimation(transitionProgress);
    },
    [clearTimers, explicitProgress, transitionProgress],
  );

  const controller = useMemo<StrxAnimationController>(
    () => ({
      play: (animation, options = {}) => {
        clearTimers();
        playExplicit(
          animation.plan,
          createRuntimeConfig(
            withPlayCount(animation.plan, options.playCount),
            options.offset ?? 0,
          ),
          'forward',
          options.onFinish,
        );
      },
      reverse: (animation, options = {}) => {
        clearTimers();
        playExplicit(
          animation.plan,
          createRuntimeConfig(
            withPlayCount(animation.plan, options.playCount),
            options.offset ?? 0,
          ),
          'reverse',
          options.onFinish,
        );
      },
      reset: animation => {
        clearTimers();

        if (!animation) {
          clearExplicit();
          return;
        }

        const state = createLayerState(
          animation.plan.from,
          animation.plan.to,
          explicitLayerRef.current,
        );

        explicitLayerRef.current = state;
        activePlanRef.current = animation.plan;
        setLayer(explicitState, explicitProgress, state, 0);
      },
      stop: () => {
        clearTimers();
        cancelAnimation(explicitProgress);
      },
    }),
    [clearExplicit, clearTimers, explicitProgress, explicitState, playExplicit],
  );

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const result: Record<string, unknown> = {};
    const transforms: Record<string, AnimatableValue> = {};
    const staticValues = base.value;
    const layers = [explicitState.value, transitionState.value];
    const progresses = [explicitProgress.value, transitionProgress.value];
    let hasTransform = false;

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
      const layer = layers[layerIndex]!;
      const progress = progresses[layerIndex]!;

      for (const key of layer.releasedStyleKeys) {
        if (!(key in result)) {
          result[key] = staticValues.style[key];
        }
      }

      if (layer.releasedTransform) {
        hasTransform = true;
      }

      for (let index = 0; index < layer.keys.length; index += 1) {
        const value = sampleChannel(layer, index, progress);

        if (layer.isTransform[index]) {
          transforms[layer.keys[index]!] = value;
          hasTransform = true;
        } else {
          result[layer.keys[index]!] = value;
        }
      }
    }

    if (hasTransform) {
      const transform: TransformEntry[] = [];

      for (const key of TRANSFORM_KEYS) {
        const value = transforms[key] ?? staticValues.transform[key];

        if (value !== undefined) {
          transform.push({ [key]: value } as unknown as TransformEntry);
        }
      }

      result.transform = transform;
    }

    return result as ViewStyle;
  });

  return { animatedStyle, controller };
}

/**
 * Returns the animated style for a STRX `animate` declaration.
 *
 * This is a lower-level hook exported for custom integrations. Most users
 * should prefer STRX components or `createStrxComponent`.
 */
export function useStrxAnimation(
  animate?: AnimateProp | null,
  style?: AnimatableStaticStyle,
  playback: PlaybackMode = 'parallel',
  interval = 100,
) {
  return useStrxAnimationEngine(animate, style, playback, interval)
    .animatedStyle;
}

function withPlayCount(
  plan: AnimationPlan,
  playCount: number | 'infinite' | undefined,
): AnimationPlan {
  return playCount === undefined ? plan : { ...plan, playCount };
}

function createTransitionRuntimeConfig(spec: TransitionSpec): RuntimeConfig {
  return {
    duration: spec.duration,
    delay: spec.delay,
    easing: spec.easing,
    repeat: 1,
    driver: 'timing',
    damping: 10,
    stiffness: 100,
    mass: 1,
  };
}

/**
 * Builds the from/to frames for a transition.
 *
 * Every channel that changed, plus every channel the transition layer still
 * controls, animates from its currently displayed value (`current`) or, for
 * channels not yet controlled, from the previous static value. Channels that
 * appear or disappear are completed with neutral values.
 */
function createTransitionPair(
  previous: AnimationFrame,
  next: AnimationFrame,
  current: AnimationFrame,
): { from: AnimationFrame; to: AnimationFrame } {
  const from = emptyFrame();
  const to = emptyFrame();

  for (const key of new Set([
    ...Object.keys(previous.style),
    ...Object.keys(next.style),
    ...Object.keys(current.style),
  ])) {
    if (!(key in next.style) && !(key in previous.style)) {
      continue;
    }

    const start = current.style[key] ?? previous.style[key];
    const end = next.style[key];

    if (start !== undefined) {
      from.style[key] = start;
    }

    if (end !== undefined) {
      to.style[key] = end;
    }
  }

  for (const key of TRANSFORM_KEYS) {
    const start = current.transform[key] ?? previous.transform[key];
    const end = next.transform[key];

    if (start !== undefined) {
      from.transform[key] = start;
    }

    if (end !== undefined) {
      to.transform[key] = end;
    }
  }

  const style = completeStylePair(from.style, to.style);
  const transform = completeTransformPair(from.transform, to.transform);

  return {
    from: { style: style.from, transform: transform.from },
    to: { style: style.to, transform: transform.to },
  };
}

function framesEqual(a: AnimationFrame, b: AnimationFrame): boolean {
  return stableSerialize(a) === stableSerialize(b);
}
