import React, {
  forwardRef,
  useMemo,
  type ComponentType,
  type ReactNode,
  type Ref,
} from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { LayoutNodeContext } from '../context/LayoutNodeContext';
import type { LayoutPropagationMode } from '../core/layout';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import { mergeRefs } from '../utils/refs';
import { LAYOUT_CLIP_STYLE, useStrxMotionProps } from './useStrxMotionProps';

/**
 * Style shapes supported by generated STRX components.
 */
export type StrxAnimatedStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;

/**
 * Options for `createStrxComponent`.
 */
export interface StrxComponentOptions {
  /**
   * Display name shown in React DevTools.
   *
   * If omitted, STRX derives a name from the wrapped component.
   */
  displayName?: string;
}

/**
 * Props added to a component returned by `createStrxComponent`.
 *
 * The returned component keeps the original component props, preserves its
 * original `style` type when possible, and adds STRX animation props.
 */
export type StrxComponentProps<Props extends object> = Omit<Props, 'style'> & {
  /** Animation declaration for this component. */
  animate?: AnimateProp;
  /** Clips overflowing children while a layout transition applies to this node. */
  layoutClip?: boolean;
  /**
   * `none` ignores layout transitions inherited from ancestors; descendants
   * then only inherit this node's own `layout-*` transition.
   */
  layoutPropagation?: LayoutPropagationMode;
  /** Orchestrates array `animate` entries. */
  playback?: PlaybackMode;
  /** Millisecond gap used by `playback="stagger"`. */
  interval?: number;
  /** Event timeline target ID used by `Strx.useTimeline`. */
  strxId?: string;
  /** Original component style prop, or a STRX-compatible animated style. */
  style?: Props extends { style?: infer Style } ? Style : StrxAnimatedStyle;
};

interface InternalStrxProps {
  animate?: AnimateProp;
  children?: ReactNode;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
  playback?: PlaybackMode;
  interval?: number;
  strxId?: string;
  style?: StrxAnimatedStyle;
  [key: string]: unknown;
}

/**
 * Wraps a React Native-compatible component with STRX animation behavior.
 *
 * Use this when your app or design system has a custom primitive, such as
 * `SafeAreaView` or a themed container, and you want it to accept `animate`,
 * `layoutClip`, `layoutPropagation`, `playback`, `interval`, and `strxId`.
 */
export function createStrxComponent<Props extends object, RefType = unknown>(
  BaseComponent: ComponentType<Props>,
  options: StrxComponentOptions = {},
) {
  const AnimatedComponent = Animated.createAnimatedComponent(
    BaseComponent as ComponentType<any>,
  );
  const displayName =
    options.displayName ??
    `Strx.${BaseComponent.displayName ?? BaseComponent.name ?? 'Component'}`;

  const StrxComponent = forwardRef<RefType, StrxComponentProps<Props>>(
    function StrxCreatedComponent(rawProps, ref) {
      const {
        animate,
        children,
        layoutClip,
        layoutPropagation,
        playback,
        interval,
        strxId,
        style,
        ...props
      } = rawProps as InternalStrxProps;
      const animatedRef = useAnimatedRef<any>();
      const combinedRef = useMemo(
        () => mergeRefs<RefType>(animatedRef as unknown as Ref<RefType>, ref),
        [animatedRef, ref],
      );
      const motion = useStrxMotionProps({
        animate,
        style,
        playback,
        interval,
        strxId,
        layoutClip,
        layoutPropagation,
      });
      const mergedStyle = useMemo(
        () =>
          motion.clip
            ? [style, LAYOUT_CLIP_STYLE, motion.animatedStyle]
            : [style, motion.animatedStyle],
        [motion.animatedStyle, motion.clip, style],
      );

      return (
        <LayoutNodeContext.Provider value={motion.nodeContextValue}>
          <AnimatedComponent
            {...props}
            ref={combinedRef}
            collapsable={false}
            layout={motion.layout}
            exiting={motion.exiting}
            style={mergedStyle}
          >
            {children}
          </AnimatedComponent>
        </LayoutNodeContext.Provider>
      );
    },
  );

  StrxComponent.displayName = displayName;

  return StrxComponent;
}
