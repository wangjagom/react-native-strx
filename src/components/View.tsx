import React, {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  type ReactNode,
} from 'react';
import {
  View as RNView,
  type ViewProps as RNViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedRef,
  withDelay,
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
  type ExitAnimationsValues,
  type LayoutAnimationFunction,
  type LayoutAnimationsValues,
} from 'react-native-reanimated';

import { applyEasing } from '../core/easing';
import { useCodexAnimationEngine } from '../core/useCodexAnimation';
import { useLayoutGroup } from '../context/LayoutGroupContext';
import {
  LayoutNodeContext,
  noopRegisterLayoutDemand,
  useLayoutNode,
  type LayoutTransitionType,
} from '../context/LayoutNodeContext';
import {
  useStrxLayout,
  type AnimatedRefLike,
} from '../context/StrxLayoutContext';
import { useStrxMotion } from '../context/StrxMotionContext';
import { parseAnimate } from '../parser/resolve';
import { mergeLayoutTransition } from '../parser/tokens';
import type { AnimateProp, AnimateStyle, PlaybackMode } from '../types/animate';

export const LAYOUT_CLIP_STYLE: ViewStyle = { overflow: 'hidden' };

const EMPTY_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: null,
  hasLayoutTransition: false,
});

const EMPTY_EXIT_TOKEN_STATE: ExitTokenState = Object.freeze({
  hasExitToken: false,
  style: Object.freeze({}),
});

export const stableNoOpTransition: LayoutAnimationFunction = values => {
  'worklet';
  return {
    initialValues: {
      originX: values.targetOriginX,
      originY: values.targetOriginY,
      width: values.targetWidth,
      height: values.targetHeight,
      opacity: 1,
    },
    animations: {
      originX: withTiming(values.targetOriginX, { duration: 0 }),
      originY: withTiming(values.targetOriginY, { duration: 0 }),
      width: withTiming(values.targetWidth, { duration: 0 }),
      height: withTiming(values.targetHeight, { duration: 0 }),
      opacity: withTiming(1, { duration: 0 }),
    },
  };
};

/**
 * Controls how layout transition demand travels through the STRX layout tree.
 *
 * - `auto`: lets child layout animation demand bubble to nearby ancestors.
 * - `none`: treats this node as a boundary so independent subtrees do not
 *   influence outer layout transitions.
 */
export type LayoutPropagationMode = 'auto' | 'none';

/**
 * Props for `Strx.View`.
 *
 * `Strx.View` keeps the normal React Native `View` API, including props such
 * as `style`, `children`, `onLayout`, and accessibility props, and adds STRX
 * animation props for declarative entrance, exit, style, and layout motion.
 */
export interface CodexViewProps extends RNViewProps {
  /**
   * Animation declaration for this view.
   *
   * Accepts preset tokens, `from:/to:` keyframes, `transition-*`, `layout-*`,
   * animation objects, or arrays.
   */
  animate?: AnimateProp;
  /**
   * Clips overflowing children while a layout transition is active.
   *
   * Default is `false` so text/content is not accidentally cut off.
   */
  layoutClip?: boolean;
  /**
   * Controls whether child layout animation demand can bubble to ancestors.
   *
   * Use `"none"` to isolate untrusted or independent subtrees.
   */
  layoutPropagation?: LayoutPropagationMode;
  /**
   * Orchestrates array `animate` entries as `parallel`, `serial`, or `stagger`.
   */
  playback?: PlaybackMode;
  /** Millisecond gap used by `playback="stagger"`. Default is `100`. */
  interval?: number;
  /**
   * Registers this view as an event-playable target for `Strx.useTimeline`.
   *
   * Must be unique within the nearest `Strx.LayoutRoot`.
   */
  strxId?: string;
}

/**
 * Animated STRX container component.
 *
 * Use this as the default wrapper for animated cards, rows, panels, and layout
 * regions. It supports all React Native `View` props plus STRX props such as
 * `animate`, `layoutClip`, `layoutPropagation`, `playback`, `interval`, and
 * `strxId`.
 */
export const View = forwardRef<React.ElementRef<typeof RNView>, CodexViewProps>(
  function CodexAnimatedView(props, ref) {
    return <AnimatedCodexView {...props} ref={ref} />;
  },
);

View.displayName = 'CodexAnimatedView';

const AnimatedCodexView = forwardRef<
  React.ElementRef<typeof RNView>,
  CodexViewProps
>(function AnimatedCodexView(
  {
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
  },
  ref,
) {
  const nodeId = useId();
  const layoutGroup = useLayoutGroup();
  const parentNode = useLayoutNode();
  const strxLayout = useStrxLayout();
  const motion = useStrxMotion();
  const animatedRef = useAnimatedRef<React.ElementRef<typeof RNView>>();
  const combinedRef = useMemo(
    () =>
      mergeRefs<React.ElementRef<typeof RNView>>(
        animatedRef as React.Ref<React.ElementRef<typeof RNView>>,
        ref,
      ),
    [animatedRef, ref],
  );
  const layoutTokenState = useMemo(
    () => getLayoutTokenState(animate),
    [animate],
  );
  const exitTokenState = useMemo(() => getExitTokenState(animate), [animate]);
  const exitingAnimation = useMemo(
    () => getExitAnimation(exitTokenState),
    [exitTokenState],
  );
  const animationEngine = useCodexAnimationEngine(
    animate,
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
  const reanimatedLayout =
    localDemandTransition ??
    parentNode?.inheritedTransition ??
    layoutGroup?.defaultLayoutTransition ??
    stableNoOpTransition;
  const activeLayout = motion.isReduceMotionEnabled
    ? stableNoOpTransition
    : reanimatedLayout;

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
      <Animated.View
        {...props}
        ref={combinedRef}
        collapsable={false}
        layout={activeLayout}
        exiting={exitingAnimation}
        onLayout={onLayout}
        style={mergedStyle}
      >
        {children}
      </Animated.View>
    </LayoutNodeContext.Provider>
  );
});

export interface LayoutTokenState {
  explicitTransitionType: LayoutTransitionType | null;
  hasLayoutTransition: boolean;
}

export interface ExitTokenState {
  hasExitToken: boolean;
  style: AnimateStyle;
  duration?: number;
  delay?: number;
  easing?: string;
}

interface StructuralLayoutProps {
  animate?: unknown;
  children?: ReactNode;
  layoutPropagation?: LayoutPropagationMode;
}

export function getLayoutTransition(
  transitionType: LayoutTransitionType,
): LayoutAnimationFunction {
  switch (transitionType) {
    case 'spring':
      return springMeasuredLayoutTransition;
    case 'fade':
      return fadeMeasuredLayoutTransition;
    case 'spring-stiff':
      return springStiffMeasuredLayoutTransition;
    case 'spring-bouncy':
      return springBouncyMeasuredLayoutTransition;
    case 'linear':
    default:
      return linearMeasuredLayoutTransition;
  }
}

function linearMeasuredLayoutTransition(values: LayoutAnimationsValues) {
  'worklet';
  const startX = values.currentOriginX;
  const startY = values.currentOriginY;
  const startWidth = values.currentWidth;
  const startHeight = values.currentHeight;
  const targetX = values.targetOriginX;
  const targetY = values.targetOriginY;
  const targetWidth = values.targetWidth;
  const targetHeight = values.targetHeight;
  const shouldAnimate =
    Math.abs(startX - targetX) > 0.5 ||
    Math.abs(startY - targetY) > 0.5 ||
    Math.abs(startWidth - targetWidth) > 0.5 ||
    Math.abs(startHeight - targetHeight) > 0.5;

  if (!shouldAnimate) {
    return {
      initialValues: {
        originX: targetX,
        originY: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
      },
      animations: {
        originX: withTiming(targetX, { duration: 0 }),
        originY: withTiming(targetY, { duration: 0 }),
        width: withTiming(targetWidth, { duration: 0 }),
        height: withTiming(targetHeight, { duration: 0 }),
        opacity: withTiming(1, { duration: 0 }),
      },
    };
  }

  return {
    initialValues: {
      originX: startX,
      originY: startY,
      width: startWidth,
      height: startHeight,
      opacity: 1,
    },
    animations: {
      originX: withTiming(targetX, { duration: 300 }),
      originY: withTiming(targetY, { duration: 300 }),
      width: withTiming(targetWidth, { duration: 300 }),
      height: withTiming(targetHeight, { duration: 300 }),
      opacity: withTiming(1, { duration: 1 }),
    },
  };
}

function springMeasuredLayoutTransition(values: LayoutAnimationsValues) {
  'worklet';
  const startX = values.currentOriginX;
  const startY = values.currentOriginY;
  const startWidth = values.currentWidth;
  const startHeight = values.currentHeight;
  const targetX = values.targetOriginX;
  const targetY = values.targetOriginY;
  const targetWidth = values.targetWidth;
  const targetHeight = values.targetHeight;
  const shouldAnimate =
    Math.abs(startX - targetX) > 0.5 ||
    Math.abs(startY - targetY) > 0.5 ||
    Math.abs(startWidth - targetWidth) > 0.5 ||
    Math.abs(startHeight - targetHeight) > 0.5;

  if (!shouldAnimate) {
    return {
      initialValues: {
        originX: targetX,
        originY: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
      },
      animations: {
        originX: withTiming(targetX, { duration: 0 }),
        originY: withTiming(targetY, { duration: 0 }),
        width: withTiming(targetWidth, { duration: 0 }),
        height: withTiming(targetHeight, { duration: 0 }),
        opacity: withTiming(1, { duration: 0 }),
      },
    };
  }

  return {
    initialValues: {
      originX: startX,
      originY: startY,
      width: startWidth,
      height: startHeight,
      opacity: 1,
    },
    animations: {
      originX: withSpring(targetX, { damping: 15, stiffness: 120, mass: 1 }),
      originY: withSpring(targetY, { damping: 15, stiffness: 120, mass: 1 }),
      width: withSpring(targetWidth, { damping: 15, stiffness: 120, mass: 1 }),
      height: withSpring(targetHeight, {
        damping: 15,
        stiffness: 120,
        mass: 1,
      }),
      opacity: withTiming(1, { duration: 1 }),
    },
  };
}

function fadeMeasuredLayoutTransition(values: LayoutAnimationsValues) {
  'worklet';
  const startX = values.currentOriginX;
  const startY = values.currentOriginY;
  const startWidth = values.currentWidth;
  const startHeight = values.currentHeight;
  const targetX = values.targetOriginX;
  const targetY = values.targetOriginY;
  const targetWidth = values.targetWidth;
  const targetHeight = values.targetHeight;
  const shouldAnimate =
    Math.abs(startX - targetX) > 0.5 ||
    Math.abs(startY - targetY) > 0.5 ||
    Math.abs(startWidth - targetWidth) > 0.5 ||
    Math.abs(startHeight - targetHeight) > 0.5;

  if (!shouldAnimate) {
    return {
      initialValues: {
        originX: targetX,
        originY: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
      },
      animations: {
        originX: withTiming(targetX, { duration: 0 }),
        originY: withTiming(targetY, { duration: 0 }),
        width: withTiming(targetWidth, { duration: 0 }),
        height: withTiming(targetHeight, { duration: 0 }),
        opacity: withTiming(1, { duration: 0 }),
      },
    };
  }

  return {
    initialValues: {
      originX: startX,
      originY: startY,
      width: startWidth,
      height: startHeight,
      opacity: 0,
    },
    animations: {
      originX: withTiming(targetX, { duration: 300 }),
      originY: withTiming(targetY, { duration: 300 }),
      width: withTiming(targetWidth, { duration: 300 }),
      height: withTiming(targetHeight, { duration: 300 }),
      opacity: withTiming(1, { duration: 300 }),
    },
  };
}

function springStiffMeasuredLayoutTransition(values: LayoutAnimationsValues) {
  'worklet';
  const startX = values.currentOriginX;
  const startY = values.currentOriginY;
  const startWidth = values.currentWidth;
  const startHeight = values.currentHeight;
  const targetX = values.targetOriginX;
  const targetY = values.targetOriginY;
  const targetWidth = values.targetWidth;
  const targetHeight = values.targetHeight;
  const shouldAnimate =
    Math.abs(startX - targetX) > 0.5 ||
    Math.abs(startY - targetY) > 0.5 ||
    Math.abs(startWidth - targetWidth) > 0.5 ||
    Math.abs(startHeight - targetHeight) > 0.5;

  if (!shouldAnimate) {
    return {
      initialValues: {
        originX: targetX,
        originY: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
      },
      animations: {
        originX: withTiming(targetX, { duration: 0 }),
        originY: withTiming(targetY, { duration: 0 }),
        width: withTiming(targetWidth, { duration: 0 }),
        height: withTiming(targetHeight, { duration: 0 }),
        opacity: withTiming(1, { duration: 0 }),
      },
    };
  }

  return {
    initialValues: {
      originX: startX,
      originY: startY,
      width: startWidth,
      height: startHeight,
      opacity: 1,
    },
    animations: {
      originX: withSpring(targetX, { damping: 20, stiffness: 180, mass: 0.9 }),
      originY: withSpring(targetY, { damping: 20, stiffness: 180, mass: 0.9 }),
      width: withSpring(targetWidth, {
        damping: 20,
        stiffness: 180,
        mass: 0.9,
      }),
      height: withSpring(targetHeight, {
        damping: 20,
        stiffness: 180,
        mass: 0.9,
      }),
      opacity: withTiming(1, { duration: 1 }),
    },
  };
}

function springBouncyMeasuredLayoutTransition(values: LayoutAnimationsValues) {
  'worklet';
  const startX = values.currentOriginX;
  const startY = values.currentOriginY;
  const startWidth = values.currentWidth;
  const startHeight = values.currentHeight;
  const targetX = values.targetOriginX;
  const targetY = values.targetOriginY;
  const targetWidth = values.targetWidth;
  const targetHeight = values.targetHeight;
  const shouldAnimate =
    Math.abs(startX - targetX) > 0.5 ||
    Math.abs(startY - targetY) > 0.5 ||
    Math.abs(startWidth - targetWidth) > 0.5 ||
    Math.abs(startHeight - targetHeight) > 0.5;

  if (!shouldAnimate) {
    return {
      initialValues: {
        originX: targetX,
        originY: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
      },
      animations: {
        originX: withTiming(targetX, { duration: 0 }),
        originY: withTiming(targetY, { duration: 0 }),
        width: withTiming(targetWidth, { duration: 0 }),
        height: withTiming(targetHeight, { duration: 0 }),
        opacity: withTiming(1, { duration: 0 }),
      },
    };
  }

  return {
    initialValues: {
      originX: startX,
      originY: startY,
      width: startWidth,
      height: startHeight,
      opacity: 1,
    },
    animations: {
      originX: withSpring(targetX, { damping: 10, stiffness: 105, mass: 1 }),
      originY: withSpring(targetY, { damping: 10, stiffness: 105, mass: 1 }),
      width: withSpring(targetWidth, { damping: 10, stiffness: 105, mass: 1 }),
      height: withSpring(targetHeight, {
        damping: 10,
        stiffness: 105,
        mass: 1,
      }),
      opacity: withTiming(1, { duration: 1 }),
    },
  };
}

/** Reads the layout transition requested by `layout-*` tokens. */
export function getLayoutTokenState(
  animate: AnimateProp | undefined,
): LayoutTokenState {
  const layout = parseAnimate(animate).layout;

  return layout
    ? { explicitTransitionType: layout, hasLayoutTransition: true }
    : EMPTY_LAYOUT_TOKEN_STATE;
}

/** Reads the unmount animation requested by `exit:` tokens. */
export function getExitTokenState(
  animate: AnimateProp | undefined,
): ExitTokenState {
  const exit = parseAnimate(animate).exit;

  if (!exit) {
    return EMPTY_EXIT_TOKEN_STATE;
  }

  const { duration, delay, easing } = exit.timing;

  return {
    hasExitToken: true,
    style: exit.style,
    ...(duration === undefined ? null : { duration }),
    ...(delay === undefined ? null : { delay }),
    ...(easing === undefined ? null : { easing }),
  };
}

export function getExitAnimation(
  exitTokenState: ExitTokenState,
): EntryExitAnimationFunction | undefined {
  if (!exitTokenState.hasExitToken) {
    return undefined;
  }

  const duration = exitTokenState.duration ?? 300;
  const delay = exitTokenState.delay ?? 0;
  const easing = exitTokenState.easing ?? 'ease';
  const opacity =
    typeof exitTokenState.style.opacity === 'number'
      ? exitTokenState.style.opacity
      : 0;
  const translateX =
    typeof exitTokenState.style.translateX === 'number'
      ? exitTokenState.style.translateX
      : 0;
  const translateY =
    typeof exitTokenState.style.translateY === 'number'
      ? exitTokenState.style.translateY
      : 0;
  const scale =
    typeof exitTokenState.style.scale === 'number'
      ? exitTokenState.style.scale
      : 1;

  return (values: ExitAnimationsValues) => {
    'worklet';
    return {
      initialValues: {
        originX: values.currentOriginX,
        originY: values.currentOriginY,
        width: values.currentWidth,
        height: values.currentHeight,
        opacity: 1,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
      },
      animations: {
        originX: withTiming(values.currentOriginX, { duration: 0 }),
        originY: withTiming(values.currentOriginY, { duration: 0 }),
        width: withTiming(values.currentWidth, { duration: 0 }),
        height: withTiming(values.currentHeight, { duration: 0 }),
        opacity: animateExitValue(opacity, duration, delay, easing),
        transform: [
          { translateX: animateExitValue(translateX, duration, delay, easing) },
          { translateY: animateExitValue(translateY, duration, delay, easing) },
          { scale: animateExitValue(scale, duration, delay, easing) },
        ],
      },
    };
  };
}

function animateExitValue(
  value: number,
  duration: number,
  delay: number,
  easing: string,
) {
  'worklet';
  const animation = withTiming(value, {
    duration,
    easing: (t: number) => {
      'worklet';
      return applyEasing(easing, t);
    },
  });

  return delay > 0 ? withDelay(delay, animation) : animation;
}

export function findStructuralLayoutDemand(
  children: ReactNode,
): LayoutTransitionType | null {
  let demand: LayoutTransitionType | null = null;

  try {
    Children.forEach(children, child => {
      if (
        demand === 'spring-bouncy' ||
        !isValidElement<StructuralLayoutProps>(child)
      ) {
        return;
      }

      demand = mergeLayoutDemand(demand, getElementLayoutDemand(child));
    });
  } catch {
    return null;
  }

  return demand;
}

function getElementLayoutDemand(
  element: React.ReactElement<StructuralLayoutProps>,
): LayoutTransitionType | null {
  const props = element.props;

  if (props.layoutPropagation === 'none') {
    return null;
  }

  const ownDemand = getAnimateLayoutDemand(props.animate);

  if (ownDemand === 'spring-bouncy') {
    return ownDemand;
  }

  return mergeLayoutDemand(
    ownDemand,
    findStructuralLayoutDemand(props.children),
  );
}

function getAnimateLayoutDemand(animate: unknown): LayoutTransitionType | null {
  return typeof animate === 'string'
    ? getLayoutTokenState(animate).explicitTransitionType
    : null;
}

function mergeLayoutDemand(
  current: LayoutTransitionType | null,
  next: LayoutTransitionType | null,
): LayoutTransitionType | null {
  return mergeLayoutTransition(current ?? undefined, next ?? undefined) ?? null;
}

export function mergeRefs<T>(
  primaryRef: React.Ref<T>,
  secondaryRef: React.ForwardedRef<T>,
) {
  return (instance: T | null) => {
    setRef(primaryRef, instance);
    setRef(secondaryRef, instance);
  };
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  try {
    (ref as React.MutableRefObject<T | null>).current = value;
  } catch {
    return;
  }
}
