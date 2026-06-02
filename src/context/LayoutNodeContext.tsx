import { createContext, useContext } from 'react';
import type { LayoutAnimationFunction } from 'react-native-reanimated';

import type { LayoutTransitionBuilder } from './LayoutGroupContext';

export type LayoutTransitionType =
  | 'linear'
  | 'spring'
  | 'fade'
  | 'spring-stiff'
  | 'spring-bouncy';

export interface LayoutNodeContextType {
  parentId: string | null;
  registerLayoutDemand: (
    sourceId: string,
    transitionType: LayoutTransitionType,
  ) => void;
  isInsideActiveReflowZone: boolean;
  inheritedTransition?: LayoutTransitionBuilder | LayoutAnimationFunction;
}

export const noopRegisterLayoutDemand: LayoutNodeContextType['registerLayoutDemand'] =
  () => {};

export const LayoutNodeContext = createContext<LayoutNodeContextType | null>(
  null,
);

export function useLayoutNode(): LayoutNodeContextType | null {
  return useContext(LayoutNodeContext);
}
