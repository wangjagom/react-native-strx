import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { LinearTransition } from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

/**
 * Default transition family used by `Strx.LayoutGroup`.
 */
export type LayoutGroupTransition = 'linear' | 'spring';

/**
 * Reanimated layout transition builder accepted by STRX layout context.
 */
export type LayoutTransitionBuilder =
  | BaseAnimationBuilder
  | typeof BaseAnimationBuilder;

/**
 * Internal context shared by nodes inside `Strx.LayoutGroup`.
 */
export interface LayoutGroupContextValue {
  /** Optional user-provided group identifier. */
  id?: string;
  /** Indicates that descendants are inside a layout group. */
  isInsideGroup: boolean;
  /** Incremented when the group requests a reflow. */
  layoutKey: number;
  /** Schedules a group reflow on the next animation frame. */
  triggerReflow: () => void;
  /** Reanimated layout transition inherited by descendants. */
  defaultLayoutTransition: LayoutTransitionBuilder;
}

/**
 * Props for `Strx.LayoutGroup`.
 *
 * A layout group gives descendants a shared default layout transition. It is
 * useful when multiple nearby nodes should animate size and position changes as
 * one coordinated region.
 */
export interface LayoutGroupProps extends PropsWithChildren {
  /** Optional identifier for debugging or external coordination. */
  id?: string;
  /**
   * Default layout transition used by descendants.
   *
   * `linear` uses a timing transition. `spring` uses a springified transition.
   */
  transition?: LayoutGroupTransition;
  /** Transition duration in milliseconds. */
  duration?: number;
  /** Spring damping value used when `transition="spring"`. */
  damping?: number;
}

const DEFAULT_LINEAR_DURATION = 300;
const DEFAULT_SPRING_DURATION = 400;
const DEFAULT_SPRING_DAMPING = 15;

const LayoutGroupContext = createContext<LayoutGroupContextValue | null>(null);

/**
 * Provides a shared layout transition to STRX descendants.
 */
export function LayoutGroup({
  children,
  damping = DEFAULT_SPRING_DAMPING,
  duration,
  id,
  transition = 'linear',
}: LayoutGroupProps) {
  const [layoutKey, setLayoutKey] = useState(0);
  const frameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  const triggerReflow = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      if (mountedRef.current) {
        setLayoutKey(current => current + 1);
      }
    });
  }, []);

  const defaultLayoutTransition = useMemo(() => {
    if (transition === 'spring') {
      return LinearTransition.springify()
        .duration(duration ?? DEFAULT_SPRING_DURATION)
        .damping(damping);
    }

    return LinearTransition.duration(duration ?? DEFAULT_LINEAR_DURATION);
  }, [damping, duration, transition]);

  const value = useMemo(
    () => ({
      id,
      isInsideGroup: true,
      layoutKey,
      triggerReflow,
      defaultLayoutTransition,
    }),
    [defaultLayoutTransition, id, layoutKey, triggerReflow],
  );

  return (
    <LayoutGroupContext.Provider value={value}>
      {children}
    </LayoutGroupContext.Provider>
  );
}

export function useLayoutGroup(): LayoutGroupContextValue | null {
  return useContext(LayoutGroupContext);
}
