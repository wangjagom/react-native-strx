import React, { forwardRef } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import type { LayoutPropagationMode } from '../core/layout';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import { useStrxMotionProps } from './useStrxMotionProps';

/**
 * Props for `Strx.Text`.
 *
 * This type includes the normal React Native `Text` props, such as `children`,
 * `style`, `numberOfLines`, and text accessibility props, plus STRX animation
 * props for direct text animation and event timeline targets.
 */
export interface CodexTextProps extends RNTextProps {
  /**
   * Animation declaration for this text.
   *
   * Supports preset tokens, `from:/to:/exit:` keyframes, `transition-*`
   * tokens, animation objects, and arrays.
   */
  animate?: AnimateProp;
  /**
   * Accepted for API symmetry. Text is not clipped directly; wrap it in
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
  /** Registers this text as an event-playable target for `Strx.useTimeline`. */
  strxId?: string;
}

/**
 * Animated STRX text component.
 *
 * Use it anywhere you would normally use React Native `Text` when the text
 * should fade, slide, transition style changes, or participate in inherited
 * layout motion from a parent STRX container.
 */
export const Text = forwardRef<React.ElementRef<typeof RNText>, CodexTextProps>(
  function CodexAnimatedText(
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
      style,
      playback,
      interval,
      strxId,
    });

    return (
      <Animated.Text
        {...props}
        ref={ref}
        layout={motion.layout}
        exiting={motion.exiting}
        style={[style, motion.animatedStyle]}
      />
    );
  },
);

Text.displayName = 'Strx.Text';
