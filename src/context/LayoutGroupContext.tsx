import React, {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import type { LayoutAnimationFunction } from 'react-native-reanimated';

import { getLayoutTransition } from '../core/layout';
import { LayoutNodeContext } from './LayoutNodeContext';

/**
 * Default transition family used by `Strx.LayoutGroup`.
 */
export type LayoutGroupTransition = 'linear' | 'spring';

/**
 * Context shared by nodes inside `Strx.LayoutGroup`.
 */
export interface LayoutGroupContextValue {
  /** Optional user-provided group identifier. */
  id?: string;
  /** Layout transition inherited by descendants. */
  defaultLayoutTransition: LayoutAnimationFunction;
}

/**
 * Props for `Strx.LayoutGroup`.
 *
 * A layout group gives every STRX descendant a shared layout transition, so
 * size and position changes in the region animate together.
 */
export interface LayoutGroupProps extends PropsWithChildren {
  /** Optional identifier for debugging or external coordination. */
  id?: string;
  /**
   * Default layout transition used by descendants.
   *
   * `linear` uses a timing transition. `spring` uses a spring transition.
   */
  transition?: LayoutGroupTransition;
  /** Transition duration in milliseconds for `transition="linear"`. */
  duration?: number;
  /** Spring damping used when `transition="spring"`. */
  damping?: number;
}

const LayoutGroupContext = createContext<LayoutGroupContextValue | null>(null);

/**
 * Provides a shared layout transition to STRX descendants.
 *
 * The nearest group wins: transitions inherited from STRX ancestors outside
 * the group are replaced by the group's transition inside it.
 */
export function LayoutGroup({
  children,
  damping,
  duration,
  id,
  transition = 'linear',
}: LayoutGroupProps) {
  const value = useMemo<LayoutGroupContextValue>(
    () => ({
      id,
      defaultLayoutTransition: getLayoutTransition(transition, {
        duration,
        spring: damping === undefined ? undefined : { damping },
      }),
    }),
    [damping, duration, id, transition],
  );

  return (
    <LayoutGroupContext.Provider value={value}>
      <LayoutNodeContext.Provider value={null}>
        {children}
      </LayoutNodeContext.Provider>
    </LayoutGroupContext.Provider>
  );
}

export function useLayoutGroup(): LayoutGroupContextValue | null {
  return useContext(LayoutGroupContext);
}
