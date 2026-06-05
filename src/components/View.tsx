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
import type { AnimateProp, AnimateStyle, PlaybackMode } from '../types/animate';

const LAYOUT_LINEAR_TOKEN = 'layout-linear';
const LAYOUT_SPRING_TOKEN = 'layout-spring';
const LAYOUT_FADE_TOKEN = 'layout-fade';
const LAYOUT_SPRING_STIFF_TOKEN = 'layout-spring-stiff';
const LAYOUT_SPRING_BOUNCY_TOKEN = 'layout-spring-bouncy';
const FROM_PREFIX = 'from:';
const TO_PREFIX = 'to:';
const EXIT_PREFIX = 'exit:';
export const LAYOUT_CLIP_STYLE: ViewStyle = { overflow: 'hidden' };
const MAX_ANIMATE_STRING_LENGTH = 512;
const TOKEN_CACHE_LIMIT = 256;

const EMPTY_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: null,
  hasLayoutTransition: false,
});

const LINEAR_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: 'linear',
  hasLayoutTransition: true,
});

const SPRING_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: 'spring',
  hasLayoutTransition: true,
});

const FADE_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: 'fade',
  hasLayoutTransition: true,
});

const SPRING_STIFF_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: 'spring-stiff',
  hasLayoutTransition: true,
});

const SPRING_BOUNCY_LAYOUT_TOKEN_STATE: LayoutTokenState = Object.freeze({
  explicitTransitionType: 'spring-bouncy',
  hasLayoutTransition: true,
});

const layoutTokenCache = new Map<string, LayoutTokenState>();
const styleAnimateCache = new Map<string, AnimateProp | undefined>();
const exitTokenCache = new Map<string, ExitTokenState>();

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

const FROM_TO_NEUTRAL_VALUES = Object.freeze({
  opacity: 1,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: '0deg',
  rotateX: '0deg',
  rotateY: '0deg',
  rotateZ: '0deg',
  skewX: '0deg',
  skewY: '0deg',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  borderTopColor: 'transparent',
  borderRightColor: 'transparent',
  borderBottomColor: 'transparent',
  borderLeftColor: 'transparent',
});

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
  const styleAnimateProp = useMemo(
    () => getStyleAnimateProp(animate),
    [animate],
  );
  const exitTokenState = useMemo(() => getExitTokenState(animate), [animate]);
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
  const reanimatedLayout =
    localDemandTransition ??
    parentNode?.inheritedTransition ??
    layoutGroup?.defaultLayoutTransition ??
    stableNoOpTransition;
  const activeLayout = reanimatedLayout;

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

interface PrefixParseState {
  from: AnimateStyle;
  to: AnimateStyle;
  hasFromToToken: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
  plainTokens: string;
}

export interface ExitTokenState {
  hasExitToken: boolean;
  style: AnimateStyle;
  duration?: number;
  delay?: number;
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

export function getLayoutTokenState(
  animate: AnimateProp | undefined,
): LayoutTokenState {
  if (typeof animate !== 'string' || !isSafeAnimateString(animate)) {
    return EMPTY_LAYOUT_TOKEN_STATE;
  }

  const cached = getCachedValue(layoutTokenCache, animate);

  if (cached) {
    return cached;
  }

  const state = parseLayoutTokenState(animate);
  setCappedCache(layoutTokenCache, animate, state);

  return state;
}

function parseLayoutTokenState(animate: string): LayoutTokenState {
  let fallbackDemand: LayoutTransitionType | null = null;
  const immediateDemand = forEachToken(animate, token => {
    const tokenDemand = getLayoutDemandFromToken(token);

    if (!tokenDemand) {
      return undefined;
    }

    if (getTransitionPriority(tokenDemand) >= getTransitionPriority('spring')) {
      return tokenDemand;
    }

    fallbackDemand = mergeTransitionDemand(fallbackDemand, tokenDemand);
    return undefined;
  });

  return getLayoutTokenStateForType(immediateDemand ?? fallbackDemand);
}

export function getStyleAnimateProp(
  animate: AnimateProp | undefined,
): AnimateProp | undefined {
  if (typeof animate !== 'string') {
    return animate;
  }

  if (!isSafeAnimateString(animate)) {
    return undefined;
  }

  const cached = getCachedValue(styleAnimateCache, animate);

  if (cached !== undefined || styleAnimateCache.has(animate)) {
    return cached;
  }

  const parsed = parseStyleAnimateProp(animate);
  setCappedCache(styleAnimateCache, animate, parsed);

  return parsed;
}

function parseStyleAnimateProp(animate: string): AnimateProp | undefined {
  const state: PrefixParseState = {
    from: {},
    to: {},
    hasFromToToken: false,
    plainTokens: '',
  };

  try {
    forEachToken(animate, token => {
      if (isLayoutToken(token) || token.startsWith(EXIT_PREFIX)) {
        return undefined;
      }

      if (token.startsWith(FROM_PREFIX)) {
        state.hasFromToToken =
          applyPrefixedUtility(state.from, token.slice(FROM_PREFIX.length)) ||
          state.hasFromToToken;
        return undefined;
      }

      if (token.startsWith(TO_PREFIX)) {
        state.hasFromToToken =
          applyPrefixedUtility(state.to, token.slice(TO_PREFIX.length)) ||
          state.hasFromToToken;
        return undefined;
      }

      readTimingToken(state, token);
      state.plainTokens = appendToken(state.plainTokens, token);
      return undefined;
    });

    if (!state.hasFromToToken) {
      return state.plainTokens.length > 0 ? state.plainTokens : undefined;
    }

    completeFromToPair(state.from, state.to);

    const result = {
      from: Object.freeze({ ...state.from }),
      to: Object.freeze({ ...state.to }),
      ...(state.duration === undefined ? null : { duration: state.duration }),
      ...(state.delay === undefined ? null : { delay: state.delay }),
    ...(state.easing === undefined ? null : { easing: state.easing }),
    ...(state.repeat === undefined ? null : { repeat: state.repeat }),
    ...(state.playCount === undefined ? null : { playCount: state.playCount }),
  };

    return Object.freeze(result) as AnimateProp;
  } catch {
    return undefined;
  }
}

export function getExitTokenState(animate: AnimateProp | undefined): ExitTokenState {
  if (typeof animate !== 'string' || !isSafeAnimateString(animate)) {
    return EMPTY_EXIT_TOKEN_STATE;
  }

  const cached = getCachedValue(exitTokenCache, animate);

  if (cached) {
    return cached;
  }

  const state = parseExitTokenState(animate);
  setCappedCache(exitTokenCache, animate, state);

  return state;
}

const EMPTY_EXIT_TOKEN_STATE: ExitTokenState = Object.freeze({
  hasExitToken: false,
  style: Object.freeze({}),
});

function parseExitTokenState(animate: string): ExitTokenState {
  const style: AnimateStyle = {};
  let hasExitToken = false;
  let duration: number | undefined;
  let delay: number | undefined;

  try {
    forEachToken(animate, token => {
      if (token.startsWith(EXIT_PREFIX)) {
        hasExitToken =
          applyPrefixedUtility(style, token.slice(EXIT_PREFIX.length)) ||
          hasExitToken;
        return undefined;
      }

      if (token.startsWith('duration-')) {
        duration = parseNumericSuffix(token, 'duration-');
        return undefined;
      }

      if (token.startsWith('delay-')) {
        delay = parseNumericSuffix(token, 'delay-');
      }

      return undefined;
    });
  } catch {
    return EMPTY_EXIT_TOKEN_STATE;
  }

  if (!hasExitToken) {
    return EMPTY_EXIT_TOKEN_STATE;
  }

  return Object.freeze({
    hasExitToken: true,
    style: Object.freeze({ ...style }),
    ...(duration === undefined ? null : { duration }),
    ...(delay === undefined ? null : { delay }),
  });
}

export function getExitAnimation(
  exitTokenState: ExitTokenState,
): EntryExitAnimationFunction | undefined {
  if (!exitTokenState.hasExitToken) {
    return undefined;
  }

  const duration = exitTokenState.duration ?? 300;
  const delay = exitTokenState.delay ?? 0;
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
        opacity: animateExitValue(opacity, duration, delay),
        transform: [
          { translateX: animateExitValue(translateX, duration, delay) },
          { translateY: animateExitValue(translateY, duration, delay) },
          { scale: animateExitValue(scale, duration, delay) },
        ],
      },
    };
  };
}

function animateExitValue(value: number, duration: number, delay: number) {
  'worklet';
  const animation = withTiming(value, { duration });

  return delay > 0 ? withDelay(delay, animation) : animation;
}

function applyPrefixedUtility(style: AnimateStyle, utility: string): boolean {
  if (utility.length === 0 || utility.length > MAX_ANIMATE_STRING_LENGTH) {
    return false;
  }

  let token = utility;
  let sign = 1;

  if (token.charCodeAt(0) === 45) {
    sign = -1;
    token = token.slice(1);
  }

  if (token.startsWith('opacity-')) {
    const value = parseNumericSuffix(token, 'opacity-');

    if (value === undefined) {
      return false;
    }

    style.opacity = clamp(value, 0, 100) / 100;
    return true;
  }

  if (token.startsWith('translate-x-')) {
    const value = parseNumericSuffix(token, 'translate-x-');

    if (value === undefined) {
      return false;
    }

    style.translateX = value * sign;
    return true;
  }

  if (token.startsWith('translate-y-')) {
    const value = parseNumericSuffix(token, 'translate-y-');

    if (value === undefined) {
      return false;
    }

    style.translateY = value * sign;
    return true;
  }

  if (token.startsWith('scale-x-')) {
    const value = parseNumericSuffix(token, 'scale-x-');

    if (value === undefined) {
      return false;
    }

    style.scaleX = value / 100;
    return true;
  }

  if (token.startsWith('scale-y-')) {
    const value = parseNumericSuffix(token, 'scale-y-');

    if (value === undefined) {
      return false;
    }

    style.scaleY = value / 100;
    return true;
  }

  if (token.startsWith('scale-')) {
    const value = parseNumericSuffix(token, 'scale-');

    if (value === undefined) {
      return false;
    }

    style.scale = value / 100;
    return true;
  }

  if (token.startsWith('rotate-')) {
    const value = parseNumericSuffix(token, 'rotate-');

    if (value === undefined) {
      return false;
    }

    style.rotate = `${value * sign}deg`;
    return true;
  }

  if (token.startsWith('w-')) {
    const value = parseNumericSuffix(token, 'w-');

    if (value === undefined) {
      return false;
    }

    style.width = value * sign;
    return true;
  }

  if (token.startsWith('h-')) {
    const value = parseNumericSuffix(token, 'h-');

    if (value === undefined) {
      return false;
    }

    style.height = value * sign;
    return true;
  }

  return false;
}

function readTimingToken(state: PrefixParseState, token: string): void {
  if (token.startsWith('duration-')) {
    state.duration = parseNumericSuffix(token, 'duration-');
    return;
  }

  if (token.startsWith('delay-')) {
    state.delay = parseNumericSuffix(token, 'delay-');
    return;
  }

  if (token === 'repeat-infinite') {
    state.repeat = 'infinite';
    return;
  }

  if (token.startsWith('repeat-')) {
    state.repeat = parseNumericSuffix(token, 'repeat-');
    return;
  }

  if (token === 'play-infinite') {
    state.playCount = 'infinite';
    return;
  }

  if (token.startsWith('play-')) {
    state.playCount = parsePlayCountSuffix(token);
    return;
  }

  if (
    token === 'linear' ||
    token === 'ease' ||
    token === 'ease-in' ||
    token === 'ease-out' ||
    token === 'ease-in-out'
  ) {
    state.easing = token;
  }
}

function completeFromToPair(from: AnimateStyle, to: AnimateStyle): void {
  const seenKeys = new Set<string>();

  for (const key of Object.keys(from)) {
    seenKeys.add(key);
  }

  for (const key of Object.keys(to)) {
    seenKeys.add(key);
  }

  for (const key of seenKeys) {
    const neutral = neutralFromToValue(key);
    const fromRecord = from as Record<string, unknown>;
    const toRecord = to as Record<string, unknown>;

    if (fromRecord[key] === undefined) {
      fromRecord[key] = neutral;
    }

    if (toRecord[key] === undefined) {
      toRecord[key] = neutral;
    }
  }
}

function neutralFromToValue(key: string): number | string {
  const neutralValues = FROM_TO_NEUTRAL_VALUES as Record<
    string,
    number | string
  >;
  const mappedValue = neutralValues[key];

  if (mappedValue !== undefined) {
    return mappedValue;
  }

  if (key.endsWith('Color')) {
    return 'transparent';
  }

  return 0;
}

function getLayoutTokenStateForType(
  transitionType: LayoutTransitionType | null | undefined,
): LayoutTokenState {
  switch (transitionType) {
    case 'linear':
      return LINEAR_LAYOUT_TOKEN_STATE;
    case 'spring':
      return SPRING_LAYOUT_TOKEN_STATE;
    case 'fade':
      return FADE_LAYOUT_TOKEN_STATE;
    case 'spring-stiff':
      return SPRING_STIFF_LAYOUT_TOKEN_STATE;
    case 'spring-bouncy':
      return SPRING_BOUNCY_LAYOUT_TOKEN_STATE;
    default:
      return EMPTY_LAYOUT_TOKEN_STATE;
  }
}

function getLayoutDemandFromToken(token: string): LayoutTransitionType | null {
  switch (token) {
    case LAYOUT_SPRING_BOUNCY_TOKEN:
      return 'spring-bouncy';
    case LAYOUT_SPRING_STIFF_TOKEN:
      return 'spring-stiff';
    case LAYOUT_SPRING_TOKEN:
      return 'spring';
    case LAYOUT_FADE_TOKEN:
      return 'fade';
    case LAYOUT_LINEAR_TOKEN:
      return 'linear';
    default:
      return null;
  }
}

function isLayoutToken(token: string): boolean {
  return getLayoutDemandFromToken(token) !== null;
}

function mergeTransitionDemand(
  current: LayoutTransitionType | null,
  next: LayoutTransitionType | null,
): LayoutTransitionType | null {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  return getTransitionPriority(next) > getTransitionPriority(current)
    ? next
    : current;
}

function getTransitionPriority(transitionType: LayoutTransitionType): number {
  switch (transitionType) {
    case 'spring-bouncy':
      return 5;
    case 'spring-stiff':
      return 4;
    case 'spring':
      return 3;
    case 'fade':
      return 2;
    case 'linear':
    default:
      return 1;
  }
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

      demand = mergeTransitionDemand(demand, getElementLayoutDemand(child));
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

  return mergeTransitionDemand(
    ownDemand,
    findStructuralLayoutDemand(props.children),
  );
}

function getAnimateLayoutDemand(animate: unknown): LayoutTransitionType | null {
  return typeof animate === 'string'
    ? getLayoutTokenState(animate).explicitTransitionType
    : null;
}

function isSafeAnimateString(animate: string): boolean {
  return animate.length <= MAX_ANIMATE_STRING_LENGTH;
}

function appendToken(input: string, token: string): string {
  return input.length === 0 ? token : `${input} ${token}`;
}

function parseNumericSuffix(token: string, prefix: string): number | undefined {
  if (!token.startsWith(prefix)) {
    return undefined;
  }

  return parseUnsignedNumber(token.slice(prefix.length));
}

function parsePlayCountSuffix(token: string): number | 'infinite' | undefined {
  if (token === 'play-infinite') {
    return 'infinite';
  }

  const value = parseNumericSuffix(token, 'play-');

  return value !== undefined && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

function parseUnsignedNumber(input: string): number | undefined {
  if (input.length === 0 || input.length > 12) {
    return undefined;
  }

  let dotCount = 0;

  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);
    const isDigit = charCode >= 48 && charCode <= 57;
    const isDot = charCode === 46;

    if (isDot) {
      dotCount += 1;
    }

    if ((!isDigit && !isDot) || dotCount > 1) {
      return undefined;
    }
  }

  const value = Number(input);

  return Number.isFinite(value) ? value : undefined;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function forEachToken<Result>(
  input: string,
  visitor: (token: string) => Result | undefined,
): Result | undefined {
  let tokenStart = -1;

  for (let index = 0; index <= input.length; index += 1) {
    const charCode = index < input.length ? input.charCodeAt(index) : 32;
    const isBoundary = isTokenBoundary(charCode);

    if (!isBoundary && tokenStart === -1) {
      tokenStart = index;
    }

    if ((isBoundary || index === input.length) && tokenStart !== -1) {
      const token = input.slice(tokenStart, index);
      const result = visitor(token);

      if (result !== undefined) {
        return result;
      }

      tokenStart = -1;
    }
  }

  return undefined;
}

function isTokenBoundary(charCode: number): boolean {
  return (
    charCode === 32 ||
    charCode === 9 ||
    charCode === 10 ||
    charCode === 13 ||
    charCode === 44
  );
}

function getCachedValue<Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
): Value | undefined {
  const value = cache.get(key);

  if (value !== undefined || cache.has(key)) {
    cache.delete(key);
    cache.set(key, value as Value);
  }

  return value;
}

function setCappedCache<Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value,
): void {
  if (cache.has(key)) {
    cache.delete(key);
  }

  while (cache.size >= TOKEN_CACHE_LIMIT) {
    const firstKey = cache.keys().next().value as Key | undefined;

    if (firstKey === undefined) {
      break;
    }

    cache.delete(firstKey);
  }

  cache.set(key, value);
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
