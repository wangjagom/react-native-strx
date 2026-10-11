import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import type { StrxAnimationController } from '../core/engine';
import { warnOnce } from '../utils/warn';

export interface StrxTimelineDebugSnapshot {
  playableCount: number;
  lastEvent: string | null;
  warnings: readonly string[];
}

/**
 * Registry owned by `Strx.TimelineRoot` (and `Strx.Provider`).
 *
 * It connects `strxId` props to `Strx.useTimeline` and collects development
 * diagnostics. Most users do not call it directly.
 */
export interface StrxTimelineRegistry {
  /** Registers an event-playable animation target by `strxId`. */
  registerPlayable: (
    strxId: string,
    controller: StrxAnimationController,
  ) => void;
  /** Removes a target, if `controller` is still the registered one. */
  unregisterPlayable: (
    strxId: string,
    controller?: StrxAnimationController,
  ) => void;
  /** Looks up an event-playable animation target by `strxId`. */
  getPlayable: (strxId: string) => StrxAnimationController | undefined;
  /** Returns aggregate debug information for development overlays. */
  getDebugSnapshot: () => StrxTimelineDebugSnapshot;
  /** Records the latest timeline event for development overlays. */
  reportDebugEvent: (event: string) => void;
  /** Records a development warning for overlays and the console. */
  reportDebugWarning: (warning: string) => void;
}

const MAX_DEBUG_WARNINGS = 4;

export const TimelineRegistryContext =
  createContext<StrxTimelineRegistry | null>(null);

/**
 * Root provider for event timeline targets.
 *
 * `Strx.Provider` already includes it. Use it directly when you need
 * `Strx.useTimeline` and `strxId` without the rest of the provider.
 */
export function StrxTimelineRoot({ children }: { children: ReactNode }) {
  const playablesRef = useRef(new Map<string, StrxAnimationController>());
  const lastDebugEventRef = useRef<string | null>(null);
  const debugWarningsRef = useRef<string[]>([]);

  const reportDebugEvent = useCallback((event: string) => {
    lastDebugEventRef.current = event;
  }, []);

  const reportDebugWarning = useCallback((warning: string) => {
    warnOnce(`registry:${warning}`, warning);

    if (debugWarningsRef.current.at(-1) === warning) {
      return;
    }

    debugWarningsRef.current = [
      ...debugWarningsRef.current.slice(-(MAX_DEBUG_WARNINGS - 1)),
      warning,
    ];
  }, []);

  const registerPlayable = useCallback(
    (strxId: string, controller: StrxAnimationController) => {
      const existing = playablesRef.current.get(strxId);

      if (existing && existing !== controller) {
        reportDebugWarning(
          `Duplicate strxId "${strxId}" replaced an existing timeline target.`,
        );
      }

      playablesRef.current.set(strxId, controller);
    },
    [reportDebugWarning],
  );

  const unregisterPlayable = useCallback(
    (strxId: string, controller?: StrxAnimationController) => {
      if (
        controller === undefined ||
        playablesRef.current.get(strxId) === controller
      ) {
        playablesRef.current.delete(strxId);
      }
    },
    [],
  );

  const getPlayable = useCallback(
    (strxId: string) => playablesRef.current.get(strxId),
    [],
  );

  const getDebugSnapshot = useCallback<() => StrxTimelineDebugSnapshot>(
    () => ({
      playableCount: playablesRef.current.size,
      lastEvent: lastDebugEventRef.current,
      warnings: debugWarningsRef.current,
    }),
    [],
  );

  const value = useMemo<StrxTimelineRegistry>(
    () => ({
      registerPlayable,
      unregisterPlayable,
      getPlayable,
      getDebugSnapshot,
      reportDebugEvent,
      reportDebugWarning,
    }),
    [
      getDebugSnapshot,
      getPlayable,
      registerPlayable,
      reportDebugEvent,
      reportDebugWarning,
      unregisterPlayable,
    ],
  );

  return (
    <TimelineRegistryContext.Provider value={value}>
      {children}
    </TimelineRegistryContext.Provider>
  );
}

export function useTimelineRegistry(): StrxTimelineRegistry | null {
  return useContext(TimelineRegistryContext);
}
