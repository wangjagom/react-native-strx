import { useMemo, useRef } from 'react';
import {
  withSpring,
  withTiming,
  type LayoutAnimationFunction,
  type LayoutAnimationsValues,
} from 'react-native-reanimated';

import { useLayoutGroup } from '../context/LayoutGroupContext';
import {
  useLayoutNode,
  type LayoutNodeContextType,
  type LayoutTransitionType,
} from '../context/LayoutNodeContext';
import { useStrxMotion } from '../context/StrxMotionContext';
import { parseAnimate } from '../parser/resolve';
import type { AnimateProp } from '../types/animate';

/**
 * Controls how inherited layout transitions travel through the tree.
 *
 * - `auto`: inherit the nearest ancestor's or `Strx.LayoutGroup`'s
 *   transition and pass it on to descendants
 * - `none`: ignore inherited transitions; descendants only inherit this
 *   node's own `layout-*` transition
 */
export type LayoutPropagationMode = 'auto' | 'none';

export interface SpringParams {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface LayoutTransitionOptions {
  /** Duration for timing-based transitions, in milliseconds. */
  duration?: number;
  /** Overrides for spring-based transitions. */
  spring?: Partial<SpringParams>;
}

export const DEFAULT_LAYOUT_DURATION = 300;
/** Position/size changes smaller than this (in points) are applied instantly. */
const MOVEMENT_THRESHOLD = 0.5;

export const SPRING_PRESETS: Readonly<Record<string, SpringParams>> = {
  spring: { damping: 15, stiffness: 120, mass: 1 },
  'spring-stiff': { damping: 20, stiffness: 180, mass: 0.9 },
  'spring-bouncy': { damping: 10, stiffness: 105, mass: 1 },
};

const transitionCache = new Map<string, LayoutAnimationFunction>();

/**
 * Layout transition that applies the target layout immediately.
 *
 * Used instead of `undefined` once a node has had a layout transition, so the
 * `layout` prop never toggles back off on a mounted view, and under reduce
 * motion.
 */
export const stableNoOpTransition: LayoutAnimationFunction = values => {
  'worklet';
  return {
    initialValues: {
      originX: values.targetOriginX,
      originY: values.targetOriginY,
      width: values.targetWidth,
      height: values.targetHeight,
    },
    animations: {
      originX: withTiming(values.targetOriginX, { duration: 0 }),
      originY: withTiming(values.targetOriginY, { duration: 0 }),
      width: withTiming(values.targetWidth, { duration: 0 }),
      height: withTiming(values.targetHeight, { duration: 0 }),
    },
  };
};

/**
 * Returns the layout transition for a `layout-*` type.
 *
 * Results are cached per type and options so components receive a stable
 * function identity and Reanimated does not re-register the transition on
 * every render.
 */
export function getLayoutTransition(
  type: LayoutTransitionType,
  options: LayoutTransitionOptions = {},
): LayoutAnimationFunction {
  const duration = options.duration ?? DEFAULT_LAYOUT_DURATION;
  const spring = SPRING_PRESETS[type]
    ? { ...SPRING_PRESETS[type], ...options.spring }
    : null;
  const key = `${type}:${duration}:${spring ? `${spring.damping}:${spring.stiffness}:${spring.mass}` : ''}`;
  const cached = transitionCache.get(key);

  if (cached) {
    return cached;
  }

  const transition = createMeasuredLayoutTransition(
    duration,
    spring,
    type === 'fade',
  );
  transitionCache.set(key, transition);

  return transition;
}

function createMeasuredLayoutTransition(
  duration: number,
  spring: SpringParams | null,
  fade: boolean,
): LayoutAnimationFunction {
  const useSpring = spring !== null;
  const damping = spring?.damping ?? 0;
  const stiffness = spring?.stiffness ?? 0;
  const mass = spring?.mass ?? 0;

  return (values: LayoutAnimationsValues) => {
    'worklet';
    const moved =
      Math.abs(values.currentOriginX - values.targetOriginX) >
        MOVEMENT_THRESHOLD ||
      Math.abs(values.currentOriginY - values.targetOriginY) >
        MOVEMENT_THRESHOLD ||
      Math.abs(values.currentWidth - values.targetWidth) > MOVEMENT_THRESHOLD ||
      Math.abs(values.currentHeight - values.targetHeight) > MOVEMENT_THRESHOLD;

    if (!moved) {
      return stableNoOpTransition(values);
    }

    const animate = (target: number) =>
      useSpring
        ? withSpring(target, { damping, stiffness, mass })
        : withTiming(target, { duration });

    return {
      initialValues: {
        originX: values.currentOriginX,
        originY: values.currentOriginY,
        width: values.currentWidth,
        height: values.currentHeight,
        ...(fade ? { opacity: 0 } : null),
      },
      animations: {
        originX: animate(values.targetOriginX),
        originY: animate(values.targetOriginY),
        width: animate(values.targetWidth),
        height: animate(values.targetHeight),
        ...(fade ? { opacity: withTiming(1, { duration }) } : null),
      },
    };
  };
}

export interface LayoutTransitionState {
  /** Value for the Reanimated `layout` prop. `undefined` skips layout animation entirely. */
  layout: LayoutNodeContextType['inheritedTransition'];
  /** Whether a layout transition (own or inherited) applies to this node. */
  isActive: boolean;
  /** Context value for descendants. */
  nodeContextValue: LayoutNodeContextType;
}

/**
 * Resolves the layout transition for a STRX component.
 *
 * A node animates layout changes when it has its own `layout-*` token, or
 * inherits a transition from the nearest STRX ancestor that has one or from
 * the nearest `Strx.LayoutGroup`. Nodes without either get no `layout` prop,
 * so plain animated components carry no layout-animation cost.
 */
export function useLayoutTransition(
  animate: AnimateProp | null | undefined,
  layoutPropagation: LayoutPropagationMode = 'auto',
): LayoutTransitionState {
  const parent = useLayoutNode();
  const group = useLayoutGroup();
  const motion = useStrxMotion();
  const spec = parseAnimate(animate);
  const ownDuration = spec.layoutTiming?.duration ?? motion.duration;
  const own = spec.layout
    ? getLayoutTransition(spec.layout, { duration: ownDuration })
    : undefined;
  const inherited =
    layoutPropagation === 'none'
      ? undefined
      : parent
        ? parent.inheritedTransition
        : group?.defaultLayoutTransition;
  const transition = own ?? inherited;
  const hadLayoutRef = useRef(false);

  if (transition) {
    hadLayoutRef.current = true;
  }

  const layout = motion.isReduceMotionEnabled
    ? transition || hadLayoutRef.current
      ? stableNoOpTransition
      : undefined
    : (transition ?? (hadLayoutRef.current ? stableNoOpTransition : undefined));

  const nodeContextValue = useMemo<LayoutNodeContextType>(
    () => ({ inheritedTransition: transition }),
    [transition],
  );

  return {
    layout,
    isActive: transition !== undefined,
    nodeContextValue,
  };
}
