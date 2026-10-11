import React, { forwardRef, useMemo } from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import Animated from 'react-native-reanimated';

import type { LayoutPropagationMode } from '../core/layout';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import { useStrxMotionProps } from './useStrxMotionProps';

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
    playback,
    interval,
    strxId,
    style,
    ...props
  },
  ref,
) {
  const motion = useStrxMotionProps({
    animate,
    style: typeof style === 'function' ? undefined : style,
    playback,
    interval,
    strxId,
  });
  const { animatedStyle } = motion;
  const mergedStyle = useMemo(() => {
    if (typeof style === 'function') {
      return (state: PressableStateCallbackType) => [
        style(state),
        animatedStyle,
      ];
    }

    return [style, animatedStyle];
  }, [animatedStyle, style]);

  return (
    <AnimatedPressable
      {...props}
      ref={ref}
      layout={motion.layout}
      exiting={motion.exiting}
      style={mergedStyle}
    />
  );
});

Pressable.displayName = 'Strx.Pressable';
