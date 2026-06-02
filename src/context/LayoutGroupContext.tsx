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

export type LayoutGroupTransition = 'linear' | 'spring';
export type LayoutTransitionBuilder =
  | BaseAnimationBuilder
  | typeof BaseAnimationBuilder;

export interface LayoutGroupContextValue {
  id?: string;
  isInsideGroup: boolean;
  layoutKey: number;
  triggerReflow: () => void;
  defaultLayoutTransition: LayoutTransitionBuilder;
}

export interface LayoutGroupProps extends PropsWithChildren {
  id?: string;
  transition?: LayoutGroupTransition;
  duration?: number;
  damping?: number;
}

const DEFAULT_LINEAR_DURATION = 300;
const DEFAULT_SPRING_DURATION = 400;
const DEFAULT_SPRING_DAMPING = 15;

const LayoutGroupContext = createContext<LayoutGroupContextValue | null>(null);

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
