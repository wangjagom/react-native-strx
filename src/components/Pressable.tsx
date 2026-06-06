import React, { forwardRef, useEffect, useMemo } from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useCodexAnimationEngine } from '../core/useCodexAnimation';
import { useLayoutGroup } from '../context/LayoutGroupContext';
import { useLayoutNode } from '../context/LayoutNodeContext';
import { useStrxLayout } from '../context/StrxLayoutContext';
import { useStrxMotion } from '../context/StrxMotionContext';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import {
  getStyleAnimateProp,
  stableNoOpTransition,
  type LayoutPropagationMode,
} from './View';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

/**
 * Props for `Strx.Pressable`.
 *
 * This type includes the normal React Native `Pressable` props, such as
 * `onPress`, `onPressIn`, `onPressOut`, `onLongPress`, `disabled`, and
 * function-style `style`, plus STRX animation props.
 */
export interface CodexPressableProps extends RNPressableProps {
  /**
   * Animation declaration for this pressable.
   *
   * Use presets for entrance motion and `transition-*` tokens to animate
   * supported style changes caused by pressed, selected, or disabled state.
   */
  animate?: AnimateProp;
  /**
   * Accepted for API symmetry. Pressable is not clipped directly; wrap it in
   * `Strx.View layoutClip` when content should be clipped during layout motion.
   */
  layoutClip?: boolean;
  /**
   * Accepted for API symmetry. Use `layoutPropagation="none"` on a parent
   * `Strx.View` or custom STRX wrapper to isolate a subtree.
   */
  layoutPropagation?: LayoutPropagationMode;
  /** Orchestrates array `animate` entries as `parallel`, `serial`, or `stagger`. */
  playback?: PlaybackMode;
  /** Millisecond gap used by `playback="stagger"`. Default is `100`. */
  interval?: number;
  /** Registers this pressable as an event-playable target for `Strx.useTimeline`. */
  strxId?: string;
}

/**
 * Animated STRX press target.
 *
 * Use this for buttons, touchable cards, and interactive rows. It preserves
 * React Native `Pressable` event callbacks while allowing STRX animation and
 * timeline control through `animate` and `strxId`.
 */
export const Pressable = forwardRef<
  React.ElementRef<typeof RNPressable>,
  CodexPressableProps
>(function CodexAnimatedPressable(
  {
    animate,
    layoutClip: _layoutClip,
    layoutPropagation: _layoutPropagation,
    playback = 'parallel',
    interval = 100,
    strxId,
    style,
    ...props
  },
  ref,
) {
  const layoutGroup = useLayoutGroup();
  const layoutNode = useLayoutNode();
  const strxLayout = useStrxLayout();
  const motion = useStrxMotion();
  const inheritedTransition =
    layoutNode?.inheritedTransition ?? layoutGroup?.defaultLayoutTransition;
  const hasActiveLayoutTransition =
    layoutNode?.isInsideActiveReflowZone === true ||
    layoutGroup?.isInsideGroup === true;

  const layout = useMemo(() => {
    if (motion.isReduceMotionEnabled) {
      return stableNoOpTransition;
    }

    return hasActiveLayoutTransition
      ? inheritedTransition ?? stableNoOpTransition
      : stableNoOpTransition;
  }, [hasActiveLayoutTransition, inheritedTransition, motion.isReduceMotionEnabled]);
  const styleAnimateProp = useMemo(
    () => getStyleAnimateProp(animate),
    [animate],
  );
  const staticStyle = typeof style === 'function' ? undefined : style;
  const animationEngine = useCodexAnimationEngine(
    styleAnimateProp,
    staticStyle,
    playback,
    interval,
  );
  const animatedStyle = animationEngine.animatedStyle;

  useEffect(() => {
    if (typeof animate === 'string' && animate.length > 512) {
      strxLayout?.reportDebugWarning('animate string exceeded 512 characters and was ignored.');
    }
  }, [animate, strxLayout]);

  useEffect(() => {
    if (!strxLayout || !strxId) {
      return;
    }

    strxLayout.registerPlayable(strxId, animationEngine.controller);

    return () => {
      strxLayout.unregisterPlayable(strxId);
    };
  }, [animationEngine.controller, strxId, strxLayout]);
  const mergedStyle = useMemo(() => {
    if (typeof style === 'function') {
      return (state: PressableStateCallbackType) => [style(state), animatedStyle];
    }

    return [style, animatedStyle];
  }, [animatedStyle, style]);

  return (
    <AnimatedPressable
      {...props}
      ref={ref}
      layout={layout}
      style={mergedStyle}
    />
  );
});

Pressable.displayName = 'CodexAnimatedPressable';
