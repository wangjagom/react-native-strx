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

import { useCodexAnimation } from '../core/useCodexAnimation';
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
import type { AnimateProp } from '../types/animate';
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

export type StrxAnimatedStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;

export interface StrxComponentOptions {
  displayName?: string;
}

export type StrxComponentProps<Props extends object> = Omit<Props, 'style'> & {
  animate?: AnimateProp;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
  style?: Props extends { style?: infer Style } ? Style : StrxAnimatedStyle;
};

interface InternalStrxProps {
  animate?: AnimateProp;
  children?: ReactNode;
  layoutClip?: boolean;
  layoutPropagation?: LayoutPropagationMode;
  onLayout?: unknown;
  style?: StrxAnimatedStyle;
  [key: string]: unknown;
}

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
      const animatedStyle = useCodexAnimation(styleAnimateProp, style);
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
