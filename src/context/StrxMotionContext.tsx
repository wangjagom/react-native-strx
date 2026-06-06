import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

export type StrxReduceMotionMode = 'system' | 'always' | 'never';

export type StrxEasingName =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | (string & {});

export interface StrxMotionPreset {
  /** Default duration used when an animation does not declare `duration-*`. */
  duration?: number;
  /** Default easing used when an animation does not declare an easing token. */
  easing?: StrxEasingName;
  /** Reduce-motion policy for STRX animations. */
  reduceMotion?: StrxReduceMotionMode;
}

export interface StrxMotionContextValue {
  duration?: number;
  easing?: StrxEasingName;
  reduceMotion: StrxReduceMotionMode;
  isReduceMotionEnabled: boolean;
  debug: boolean;
}

export interface StrxMotionProviderProps {
  children: ReactNode;
  motionPreset?: StrxMotionPreset;
  reduceMotion?: StrxReduceMotionMode;
  debug?: boolean;
}

const DEFAULT_MOTION_CONTEXT: StrxMotionContextValue = Object.freeze({
  reduceMotion: 'system',
  isReduceMotionEnabled: false,
  debug: false,
});

export const StrxMotionContext = createContext<StrxMotionContextValue>(
  DEFAULT_MOTION_CONTEXT,
);

export function StrxMotionProvider({
  children,
  motionPreset,
  reduceMotion,
  debug = false,
}: StrxMotionProviderProps) {
  const systemReduceMotion = useReducedMotion();
  const resolvedReduceMotion = normalizeReduceMotionMode(
    reduceMotion ?? motionPreset?.reduceMotion,
  );
  const isReduceMotionEnabled =
    resolvedReduceMotion === 'always' ||
    (resolvedReduceMotion === 'system' && systemReduceMotion === true);
  const duration = getSafeDuration(motionPreset?.duration);
  const easing = getSafeEasing(motionPreset?.easing);

  const value = useMemo<StrxMotionContextValue>(
    () => ({
      ...(duration === undefined ? null : { duration }),
      ...(easing === undefined ? null : { easing }),
      reduceMotion: resolvedReduceMotion,
      isReduceMotionEnabled,
      debug,
    }),
    [debug, duration, easing, isReduceMotionEnabled, resolvedReduceMotion],
  );

  return (
    <StrxMotionContext.Provider value={value}>
      {children}
    </StrxMotionContext.Provider>
  );
}

export function useStrxMotion(): StrxMotionContextValue {
  return useContext(StrxMotionContext);
}

function normalizeReduceMotionMode(
  value: StrxReduceMotionMode | undefined,
): StrxReduceMotionMode {
  return value === 'always' || value === 'never' || value === 'system'
    ? value
    : 'system';
}

function getSafeDuration(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function getSafeEasing(value: StrxEasingName | undefined): StrxEasingName | undefined {
  return typeof value === 'string' && value.length > 0 && value.length <= 64
    ? value
    : undefined;
}
