import React, { forwardRef, useEffect, useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useCodexAnimationEngine } from '../core/useCodexAnimation';
import { useLayoutGroup } from '../context/LayoutGroupContext';
import { useLayoutNode } from '../context/LayoutNodeContext';
import { useStrxLayout } from '../context/StrxLayoutContext';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import {
  getStyleAnimateProp,
  stableNoOpTransition,
  type LayoutPropagationMode,
} from './View';

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
  /** Reserved for API symmetry with view-like STRX components. Text is not clipped automatically. */
  layoutClip?: boolean;
  /** Reserved for API symmetry. Use `layoutPropagation="none"` on parent views to isolate subtrees. */
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
    const inheritedTransition =
      layoutNode?.inheritedTransition ?? layoutGroup?.defaultLayoutTransition;
    const hasActiveLayoutTransition =
      layoutNode?.isInsideActiveReflowZone === true ||
      layoutGroup?.isInsideGroup === true;

    const layout = useMemo(() => {
      return hasActiveLayoutTransition
        ? inheritedTransition ?? stableNoOpTransition
        : stableNoOpTransition;
    }, [hasActiveLayoutTransition, inheritedTransition]);
    const styleAnimateProp = useMemo(
      () => getStyleAnimateProp(animate),
      [animate],
    );
    const animationEngine = useCodexAnimationEngine(
      styleAnimateProp,
      style,
      playback,
      interval,
    );
    const animatedStyle = animationEngine.animatedStyle;

    useEffect(() => {
      if (!strxLayout || !strxId) {
        return;
      }

      strxLayout.registerPlayable(strxId, animationEngine.controller);

      return () => {
        strxLayout.unregisterPlayable(strxId);
      };
    }, [animationEngine.controller, strxId, strxLayout]);

    return (
      <Animated.Text
        {...props}
        ref={ref}
        layout={layout}
        style={[style, animatedStyle]}
      />
    );
  },
);

Text.displayName = 'CodexAnimatedText';
