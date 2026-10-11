import {
  cancelAnimation,
  interpolateColor,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { applyEasing } from '../easing';
import {
  TRANSFORM_KEYS,
  type AnimatableValue,
  type AnimationFrame,
} from './frames';
import type { RuntimeConfig } from './plan';

/**
 * A set of channels interpolated by one progress value (0 = `from`,
 * 1 = `to`).
 *
 * The animated style samples layers on the UI thread, so a layer never
 * creates animations inside the style mapper. Starting, reversing, or
 * stopping a layer only animates its progress shared value.
 */
export interface LayerState {
  keys: string[];
  isTransform: boolean[];
  kinds: ChannelKind[];
  units: string[];
  from: AnimatableValue[];
  to: AnimatableValue[];
  /** Style keys this layer animated before and must hand back to the static style. */
  releasedStyleKeys: string[];
  /** Whether this layer animated transforms before and must hand them back. */
  releasedTransform: boolean;
}

/**
 * How a channel is interpolated:
 * - `0` numeric, optionally with a unit suffix such as `deg` or `%`
 * - `1` color
 * - `2` discrete: values that cannot be interpolated jump to `to` at the end
 */
export type ChannelKind = 0 | 1 | 2;

const NUMERIC: ChannelKind = 0;
const COLOR: ChannelKind = 1;
const DISCRETE: ChannelKind = 2;

export const EMPTY_LAYER: LayerState = Object.freeze({
  keys: [],
  isTransform: [],
  kinds: [],
  units: [],
  from: [],
  to: [],
  releasedStyleKeys: [],
  releasedTransform: false,
}) as LayerState;

const NUMERIC_PATTERN = /^(-?(?:\d+\.?\d*|\.\d+))(deg|rad|%|px)?$/;

interface ParsedNumeric {
  value: number;
  unit: string;
}

function parseNumeric(value: AnimatableValue): ParsedNumeric | null {
  if (typeof value === 'number') {
    return { value, unit: '' };
  }

  const match = NUMERIC_PATTERN.exec(value.trim());

  return match ? { value: Number(match[1]), unit: match[2] ?? '' } : null;
}

/**
 * Builds a layer that interpolates every channel present in `from` or `to`.
 *
 * `previous` is the layer being replaced; channels it controlled that the new
 * layer does not are released back to the static style.
 */
export function createLayerState(
  from: AnimationFrame,
  to: AnimationFrame,
  previous: LayerState = EMPTY_LAYER,
): LayerState {
  const state: LayerState = {
    keys: [],
    isTransform: [],
    kinds: [],
    units: [],
    from: [],
    to: [],
    releasedStyleKeys: [],
    releasedTransform: false,
  };

  const addChannel = (
    key: string,
    isTransform: boolean,
    fromValue: AnimatableValue | undefined,
    toValue: AnimatableValue | undefined,
  ) => {
    const start = fromValue ?? toValue;
    const end = toValue ?? fromValue;

    if (start === undefined || end === undefined) {
      return;
    }

    const startNumeric = parseNumeric(start);
    const endNumeric = parseNumeric(end);
    let kind: ChannelKind = DISCRETE;
    let unit = '';
    let fromStored: AnimatableValue = start;
    let toStored: AnimatableValue = end;

    if (startNumeric && endNumeric) {
      const units = [startNumeric.unit, endNumeric.unit].filter(
        candidate => candidate.length > 0,
      );

      if (units.length < 2 || units[0] === units[1]) {
        kind = NUMERIC;
        unit = units[0] ?? '';
        fromStored = startNumeric.value;
        toStored = endNumeric.value;
      }
    } else if (!startNumeric && !endNumeric) {
      kind = COLOR;
    }

    state.keys.push(key);
    state.isTransform.push(isTransform);
    state.kinds.push(kind);
    state.units.push(unit);
    state.from.push(fromStored);
    state.to.push(toStored);
  };

  const styleKeys = new Set([
    ...Object.keys(from.style),
    ...Object.keys(to.style),
  ]);

  for (const key of styleKeys) {
    addChannel(key, false, from.style[key], to.style[key]);
  }

  for (const key of TRANSFORM_KEYS) {
    addChannel(key, true, from.transform[key], to.transform[key]);
  }

  const nextStyleKeys = new Set(
    state.keys.filter((_, index) => !state.isTransform[index]),
  );

  for (let index = 0; index < previous.keys.length; index += 1) {
    const key = previous.keys[index]!;

    if (!previous.isTransform[index] && !nextStyleKeys.has(key)) {
      state.releasedStyleKeys.push(key);
    }
  }

  state.releasedTransform =
    previous.isTransform.includes(true) && !state.isTransform.includes(true);

  return state;
}

/** Interpolates one channel of a layer at `progress`. */
export function sampleChannel(
  state: LayerState,
  index: number,
  progress: number,
): AnimatableValue {
  'worklet';
  const from = state.from[index]!;
  const to = state.to[index]!;
  const kind = state.kinds[index];

  if (kind === 0) {
    const value =
      (from as number) + ((to as number) - (from as number)) * progress;
    const unit = state.units[index]!;

    return unit.length === 0 ? value : `${value}${unit}`;
  }

  if (kind === 1) {
    return interpolateColor(progress, [0, 1], [from as string, to as string]);
  }

  return progress >= 1 ? to : from;
}

/** Samples every channel of a layer into a frame. Usable on either thread. */
export function sampleLayer(
  state: LayerState,
  progress: number,
): AnimationFrame {
  'worklet';
  const frame: AnimationFrame = { style: {}, transform: {} };

  for (let index = 0; index < state.keys.length; index += 1) {
    const key = state.keys[index]!;
    const value = sampleChannel(state, index, progress);

    if (state.isTransform[index]) {
      frame.transform[key as keyof AnimationFrame['transform']] = value;
    } else {
      frame.style[key] = value;
    }
  }

  return frame;
}

/**
 * Builds the progress animation for a layer: delay, then timing or spring
 * toward `target`, repeated `config.repeat` times (`-1` = forever).
 *
 * `onFinish` runs on the JS thread only when the animation completes without
 * being cancelled or interrupted.
 */
export function createProgressAnimation(
  target: 0 | 1,
  config: RuntimeConfig,
  onFinish?: () => void,
) {
  'worklet';
  const callback = onFinish
    ? (finished?: boolean) => {
        'worklet';
        if (finished) {
          scheduleOnRN(onFinish);
        }
      }
    : undefined;
  const easingName = config.easing;
  const repeats = config.repeat !== 1;
  const single =
    config.driver === 'spring'
      ? withSpring(
          target,
          {
            damping: config.damping,
            stiffness: config.stiffness,
            mass: config.mass,
          },
          repeats ? undefined : callback,
        )
      : withTiming(
          target,
          {
            duration: config.duration,
            easing: (t: number) => {
              'worklet';
              return applyEasing(easingName, t);
            },
          },
          repeats ? undefined : callback,
        );
  const repeated = repeats
    ? withRepeat(single, config.repeat, false, callback)
    : single;

  return config.delay > 0 ? withDelay(config.delay, repeated) : repeated;
}

/**
 * Atomically replaces a layer's channels and animates its progress on the UI
 * thread, so no frame can combine the new channels with a stale progress.
 *
 * - `state`: new channels, or `null` to keep the current ones
 * - `start`: progress to jump to first, or `null` to continue from the
 *   current progress (used to reverse or retarget mid-flight)
 */
export function runLayer(
  stateValue: SharedValue<LayerState>,
  progressValue: SharedValue<number>,
  state: LayerState | null,
  start: number | null,
  target: 0 | 1,
  config: RuntimeConfig,
  onFinish?: () => void,
): void {
  scheduleOnUI(() => {
    'worklet';
    if (state) {
      stateValue.value = state;
    }

    if (start !== null) {
      progressValue.value = start;
    }

    progressValue.value = createProgressAnimation(target, config, onFinish);
  });
}

/** Atomically replaces a layer's channels and sets a fixed progress. */
export function setLayer(
  stateValue: SharedValue<LayerState>,
  progressValue: SharedValue<number>,
  state: LayerState,
  progress: number,
): void {
  scheduleOnUI(() => {
    'worklet';
    cancelAnimation(progressValue);
    stateValue.value = state;
    progressValue.value = progress;
  });
}
