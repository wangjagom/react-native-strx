import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import Animated from 'react-native-reanimated';

import type { LayoutPropagationMode } from '../core/layout';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import { LayoutNodeContext } from '../context/LayoutNodeContext';
import { LAYOUT_CLIP_STYLE, useStrxMotionProps } from './useStrxMotionProps';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

/**
 * Props for `Strx.Pressable`.
 *
 * This type includes the normal React Native `Pressable` props, such as
 * `onPress`, `onPressIn`, `onPressOut`, `onLongPress`, `disabled`, and
 * function-style `style`, plus STRX animation props.
 */
export interface StrxPressableProps extends RNPressableProps {
  /**
   * Animation declaration for this pressable.
   *
   * Use presets for entrance motion and `transition-*` tokens to animate
   * style changes caused by pressed, selected, or disabled state. Function
   * styles such as `({ pressed }) => ...` are resolved on every press so
   * transitions see the pressed style.
   */
  animate?: AnimateProp;
  /** Clips overflowing children while a layout transition applies to this node. */
  layoutClip?: boolean;
  /** `none` ignores layout transitions inherited from ancestors. */
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
  StrxPressableProps
>(function StrxPressable(
  {
    animate,
    layoutClip,
    layoutPropagation,
    playback,
    interval,
    strxId,
    style,
    onPressIn,
    onPressOut,
    children,
    ...props
  },
  ref,
) {
  const [pressed, setPressed] = useState(false);
  const isFunctionStyle = typeof style === 'function';

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (isFunctionStyle) {
        setPressed(true);
      }

      onPressIn?.(event);
    },
    [isFunctionStyle, onPressIn],
  );
  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      if (isFunctionStyle) {
        setPressed(false);
      }

      onPressOut?.(event);
    },
    [isFunctionStyle, onPressOut],
  );

  // Resolve function styles here so the engine sees pressed-state changes
  // as ordinary style changes, which `transition-*` tokens can animate.
  const resolvedStyle = useMemo(
    () =>
      typeof style === 'function'
        ? style({ pressed } as PressableStateCallbackType)
        : style,
    [pressed, style],
  );
  const motion = useStrxMotionProps({
    animate,
    style: resolvedStyle,
    playback,
    interval,
    strxId,
    layoutClip,
    layoutPropagation,
  });
  const mergedStyle = useMemo(
    () =>
      motion.clip
        ? [resolvedStyle, LAYOUT_CLIP_STYLE, motion.animatedStyle]
        : [resolvedStyle, motion.animatedStyle],
    [motion.animatedStyle, motion.clip, resolvedStyle],
  );
  return (
    <LayoutNodeContext.Provider value={motion.nodeContextValue}>
      <AnimatedPressable
        {...props}
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        layout={motion.layout}
        exiting={motion.exiting}
        style={mergedStyle}
      >
        {children}
      </AnimatedPressable>
    </LayoutNodeContext.Provider>
  );
});

Pressable.displayName = 'Strx.Pressable';
