import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  type ComponentType,
  type ReactNode,
  type Ref,
} from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { useCodexAnimationEngine } from '../core/useCodexAnimation';
import { useLayoutGroup } from '../context/LayoutGroupContext';
import {
  LayoutNodeContext,
  noopRegisterLayoutDemand,
  useLayoutNode,
} from '../context/LayoutNodeContext';
import {
  useStrxLayout,
  type AnimatedRefLike,
} from '../context/StrxLayoutContext';
import type { AnimateProp, PlaybackMode } from '../types/animate';
import {
  findStructuralLayoutDemand,
  getExitAnimation,
  getExitTokenState,
  getLayoutTokenState,
  getLayoutTransition,
  getStyleAnimateProp,
  LAYOUT_CLIP_STYLE,
  mergeRefs,
  stableNoOpTransition,
  type LayoutPropagationMode,
} from './View';

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
  /** Clips overflowing children while an active layout transition is running. */
  layoutClip?: boolean;
  /** Controls whether child layout animation demand bubbles past this node. */
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
  onLayout?: unknown;
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
        layoutClip = false,
        layoutPropagation = 'auto',
        onLayout,
        playback = 'parallel',
        interval = 100,
        strxId,
        style,
        ...props
      } = rawProps as InternalStrxProps;
      const nodeId = useId();
      const layoutGroup = useLayoutGroup();
      const parentNode = useLayoutNode();
      const strxLayout = useStrxLayout();
      const animatedRef = useAnimatedRef<any>();
      const combinedRef = useMemo(
        () =>
          mergeRefs<RefType>(
            animatedRef as unknown as Ref<RefType>,
            ref,
          ),
        [animatedRef, ref],
      );
      const layoutTokenState = useMemo(
        () => getLayoutTokenState(animate),
        [animate],
      );
      const styleAnimateProp = useMemo(
        () => getStyleAnimateProp(animate),
        [animate],
      );
      const exitTokenState = useMemo(
        () => getExitTokenState(animate),
        [animate],
      );
      const exitingAnimation = useMemo(
        () => getExitAnimation(exitTokenState),
        [exitTokenState],
      );
      const animationEngine = useCodexAnimationEngine(
        styleAnimateProp,
        style,
        playback,
        interval,
      );
      const animatedStyle = animationEngine.animatedStyle;
      const structuralChildDemand = useMemo(
        () => findStructuralLayoutDemand(children),
        [children],
      );
      const effectiveDemand =
        layoutTokenState.explicitTransitionType ?? structuralChildDemand;
      const hasInheritedLayoutTransition =
        parentNode?.isInsideActiveReflowZone === true ||
        layoutGroup?.isInsideGroup === true;
      const hasActiveLayoutTransition =
        effectiveDemand !== null || hasInheritedLayoutTransition;
      const localDemandTransition = effectiveDemand
        ? getLayoutTransition(effectiveDemand)
        : undefined;
      const activeLayout =
        localDemandTransition ??
        parentNode?.inheritedTransition ??
        layoutGroup?.defaultLayoutTransition ??
        stableNoOpTransition;

      useEffect(() => {
        if (!strxLayout) {
          return;
        }

        strxLayout.registerNode({
          nodeId,
          parentId: parentNode?.parentId ?? null,
          layoutPropagation,
          animatedRef: animatedRef as AnimatedRefLike,
        });

        if (effectiveDemand) {
          strxLayout.publishLayoutDemand({
            sourceId: nodeId,
            transitionType: effectiveDemand,
          });
        }

        return () => {
          strxLayout.unregisterNode(nodeId);
        };
      }, [
        animatedRef,
        effectiveDemand,
        layoutPropagation,
        nodeId,
        parentNode?.parentId,
        strxLayout,
      ]);

      useEffect(() => {
        if (!strxLayout || !strxId) {
          return;
        }

        strxLayout.registerPlayable(strxId, animationEngine.controller);

        return () => {
          strxLayout.unregisterPlayable(strxId);
        };
      }, [animationEngine.controller, strxId, strxLayout]);

      const mergedStyle = useMemo(() => {
        if (!hasActiveLayoutTransition || !layoutClip) {
          return [style, animatedStyle];
        }

        return [style, LAYOUT_CLIP_STYLE, animatedStyle];
      }, [animatedStyle, hasActiveLayoutTransition, layoutClip, style]);

      const nodeContextValue = useMemo(
        () => ({
          parentId: nodeId,
          registerLayoutDemand: noopRegisterLayoutDemand,
          isInsideActiveReflowZone: true,
          inheritedTransition: activeLayout,
        }),
        [activeLayout, nodeId],
      );

      return (
        <LayoutNodeContext.Provider value={nodeContextValue}>
          <AnimatedComponent
            {...props}
            ref={combinedRef}
            collapsable={false}
            layout={activeLayout}
            exiting={exitingAnimation}
            onLayout={onLayout}
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
