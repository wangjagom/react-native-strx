import React, { forwardRef, useMemo } from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useLayoutGroup } from '../context/LayoutGroupContext';
import { useLayoutNode } from '../context/LayoutNodeContext';
import { stableNoOpTransition } from './View';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface CodexPressableProps extends RNPressableProps {}

export const Pressable = forwardRef<
  React.ElementRef<typeof RNPressable>,
  CodexPressableProps
>(function CodexAnimatedPressable({ style, ...props }, ref) {
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

  return (
    <AnimatedPressable {...props} ref={ref} layout={layout} style={style} />
  );
});

Pressable.displayName = 'CodexAnimatedPressable';
