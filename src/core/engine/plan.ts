import { getPreset, type PresetMotionOptions } from '../presets';
import type { AnimatableChannel } from '../presets';
import type { StrxMotionContextValue } from '../../context/StrxMotionContext';
import {
  normalizeAnimate,
  type StandardAnimConfig,
} from '../../parser/normalize';
import { parseAnimate } from '../../parser/resolve';
import type { TransitionKind } from '../../parser/tokens';
import type {
  AnimateProp,
  AnimateStyle,
  PlaybackMode,
} from '../../types/animate';
import { LruCache } from '../../utils/lru';
import {
  completeFramePair,
  emptyFrame,
  isAnimatableValue,
  isRecord,
  isTransformKey,
  mergeFrame,
  neutralStyleValue,
  neutralTransformValue,
  type AnimatableValue,
  type AnimationFrame,
} from './frames';

export type AnimationDriver = 'timing' | 'spring';

export interface CodexCompileOptions {
  duration?: number;
  easing?: string;
  reduceMotionEnabled?: boolean;
}

export interface MotionRuntimeOptions {
  duration?: number;
  easing?: string;
  reduceMotionEnabled: boolean;
}

export interface AnimationPlan {
  duration: number;
  delay: number;
  easing: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
  driver: AnimationDriver;
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  from: AnimationFrame;
  to: AnimationFrame;
}

export interface PlaybackPhase {
  offset: number;
  plan: AnimationPlan;
}

/**
 * Compiled STRX animation plan.
 *
 * Most app code does not need to create this directly. It is useful for
 * timeline integrations that want to compile an `animate` value once and play
 * it later through a controller.
 */
export interface CodexCompiledAnimation {
  /** Normalized animation plan used by the runtime controller. */
  plan: AnimationPlan;
}

export interface TransitionSpec {
  enabled: boolean;
  kind: TransitionKind;
  duration: number;
  delay: number;
  easing: string;
}

/** Timing values handed to the UI-thread progress animation. */
export interface RuntimeConfig {
  duration: number;
  delay: number;
  easing: string;
  repeat: number;
  driver: AnimationDriver;
  damping: number;
  stiffness: number;
  mass: number;
}

export const DEFAULT_DURATION = 300;
export const DEFAULT_DELAY = 0;
export const DEFAULT_EASING = 'ease-out';
export const PLAN_CACHE_LIMIT = 256;
export const PLAN_CACHE = new LruCache<string, AnimationPlan | null>(
  PLAN_CACHE_LIMIT,
);
export const DISABLED_TRANSITION_SPEC: TransitionSpec = Object.freeze({
  enabled: false,
  kind: 'all',
  duration: DEFAULT_DURATION,
  delay: DEFAULT_DELAY,
  easing: DEFAULT_EASING,
});
export const DEFAULT_MOTION_OPTIONS: MotionRuntimeOptions = Object.freeze({
  reduceMotionEnabled: false,
});

/**
 * Compiles any `animate` prop value into a reusable animation plan.
 *
 * Returns `null` when the value does not contain a runnable explicit
 * animation.
 */
export function compileCodexAnimation(
  animate?: AnimateProp | null,
  options: CodexCompileOptions = {},
): CodexCompiledAnimation | null {
  const plan = createAnimationPlan(
    normalizeAnimate(animate),
    normalizeCompileOptions(options),
  );

  return plan ? { plan } : null;
}

/**
 * Creates a reversed compiled animation without reparsing the original input.
 *
 * Timing, easing, driver, spring, and play-count metadata are preserved while
 * the runtime frames are swapped from `to -> from`.
 */
export function reverseCodexAnimation(
  animation: CodexCompiledAnimation,
): CodexCompiledAnimation {
  return {
    plan: {
      ...animation.plan,
      from: animation.plan.to,
      to: animation.plan.from,
    },
  };
}

/**
 * Estimates the total duration of a compiled animation, including delay and
 * repeat/play count where applicable.
 */
export function estimateCodexAnimationDuration(
  animation: CodexCompiledAnimation,
): number {
  return estimatePlanTotalDuration(animation.plan);
}

/**
 * Returns the non-negative delay configured on a compiled animation.
 */
export function estimateCodexAnimationDelay(
  animation: CodexCompiledAnimation,
): number {
  return Math.max(0, animation.plan.delay);
}

export function getCachedAnimationPlan(
  animationKey: string,
  animate?: AnimateProp | null,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): AnimationPlan | null {
  if (PLAN_CACHE.has(animationKey)) {
    return PLAN_CACHE.get(animationKey) ?? null;
  }

  const configs = normalizeAnimate(animate);
  const plan = createAnimationPlan(configs, motionOptions);
  PLAN_CACHE.set(animationKey, plan);

  return plan;
}

export function createAnimationPlan(
  configs: StandardAnimConfig[],
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): AnimationPlan | null {
  if (configs.length === 0) {
    return null;
  }

  let plan: AnimationPlan | null = null;

  for (const config of configs) {
    const nextPlan = isCustomConfig(config)
      ? createCustomAnimationPlan(config, motionOptions)
      : createPresetAnimationPlan(config, motionOptions);

    if (!nextPlan) {
      continue;
    }

    plan = plan ? mergeAnimationPlan(plan, nextPlan) : nextPlan;
  }

  return plan;
}

export function createPlaybackPlans(
  entries: readonly AnimateProp[],
  playback: PlaybackMode,
  interval: number,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): PlaybackPhase[] {
  const phases: PlaybackPhase[] = [];
  let carry = emptyFrame();
  let serialOffset = 0;
  let staggerDelayCarry = 0;
  const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const plan = createAnimationPlan(normalizeAnimate(entry), motionOptions);

    if (!plan) {
      continue;
    }

    const offset =
      playback === 'serial'
        ? serialOffset
        : staggerDelayCarry + index * safeInterval;
    const carriedPlan = createCarriedPlan(plan, carry);

    phases.push({
      offset,
      plan: carriedPlan,
    });

    carry = mergeFrame(carry, plan.to);

    if (playback === 'serial') {
      const duration = estimatePlanTotalDuration(plan);

      if (!Number.isFinite(duration)) {
        break;
      }

      serialOffset += duration;
    } else {
      staggerDelayCarry += Math.max(0, plan.delay);
    }
  }

  return phases;
}

export function createCarriedPlan(
  plan: AnimationPlan,
  carry: AnimationFrame,
): AnimationPlan {
  return {
    ...plan,
    from: mergeFrame(carry, plan.from),
    to: mergeFrame(carry, plan.to),
  };
}

export function estimatePlanTotalDuration(plan: AnimationPlan): number {
  const repeat = normalizeRepeat(getPlanPlayCount(plan));

  if (repeat < 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, plan.delay) + Math.max(0, plan.duration) * repeat;
}

export function getTransitionSpec(
  animate: AnimateProp | null | undefined,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): TransitionSpec {
  const transition = parseAnimate(animate).transition;

  if (!transition) {
    return DISABLED_TRANSITION_SPEC;
  }

  const { timing } = transition;
  const reduceMotion = motionOptions.reduceMotionEnabled;

  return {
    enabled: true,
    kind: transition.kind,
    duration: reduceMotion
      ? 0
      : getNumericValue(
          timing.duration,
          motionOptions.duration ?? DEFAULT_DURATION,
        ),
    delay: reduceMotion ? 0 : getNumericValue(timing.delay, DEFAULT_DELAY),
    easing: getEasingName(timing.easing, motionOptions),
  };
}

export function createPresetAnimationPlan(
  config: StandardAnimConfig,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): AnimationPlan | null {
  if (!('type' in config) || typeof config.type !== 'string') {
    return null;
  }

  const preset = getPreset(config.type);

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
    duration: getDuration(config, preset.options, motionOptions),
    delay: getDelay(config, motionOptions),
    easing: getEasingName(config.easing, motionOptions),
    repeat: getConfigPlayCount(config, motionOptions),
    driver: getAnimationDriver(config, preset.options),
    spring: getSpringConfig(config, preset.options),
    from,
    to,
  };
}

export function createCustomAnimationPlan(
  config: Extract<StandardAnimConfig, { from: AnimateStyle; to: AnimateStyle }>,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): AnimationPlan {
  const pair = completeFramePair(config.from, config.to);

  return {
    duration: getDuration(config, undefined, motionOptions),
    delay: getDelay(config, motionOptions),
    easing: getEasingName(config.easing, motionOptions),
    repeat: getConfigPlayCount(config, motionOptions),
    driver: getAnimationDriver(config),
    spring: getSpringConfig(config),
    from: pair.from,
    to: pair.to,
  };
}

export function mergeAnimationPlan(
  base: AnimationPlan,
  next: AnimationPlan,
): AnimationPlan {
  return {
    ...next,
    from: mergeFrame(base.from, next.from),
    to: mergeFrame(base.to, next.to),
  };
}

export function createRuntimeConfig(
  plan: AnimationPlan,
  extraDelay = 0,
): RuntimeConfig {
  return {
    duration: plan.duration,
    delay: Math.max(0, plan.delay + extraDelay),
    easing: plan.easing,
    repeat: normalizeRepeat(getPlanPlayCount(plan)),
    driver: plan.driver,
    damping: plan.spring.damping,
    stiffness: plan.spring.stiffness,
    mass: plan.spring.mass,
  };
}

export function getAnimationDriver(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
): AnimationDriver {
  return config?.easing === 'spring' || presetOptions?.driver === 'spring'
    ? 'spring'
    : 'timing';
}

export function getDuration(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): number {
  if (motionOptions.reduceMotionEnabled) {
    return 0;
  }

  // Precedence: token/object > preset default > provider default > library.
  return getNumericValue(
    config?.duration,
    presetOptions?.duration ?? motionOptions.duration ?? DEFAULT_DURATION,
  );
}

export function getDelay(
  config?: Partial<StandardAnimConfig>,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): number {
  if (motionOptions.reduceMotionEnabled) {
    return 0;
  }

  return getNumericValue(config?.delay, DEFAULT_DELAY);
}

export function getSpringConfig(
  config?: Partial<StandardAnimConfig>,
  presetOptions?: PresetMotionOptions,
): AnimationPlan['spring'] {
  return {
    damping: getNumericValue(
      config?.damping,
      getNumericValue(presetOptions?.damping, 10),
    ),
    stiffness: getNumericValue(
      config?.stiffness,
      getNumericValue(presetOptions?.stiffness, 100),
    ),
    mass: getNumericValue(
      config?.mass,
      getNumericValue(presetOptions?.mass, 1),
    ),
  };
}

export function getNumericValue(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getAnimatableValue(
  value: unknown,
  fallback: AnimatableValue,
): AnimatableValue {
  return isAnimatableValue(value) ? value : fallback;
}

export function normalizeRepeat(
  repeat: number | 'infinite' | undefined,
): number {
  if (repeat === 'infinite') {
    return -1;
  }

  return typeof repeat === 'number' && Number.isFinite(repeat) && repeat > 0
    ? repeat
    : 1;
}

export function getConfigPlayCount(
  config: StandardAnimConfig,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): number | 'infinite' | undefined {
  if (motionOptions.reduceMotionEnabled) {
    return 1;
  }

  return config.playCount ?? config.repeat;
}

export function getPlanPlayCount(
  plan: AnimationPlan,
): number | 'infinite' | undefined {
  return plan.playCount ?? plan.repeat;
}

export function getEasingName(
  easing?: string,
  motionOptions: MotionRuntimeOptions = DEFAULT_MOTION_OPTIONS,
): string {
  const fallback = motionOptions.easing ?? DEFAULT_EASING;

  return easing === 'linear' ||
    easing === 'ease' ||
    easing === 'ease-in' ||
    easing === 'ease-out' ||
    easing === 'ease-in-out'
    ? easing
    : fallback;
}

export function createMotionRuntimeOptions(
  motion: StrxMotionContextValue,
): MotionRuntimeOptions {
  return normalizeCompileOptions({
    duration: motion.duration,
    easing: motion.easing,
    reduceMotionEnabled: motion.isReduceMotionEnabled,
  });
}

export function normalizeCompileOptions(
  options: CodexCompileOptions,
): MotionRuntimeOptions {
  const duration =
    typeof options.duration === 'number' &&
    Number.isFinite(options.duration) &&
    options.duration >= 0
      ? options.duration
      : undefined;
  const easing =
    typeof options.easing === 'string' &&
    options.easing.length > 0 &&
    options.easing.length <= 64
      ? options.easing
      : undefined;

  return {
    ...(duration === undefined ? null : { duration }),
    ...(easing === undefined ? null : { easing }),
    reduceMotionEnabled: options.reduceMotionEnabled === true,
  };
}

export function isCustomConfig(
  config: StandardAnimConfig,
): config is Extract<
  StandardAnimConfig,
  { from: AnimateStyle; to: AnimateStyle }
> {
  return !('type' in config) && 'from' in config && 'to' in config;
}

export function stableSerialize(value: unknown): string {
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
