import React, { forwardRef, useMemo } from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
} from 'react-native';
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

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface CodexPressableProps extends RNPressableProps {
  animate?: AnimateProp;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
}

export const Pressable = forwardRef<
  React.ElementRef<typeof RNPressable>,
  CodexPressableProps
>(function CodexAnimatedPressable(
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
  const staticStyle = typeof style === 'function' ? undefined : style;
  const animatedStyle = useCodexAnimation(styleAnimateProp, staticStyle);
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
