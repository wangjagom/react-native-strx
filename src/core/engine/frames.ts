import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type { TransitionKind } from '../../parser/tokens';
import type { AnimateStyle } from '../../types/animate';

export type AnimatableValue = number | string;
export type StyleMap = Record<string, AnimatableValue>;
export type TransformMap = Partial<Record<TransformKey, AnimatableValue>>;
export type AnimatableStaticStyle = StyleProp<ViewStyle | TextStyle>;

/** Animatable style and transform values at one point of an animation. */
export interface AnimationFrame {
  style: StyleMap;
  transform: TransformMap;
}

export const ANIMATABLE_STYLE_KEYS = [
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

export const TRANSFORM_KEYS = [
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

export type TransformKey = (typeof TRANSFORM_KEYS)[number];

const ANIMATABLE_STYLE_KEY_SET = new Set<string>(ANIMATABLE_STYLE_KEYS);
const TRANSFORM_KEY_SET = new Set<string>(TRANSFORM_KEYS);

export const emptyFrame = (): AnimationFrame => ({
  style: {},
  transform: {},
});

export function normalizeFrame(style: AnimateStyle): AnimationFrame {
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

export function normalizeTransformArray(
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

export function completeFramePair(
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

export function completeStylePair(
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

export function completeTransformPair(
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

export function mergeFrame(
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

export function filterFrameByTransitionKind(
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

export function flattenAnimatableStyle(
  style?: AnimatableStaticStyle,
): AnimateStyle {
  const flattened = StyleSheet.flatten(style) as AnimateStyle | undefined;

  return flattened ?? {};
}

export function neutralStyleValue(key: string): AnimatableValue {
  if (key === 'opacity' || key.toLowerCase().includes('scale')) {
    return 1;
  }

  if (key.toLowerCase().includes('color')) {
    return 'transparent';
  }

  return 0;
}

export function neutralTransformValue(key: TransformKey): AnimatableValue {
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

export function isTransformKey(key: string): key is TransformKey {
  return TRANSFORM_KEY_SET.has(key);
}

export function isAnimatableValue(value: unknown): value is AnimatableValue {
  return typeof value === 'number' || typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
