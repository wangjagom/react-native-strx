import React, { forwardRef, useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useLayoutGroup } from '../context/LayoutGroupContext';
import { useLayoutNode } from '../context/LayoutNodeContext';
import { stableNoOpTransition } from './View';

export interface CodexTextProps extends RNTextProps {}

export const Text = forwardRef<React.ElementRef<typeof RNText>, CodexTextProps>(
  function CodexAnimatedText({ style, ...props }, ref) {
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

    return <Animated.Text {...props} ref={ref} layout={layout} style={style} />;
  },
);

Text.displayName = 'CodexAnimatedText';
