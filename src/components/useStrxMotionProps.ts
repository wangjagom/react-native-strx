import { useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import { useStrxLayout } from '../context/StrxLayoutContext';
import { useStrxMotion } from '../context/StrxMotionContext';
import { stableSerialize } from '../core/engine/plan';
import { getExitAnimation, getExitTokenState } from '../core/exit';
import {
  useLayoutTransition,
  type LayoutPropagationMode,
} from '../core/layout';
import {
  useCodexAnimationEngine,
  type CodexAnimationEngine,
} from '../core/useCodexAnimation';
import type { AnimatableStaticStyle } from '../core/engine/frames';
import type { LayoutNodeContextType } from '../context/LayoutNodeContext';
import type { AnimateProp, PlaybackMode } from '../types/animate';

export const LAYOUT_CLIP_STYLE: ViewStyle = { overflow: 'hidden' };

export interface StrxMotionOptions {
  animate?: AnimateProp;
  /** Static style used for `transition-*` and composing transforms. */
  style?: AnimatableStaticStyle;
  playback?: PlaybackMode;
  interval?: number;
  strxId?: string;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
}

export interface StrxMotionProps {
  animatedStyle: CodexAnimationEngine['animatedStyle'];
  /** Reanimated `layout` prop. */
  layout: LayoutNodeContextType['inheritedTransition'];
  /** Reanimated `exiting` prop. */
  exiting: ReturnType<typeof getExitAnimation>;
  /** Whether `overflow: 'hidden'` should be applied for `layoutClip`. */
  clip: boolean;
  /** Context value for STRX descendants. */
  nodeContextValue: LayoutNodeContextType;
}

/**
 * Everything a STRX primitive needs to animate: the animated style, layout
 * and exit transitions, and `strxId` registration for `Strx.useTimeline`.
 */
export function useStrxMotionProps({
  animate,
  style,
  playback = 'parallel',
  interval = 100,
  strxId,
  layoutClip = false,
  layoutPropagation = 'auto',
}: StrxMotionOptions): StrxMotionProps {
  const strxLayout = useStrxLayout();
  const motion = useStrxMotion();
  const engine = useCodexAnimationEngine(animate, style, playback, interval);
  const layout = useLayoutTransition(animate, layoutPropagation);

  const exitState = getExitTokenState(animate);
  const exitKey = motion.isReduceMotionEnabled
    ? 'reduced'
    : stableSerialize(exitState);
  const exiting = useMemo(
    () =>
      motion.isReduceMotionEnabled ? undefined : getExitAnimation(exitState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exitKey],
  );

  const { controller } = engine;

  useEffect(() => {
    if (!strxLayout || !strxId) {
      return;
    }

    strxLayout.registerPlayable(strxId, controller);

    return () => {
      strxLayout.unregisterPlayable(strxId, controller);
    };
  }, [controller, strxId, strxLayout]);

  return {
    animatedStyle: engine.animatedStyle,
    layout: layout.layout,
    exiting,
    clip: layoutClip && layout.isActive,
    nodeContextValue: layout.nodeContextValue,
  };
}
