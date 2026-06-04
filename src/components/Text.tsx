import React, { forwardRef, useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useCodexAnimation } from '../core/useCodexAnimation';
import { useLayoutGroup } from '../context/LayoutGroupContext';
import { useLayoutNode } from '../context/LayoutNodeContext';
import type { AnimateProp } from '../types/animate';
import {
  getStyleAnimateProp,
  stableNoOpTransition,
  type LayoutPropagationMode,
} from './View';

export interface CodexTextProps extends RNTextProps {
  animate?: AnimateProp;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
}

export const Text = forwardRef<React.ElementRef<typeof RNText>, CodexTextProps>(
  function CodexAnimatedText(
    {
      animate,
      layoutClip: _layoutClip,
      layoutPropagation: _layoutPropagation,
      style,
      ...props
    },
    ref,
  ) {
    const layoutGroup = useLayoutGroup();
    const layoutNode = useLayoutNode();
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
    const animatedStyle = useCodexAnimation(styleAnimateProp, style);

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
