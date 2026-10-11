import { createContext, useContext } from 'react';
import type { LayoutAnimationFunction } from 'react-native-reanimated';

/** Layout transition families selected by `layout-*` tokens. */
export type LayoutTransitionType =
  'linear' | 'spring' | 'fade' | 'spring-stiff' | 'spring-bouncy';

/**
 * Value provided by STRX components to their descendants.
 *
 * `inheritedTransition` is the layout transition descendants inherit, or
 * `undefined` when they should not animate layout changes unless they declare
 * their own `layout-*` token.
 */
export interface LayoutNodeContextType {
  inheritedTransition?: LayoutAnimationFunction;
}

export const LayoutNodeContext = createContext<LayoutNodeContextType | null>(
  null,
);

export function useLayoutNode(): LayoutNodeContextType | null {
  return useContext(LayoutNodeContext);
}
