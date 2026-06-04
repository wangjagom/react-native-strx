import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { animationPresets } from './presets';
import type { AnimatableChannel, PresetMotionOptions } from './presets';
import { normalizeAnimate } from '../parser/normalize';
import type { StandardAnimConfig } from '../parser/normalize';
import type { AnimateProp, AnimateStyle } from '../types/animate';

type AnimatableValue = number | string;
type AnimationDriver = 'timing' | 'spring';
type TransformEntry = NonNullable<ViewStyle['transform']>[number];
type StyleMap = Record<string, AnimatableValue>;
type TransformMap = Partial<Record<TransformKey, AnimatableValue>>;
type AnimatableStaticStyle = StyleProp<ViewStyle | TextStyle>;

interface AnimationFrame {
  style: StyleMap;
  transform: TransformMap;
}

interface AnimationPlan {
  duration: number;
  delay: number;
  easing: string;
  repeat?: number | 'infinite';
  driver: AnimationDriver;
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  from: AnimationFrame;
  to: AnimationFrame;
}

interface RuntimeTarget {
  animate: boolean;
  style: StyleMap;
  transform: TransformMap;
  unsetStyleKeys: string[];
  unsetTransformKeys: TransformKey[];
}

interface RuntimeConfig {
  duration: number;
  delay: number;
  easing: string;
  repeat: number;
  driver: AnimationDriver;
  damping: number;
  stiffness: number;
  mass: number;
}

const DEFAULT_DURATION = 300;
const DEFAULT_DELAY = 0;
const DEFAULT_EASING = 'ease-out';
const PLAN_CACHE_LIMIT = 256;
const TRANSITION_CACHE_LIMIT = 256;

type TransitionKind =
  | 'all'
  | 'colors'
  | 'opacity'
  | 'transform'
  | 'spacing'
  | 'layout';

interface TransitionSpec {
  enabled: boolean;
  kind: TransitionKind;
  duration: number;
  delay: number;
  easing: string;
}

const ANIMATABLE_STYLE_KEYS = [
  'opacity',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'top',
  'right',
  'bottom',
  'left',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
] as const;

const TRANSFORM_KEYS = [
  'perspective',
  'translateX',
  'translateY',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skewX',
  'skewY',
] as const;

type TransformKey = (typeof TRANSFORM_KEYS)[number];

const ANIMATABLE_STYLE_KEY_SET = new Set<string>(ANIMATABLE_STYLE_KEYS);
const TRANSFORM_KEY_SET = new Set<string>(TRANSFORM_KEYS);
const PLAN_CACHE = new Map<string, AnimationPlan | null>();
const TRANSITION_SPEC_CACHE = new Map<string, TransitionSpec>();

const DISABLED_TRANSITION_SPEC: TransitionSpec = Object.freeze({
  enabled: false,
  kind: 'all',
  duration: DEFAULT_DURATION,
  delay: DEFAULT_DELAY,
  easing: DEFAULT_EASING,
});

const emptyFrame = (): AnimationFrame => ({
  style: {},
  transform: {},
});

const emptyRuntimeTarget = (): RuntimeTarget => ({
  animate: false,
  style: {},
  transform: {},
  unsetStyleKeys: [],
  unsetTransformKeys: [],
});

export function useCodexAnimation(
  animate?: AnimateProp | null,
  style?: AnimatableStaticStyle,
) {
  const transitionSpec = useMemo(() => getTransitionSpec(animate), [animate]);
  const explicitAnimate = useMemo(
    () => removeTransitionTokensFromAnimate(animate),
    [animate],
  );
  const flattenedStyle = useMemo(() => flattenAnimatableStyle(style), [style]);
  const styleKey = useMemo(
    () => stableSerialize(flattenedStyle),
    [flattenedStyle],
  );
  const previousStyleFrameRef = useRef<AnimationFrame | null>(null);

  // 1. 객체의 구조적 동등성을 판별하기 위한 직렬화 키 생성
  const animationKey = useMemo(
    () => stableSerialize(explicitAnimate),
    [explicitAnimate],
  );

  // 2. 직렬화된 키가 변경될 때만 object 파싱을 재수행 (인라인 객체 참조값 변경으로 인한 불필요한 연산 방지)
  const explicitPlan = useMemo(() => {
    return getCachedAnimationPlan(animationKey, explicitAnimate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey]);

  const transitionFrame = useMemo(() => {
    const normalizedFrame = normalizeFrame(flattenedStyle);

    return transitionSpec.enabled
      ? filterFrameByTransitionKind(normalizedFrame, transitionSpec.kind)
      : normalizedFrame;
    // styleKey intentionally represents flattenedStyle structural equality.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey, transitionSpec]);

  const implicitPlan = useMemo(() => {
    if (!transitionSpec.enabled) {
      return null;
    }

    const previousFrame = previousStyleFrameRef.current;

    if (!previousFrame) {
      return null;
    }

    return createImplicitTransitionPlan(
      previousFrame,
      transitionFrame,
      transitionSpec,
    );
  }, [transitionFrame, transitionSpec]);

  useLayoutEffect(() => {
    previousStyleFrameRef.current = transitionFrame;
  }, [transitionFrame]);

  const plan = useMemo(() => {
    if (explicitPlan && implicitPlan) {
      return mergeAnimationPlan(explicitPlan, implicitPlan);
    }

    return implicitPlan ?? explicitPlan;
  }, [explicitPlan, implicitPlan]);
  const previousKeysRef = useRef<{
    styleKeys: string[];
    transformKeys: TransformKey[];
  }>({
    styleKeys: [],
    transformKeys: [],
  });

  const target = useSharedValue<RuntimeTarget>(emptyRuntimeTarget());
  const config = useSharedValue<RuntimeConfig>({
    duration: DEFAULT_DURATION,
    delay: DEFAULT_DELAY,
    easing: DEFAULT_EASING,
    repeat: 1,
    driver: 'timing',
    damping: 10,
    stiffness: 100,
    mass: 1,
  });

  const shouldUseDoubleFrame = explicitPlan !== null;

  useLayoutEffect(() => {
    cancelAnimation(target);

    if (!plan) {
      if (transitionSpec.enabled) {
        const nextKeys = collectFrameKeys(transitionFrame);
        const staleStyleKeys = previousKeysRef.current.styleKeys.filter(
          key => !nextKeys.styleKeys.includes(key),
        );
        const staleTransformKeys = previousKeysRef.current.transformKeys.filter(
          key => !nextKeys.transformKeys.includes(key),
        );

        target.value = createRuntimeTarget(
          transitionFrame,
          staleStyleKeys,
          staleTransformKeys,
          false,
        );
        previousKeysRef.current = nextKeys;
        return () => {
          cancelAnimation(target);
        };
      }

      target.value = createUnsetTarget(
        previousKeysRef.current.styleKeys,
        previousKeysRef.current.transformKeys,
      );
      previousKeysRef.current = {
        styleKeys: [],
        transformKeys: [],
      };
      return;
    }

    const nextKeys = collectPlanKeys(plan);
    const staleStyleKeys = previousKeysRef.current.styleKeys.filter(
      key => !nextKeys.styleKeys.includes(key),
    );
    const staleTransformKeys = previousKeysRef.current.transformKeys.filter(
      key => !nextKeys.transformKeys.includes(key),
    );

    config.value = {
      duration: plan.duration,
      delay: plan.delay,
      easing: plan.easing,
      repeat: normalizeRepeat(plan.repeat),
      driver: plan.driver,
      damping: plan.spring.damping,
      stiffness: plan.spring.stiffness,
      mass: plan.spring.mass,
    };

    // 1. 먼저 시작점(from) 스타일을 주입하고 애니메이션 대기 상태(false)로 둡니다.
    target.value = createRuntimeTarget(
      plan.from,
      staleStyleKeys,
      staleTransformKeys,
      false,
    );
    previousKeysRef.current = nextKeys;

    let frame2: number | undefined;

    const startToAnimation = () => {
      target.value = createRuntimeTarget(
        plan.to,
        staleStyleKeys,
        staleTransformKeys,
        true,
      );
    };

    const frame = requestAnimationFrame(() => {
      if (shouldUseDoubleFrame) {
        frame2 = requestAnimationFrame(startToAnimation);
        return;
      }

      startToAnimation();
    });

    return () => {
      cancelAnimationFrame(frame);
      if (frame2 !== undefined) {
        cancelAnimationFrame(frame2);
      }
      cancelAnimation(target);
    };
  }, [config, plan, shouldUseDoubleFrame, target, transitionFrame, transitionSpec]);

  return useAnimatedStyle<ViewStyle>(() => {
    const runtimeTarget = target.value;
    const runtimeConfig = config.value;
    const styleResult: Record<string, unknown> = {};

    for (const key of runtimeTarget.unsetStyleKeys) {
      styleResult[key] = undefined;
    }

    for (const key of Object.keys(runtimeTarget.style)) {
      const value = runtimeTarget.style[key];
      styleResult[key] = runtimeTarget.animate
        ? animateValue(value, runtimeConfig)
        : value;
    }

    const transform: TransformEntry[] = [];

    for (const key of TRANSFORM_KEYS) {
      const value = runtimeTarget.transform[key];

      if (value === undefined) {
        continue;
      }

      transform.push(
        transformEntryForKey(
          key,
          runtimeTarget.animate ? animateValue(value, runtimeConfig) : value,
        ),
      );
    }

    if (transform.length > 0 || runtimeTarget.unsetTransformKeys.length > 0) {
      styleResult.transform = transform;
    }

    return styleResult as ViewStyle;
  });
}

function getCachedAnimationPlan(
  animationKey: string,
  animate?: AnimateProp | null,
): AnimationPlan | null {
  if (PLAN_CACHE.has(animationKey)) {
    return PLAN_CACHE.get(animationKey) ?? null;
  }

  const configs = normalizeAnimate(animate);
  const plan = createAnimationPlan(configs);
  setCappedMapValue(PLAN_CACHE, animationKey, plan, PLAN_CACHE_LIMIT);

  return plan;
}

function createAnimationPlan(
  configs: StandardAnimConfig[],
): AnimationPlan | null {
  if (configs.length === 0) {
    return null;
  }

  let plan: AnimationPlan | null = null;

  for (const config of configs) {
    const nextPlan = isCustomConfig(config)
      ? createCustomAnimationPlan(config)
      : createPresetAnimationPlan(config);

    if (!nextPlan) {
      continue;
    }

    plan = plan ? mergeAnimationPlan(plan, nextPlan) : nextPlan;
  }

  return plan;
}

function createImplicitTransitionPlan(
  previousFrame: AnimationFrame,
  nextFrame: AnimationFrame,
  transitionSpec: TransitionSpec,
): AnimationPlan | null {
  const from = filterChangedFrame(previousFrame, nextFrame);
  const to = filterChangedFrame(nextFrame, previousFrame);

  if (
    Object.keys(from.style).length === 0 &&
    Object.keys(from.transform).length === 0
  ) {
    return null;
  }

  const completedStyle = completeStylePair(from.style, to.style);
  const completedTransform = completeTransformPair(
    from.transform,
    to.transform,
  );

  return {
    duration: transitionSpec.duration,
    delay: transitionSpec.delay,
    easing: transitionSpec.easing,
    repeat: 1,
    driver: 'timing',
    spring: getSpringConfig(),
    from: {
      style: completedStyle.from,
      transform: completedTransform.from,
    },
    to: {
      style: completedStyle.to,
      transform: completedTransform.to,
    },
  };
}

function filterChangedFrame(
  source: AnimationFrame,
  comparison: AnimationFrame,
): AnimationFrame {
  const frame = emptyFrame();

  for (const key of Object.keys(source.style)) {
    if (source.style[key] !== comparison.style[key]) {
      frame.style[key] = source.style[key];
    }
  }

  for (const key of TRANSFORM_KEYS) {
    if (source.transform[key] !== comparison.transform[key]) {
      frame.transform[key] = source.transform[key];
    }
  }

  return frame;
}

function filterFrameByTransitionKind(
  frame: AnimationFrame,
  kind: TransitionKind,
): AnimationFrame {
  if (kind === 'all') {
    return frame;
  }

  const filtered = emptyFrame();

  for (const key of Object.keys(frame.style)) {
    if (shouldTransitionStyleKey(key, kind)) {
      filtered.style[key] = frame.style[key];
    }
  }

  for (const key of TRANSFORM_KEYS) {
    const value = frame.transform[key];

    if (value !== undefined && shouldTransitionTransformKey(kind)) {
      filtered.transform[key] = value;
    }
  }

  return filtered;
}

function shouldTransitionStyleKey(key: string, kind: TransitionKind): boolean {
  if (kind === 'colors') {
    return key.toLowerCase().includes('color');
  }

  if (kind === 'opacity') {
    return key === 'opacity';
  }

  if (kind === 'spacing') {
    return key.startsWith('margin') || key.startsWith('padding');
  }

  if (kind === 'layout') {
    return (
      key === 'width' ||
      key === 'height' ||
      key === 'minWidth' ||
      key === 'minHeight' ||
      key === 'maxWidth' ||
      key === 'maxHeight' ||
      key === 'top' ||
      key === 'right' ||
      key === 'bottom' ||
      key === 'left'
    );
  }

  return false;
}

function shouldTransitionTransformKey(kind: TransitionKind): boolean {
  return kind === 'all' || kind === 'transform';
}

function flattenAnimatableStyle(style?: AnimatableStaticStyle): AnimateStyle {
  const flattened = StyleSheet.flatten(style) as AnimateStyle | undefined;

  return flattened ?? {};
}

function getTransitionSpec(animate?: AnimateProp | null): TransitionSpec {
  if (typeof animate !== 'string' || animate.length > 512) {
    return DISABLED_TRANSITION_SPEC;
  }

  const cached = TRANSITION_SPEC_CACHE.get(animate);

  if (cached) {
    return cached;
  }

  const spec = parseTransitionSpec(animate);
  setCappedMapValue(
    TRANSITION_SPEC_CACHE,
    animate,
    spec,
    TRANSITION_CACHE_LIMIT,
  );

  return spec;
}

function parseTransitionSpec(animate: string): TransitionSpec {
  let enabled = false;
  let kind: TransitionKind = 'all';
  let duration = DEFAULT_DURATION;
  let delay = DEFAULT_DELAY;
  let easing = DEFAULT_EASING;

  forEachToken(animate, token => {
    if (token === 'transition' || token === 'transition-all') {
      enabled = true;
      kind = 'all';
      return;
    }

    if (token === 'transition-colors') {
      enabled = true;
      kind = 'colors';
      return;
    }

    if (token === 'transition-opacity') {
      enabled = true;
      kind = 'opacity';
      return;
    }

    if (token === 'transition-transform') {
      enabled = true;
      kind = 'transform';
      return;
    }

    if (token === 'transition-spacing') {
      enabled = true;
      kind = 'spacing';
      return;
    }

    if (token === 'transition-layout') {
      enabled = true;
      kind = 'layout';
      return;
    }

    if (token.startsWith('duration-')) {
      duration = getNumericValue(
        Number(token.slice('duration-'.length)),
        duration,
      );
      return;
    }

    if (token.startsWith('delay-')) {
      delay = getNumericValue(Number(token.slice('delay-'.length)), delay);
      return;
    }

    if (
      token === 'linear' ||
      token === 'ease' ||
      token === 'ease-in' ||
      token === 'ease-out' ||
      token === 'ease-in-out'
    ) {
      easing = token;
    }
  });

  if (!enabled) {
    return DISABLED_TRANSITION_SPEC;
  }

  return Object.freeze({
    enabled,
    kind,
    duration,
    delay,
    easing,
  });
}

function removeTransitionTokensFromAnimate(
  animate?: AnimateProp | null,
): AnimateProp | null | undefined {
  if (typeof animate !== 'string' || animate.length > 512) {
    return animate;
  }

  let result = '';

  forEachToken(animate, token => {
    if (isTransitionToken(token)) {
      return;
    }

    result = result.length === 0 ? token : `${result} ${token}`;
  });

  return result.length > 0 ? result : undefined;
}

function forEachToken(input: string, visitor: (token: string) => void): void {
  let tokenStart = -1;

  for (let index = 0; index <= input.length; index += 1) {
    const charCode = index < input.length ? input.charCodeAt(index) : 32;
    const isBoundary =
      charCode === 32 ||
      charCode === 9 ||
      charCode === 10 ||
      charCode === 13 ||
      charCode === 44;

    if (!isBoundary && tokenStart === -1) {
      tokenStart = index;
    }

    if ((isBoundary || index === input.length) && tokenStart !== -1) {
      visitor(input.slice(tokenStart, index));
      tokenStart = -1;
    }
  }
}

function isTransitionToken(token: string): boolean {
  return (
    token === 'transition' ||
    token === 'transition-all' ||
    token === 'transition-colors' ||
    token === 'transition-opacity' ||
    token === 'transition-transform' ||
    token === 'transition-spacing' ||
    token === 'transition-layout'
  );
}

function setCappedMapValue<Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value,
  limit: number,
): void {
  if (cache.has(key)) {
    cache.delete(key);
  }

  while (cache.size >= limit) {
    const firstKey = cache.keys().next().value as Key | undefined;

    if (firstKey === undefined) {
      break;
    }

    cache.delete(firstKey);
  }

  cache.set(key, value);
}

function createPresetAnimationPlan(
  config: StandardAnimConfig,
): AnimationPlan | null {
  if (!('type' in config) || typeof config.type !== 'string') {
    return null;
  }

  const preset = animationPresets[config.type];

  if (!preset) {
    return null;
  }

  const from = emptyFrame();
  const to = emptyFrame();

  for (const channel of Object.keys(preset.target) as AnimatableChannel[]) {
    const isTransform = isTransformKey(channel);
    const neutral = isTransform
      ? neutralTransformValue(channel)
      : neutralStyleValue(channel);

    const fallbackFrom = preset.initial[channel] ?? neutral;
    const fallbackTo = preset.target[channel] ?? neutral;

    if (isTransform) {
      from.transform[channel] = getAnimatableValue(fallbackFrom, fallbackFrom);
      to.transform[channel] = getAnimatableValue(fallbackTo, fallbackTo);
    } else {
      from.style[channel] = getAnimatableValue(fallbackFrom, fallbackFrom);
      to.style[channel] = getAnimatableValue(fallbackTo, fallbackTo);
    }
  }

  return {
    duration: getDuration(config, preset.options),
    delay: getDelay(config),
    easing: getEasingName(config.easing),
    repeat: config.repeat,
    driver: getAnimationDriver(config, preset.options),
    spring: getSpringConfig(config, preset.options),
    from,
    to,
  };
}

function createCustomAnimationPlan(
  config: Extract<StandardAnimConfig, { from: AnimateStyle; to: AnimateStyle }>,
): AnimationPlan {
  const pair = completeFramePair(config.from, config.to);

  return {
    duration: getDuration(config),
    delay: getDelay(config),
    easing: getEasingName(config.easing),
    repeat: config.repeat,
    driver: 'timing',
    spring: getSpringConfig(config),
    from: pair.from,
    to: pair.to,
  };
}

function mergeAnimationPlan(
  base: AnimationPlan,
  next: AnimationPlan,
): AnimationPlan {
  return {
    ...next,
    from: mergeFrame(base.from, next.from),
    to: mergeFrame(base.to, next.to),
  };
}

function normalizeFrame(style: AnimateStyle): AnimationFrame {
  const source = style as Record<string, unknown>;
  const frame = emptyFrame();

  Object.assign(frame.transform, normalizeTransformArray(style.transform));

  for (const key of Object.keys(source)) {
    if (key === 'transform') {
      continue;
    }

    const value = source[key];

    if (!isAnimatableValue(value)) {
      continue;
    }

    if (isTransformKey(key)) {
      frame.transform[key] = value;
      continue;
    }

    if (ANIMATABLE_STYLE_KEY_SET.has(key)) {
      frame.style[key] = value;
    }
  }

  return frame;
}

function normalizeTransformArray(
  transform: ViewStyle['transform'],
): TransformMap {
  const transformMap: TransformMap = {};

  if (!Array.isArray(transform)) {
    return transformMap;
  }

  for (const entry of transform) {
    if (!isRecord(entry)) {
      continue;
    }

    for (const key of Object.keys(entry)) {
      const value = entry[key];

      if (isTransformKey(key) && isAnimatableValue(value)) {
        transformMap[key] = value;
      }
    }
  }

  return transformMap;
}

function completeFramePair(
  fromStyle: AnimateStyle,
  toStyle: AnimateStyle,
): { from: AnimationFrame; to: AnimationFrame } {
  const from = normalizeFrame(fromStyle);
  const to = normalizeFrame(toStyle);
  const completedStyle = completeStylePair(from.style, to.style);
  const completedTransform = completeTransformPair(
    from.transform,
    to.transform,
  );

  return {
    from: {
      style: completedStyle.from,
      transform: completedTransform.from,
    },
    to: {
      style: completedStyle.to,
      transform: completedTransform.to,
    },
  };
}

function completeStylePair(
  from: StyleMap,
  to: StyleMap,
): { from: StyleMap; to: StyleMap } {
  const completedFrom: StyleMap = {};
  const completedTo: StyleMap = {};
  const keys = new Set([...Object.keys(from), ...Object.keys(to)]);

  for (const key of keys) {
    completedFrom[key] = from[key] ?? neutralStyleValue(key);
    completedTo[key] = to[key] ?? neutralStyleValue(key);
  }

  return {
    from: completedFrom,
    to: completedTo,
  };
}

function completeTransformPair(
  from: TransformMap,
  to: TransformMap,
): { from: TransformMap; to: TransformMap } {
  const completedFrom: TransformMap = {};
  const completedTo: TransformMap = {};

  for (const key of TRANSFORM_KEYS) {
    if (from[key] === undefined && to[key] === undefined) {
      continue;
    }

    completedFrom[key] = from[key] ?? neutralTransformValue(key);
    completedTo[key] = to[key] ?? neutralTransformValue(key);
  }

  return {
    from: completedFrom,
    to: completedTo,
  };
}

function mergeFrame(
  base: AnimationFrame,
  next: AnimationFrame,
): AnimationFrame {
  return {
    style: {
      ...base.style,
      ...next.style,
    },
    transform: {
      ...base.transform,
      ...next.transform,
    },
  };
}

function createRuntimeTarget(
  frame: AnimationFrame,
  unsetStyleKeys: string[],
  unsetTransformKeys: TransformKey[],
  animate: boolean,
): RuntimeTarget {
  return {
    animate,
    style: frame.style,
    transform: frame.transform,
    unsetStyleKeys,
    unsetTransformKeys,
  };
}

function createUnsetTarget(
  unsetStyleKeys: string[],
  unsetTransformKeys: TransformKey[],
): RuntimeTarget {
  return {
    animate: false,
    style: {},
    transform: {},
    unsetStyleKeys,
    unsetTransformKeys,
  };
}

function collectPlanKeys(plan: AnimationPlan): {
  styleKeys: string[];
  transformKeys: TransformKey[];
} {
  const styleKeys = new Set<string>();
  const transformKeys = new Set<TransformKey>();

  for (const key of Object.keys(plan.from.style)) {
    styleKeys.add(key);
  }

  for (const key of Object.keys(plan.to.style)) {
    styleKeys.add(key);
  }

  for (const key of TRANSFORM_KEYS) {
    if (
      plan.from.transform[key] !== undefined ||
      plan.to.transform[key] !== undefined
    ) {
      transformKeys.add(key);
    }
  }

  return {
    styleKeys: Array.from(styleKeys),
    transformKeys: Array.from(transformKeys),
  };
}

function collectFrameKeys(frame: AnimationFrame): {
  styleKeys: string[];
  transformKeys: TransformKey[];
} {
  const transformKeys: TransformKey[] = [];

  for (const key of TRANSFORM_KEYS) {
    if (frame.transform[key] !== undefined) {
      transformKeys.push(key);
    }
  }

  return {
    styleKeys: Object.keys(frame.style),
    transformKeys,
  };
}

function animateValue(value: AnimatableValue, config: RuntimeConfig) {
  'worklet';

  const animation =
    config.driver === 'spring' && typeof value === 'number'
      ? withSpring(value, {
          damping: config.damping,
          stiffness: config.stiffness,
          mass: config.mass,
        })
      : withTiming(value, {
          duration: config.duration,
          easing: (t: number) => {
            'worklet';

            if (config.easing === 'linear') {
              return t;
            }

            if (config.easing === 'ease-in') {
              return t * t * t;
            }

            if (config.easing === 'ease-out') {
              return 1 - Math.pow(1 - t, 3);
            }

            if (config.easing === 'ease-in-out') {
              return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            return t * t * (3 - 2 * t);
          },
        });

  const repeated =
    config.repeat === 1
      ? animation
      : withRepeat(animation, config.repeat, false);

  return config.delay > 0 ? withDelay(config.delay, repeated) : repeated;
}

function transformEntryForKey(
  key: TransformKey,
  value: AnimatableValue,
): TransformEntry {
  'worklet';
  return { [key]: value } as unknown as TransformEntry;
}

function getAnimationDriver(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
): AnimationDriver {
  return config?.easing === 'spring' || presetOptions?.driver === 'spring'
    ? 'spring'
    : 'timing';
}

function getDuration(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
): number {
  return getNumericValue(
    config?.duration,
    presetOptions?.duration ?? DEFAULT_DURATION,
  );
}

function getDelay(config?: Partial<StandardAnimConfig>): number {
  return getNumericValue(config?.delay, DEFAULT_DELAY);
}

function getSpringConfig(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
): AnimationPlan['spring'] {
  return {
    damping: getNumericValue(presetOptions?.damping, 10),
    stiffness: getNumericValue(presetOptions?.stiffness, 100),
    mass: getNumericValue(presetOptions?.mass, 1),
  };
}

function getNumericValue(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getAnimatableValue(
  value: unknown,
  fallback: AnimatableValue,
): AnimatableValue {
  return isAnimatableValue(value) ? value : fallback;
}

function normalizeRepeat(repeat: number | 'infinite' | undefined): number {
  if (repeat === 'infinite') {
    return -1;
  }

  return typeof repeat === 'number' && Number.isFinite(repeat) && repeat > 0
    ? repeat
    : 1;
}

function getEasingName(easing?: string): string {
  return easing === 'linear' ||
    easing === 'ease' ||
    easing === 'ease-in' ||
    easing === 'ease-out' ||
    easing === 'ease-in-out'
    ? easing
    : DEFAULT_EASING;
}

function neutralStyleValue(key: string): AnimatableValue {
  if (key === 'opacity' || key.toLowerCase().includes('scale')) {
    return 1;
  }

  if (key.toLowerCase().includes('color')) {
    return 'transparent';
  }

  return 0;
}

function neutralTransformValue(key: TransformKey): AnimatableValue {
  if (key === 'scale' || key === 'scaleX' || key === 'scaleY') {
    return 1;
  }

  if (
    key === 'rotate' ||
    key === 'rotateX' ||
    key === 'rotateY' ||
    key === 'rotateZ' ||
    key === 'skewX' ||
    key === 'skewY'
  ) {
    return '0deg';
  }

  return 0;
}

function isCustomConfig(
  config: StandardAnimConfig,
): config is Extract<
  StandardAnimConfig,
  { from: AnimateStyle; to: AnimateStyle }
> {
  return !('type' in config) && 'from' in config && 'to' in config;
}

function isTransformKey(key: string): key is TransformKey {
  return TRANSFORM_KEY_SET.has(key);
}

function isAnimatableValue(value: unknown): value is AnimatableValue {
  return typeof value === 'number' || typeof value === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`;
  }

  if (typeof value === 'function') {
    return value.name || 'anonymous-function';
  }

  return JSON.stringify(value);
}
