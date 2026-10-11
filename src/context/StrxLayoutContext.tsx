import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import type { CodexAnimationController } from '../core/useCodexAnimation';
import { warnOnce } from '../utils/warn';

export interface StrxLayoutDebugSnapshot {
  playableCount: number;
  lastEvent: string | null;
  warnings: readonly string[];
}

/**
 * Registry owned by `Strx.LayoutRoot` (and `Strx.Provider`).
 *
 * It connects `strxId` props to `Strx.useTimeline` and collects development
 * diagnostics. Most users do not call it directly.
 */
export interface StrxLayoutContextType {
  /** Registers an event-playable animation target by `strxId`. */
  registerPlayable: (
    strxId: string,
    controller: CodexAnimationController,
  ) => void;
  /** Removes a target, if `controller` is still the registered one. */
  unregisterPlayable: (
    strxId: string,
    controller?: CodexAnimationController,
  ) => void;
  /** Looks up an event-playable animation target by `strxId`. */
  getPlayable: (strxId: string) => CodexAnimationController | undefined;
  /** Returns aggregate debug information for development overlays. */
  getDebugSnapshot: () => StrxLayoutDebugSnapshot;
  /** Records the latest timeline event for development overlays. */
  reportDebugEvent: (event: string) => void;
  /** Records a development warning for overlays and the console. */
  reportDebugWarning: (warning: string) => void;
}

const MAX_DEBUG_WARNINGS = 4;

export const StrxLayoutContext = createContext<StrxLayoutContextType | null>(
  null,
);

/**
 * Root provider for event timeline targets.
 *
 * `Strx.Provider` already includes it. Use it directly when you need
 * `Strx.useTimeline` and `strxId` without the rest of the provider.
 */
export function StrxLayoutRoot({ children }: { children: ReactNode }) {
  const playablesRef = useRef(new Map<string, CodexAnimationController>());
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
    (strxId: string, controller: CodexAnimationController) => {
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
    (strxId: string, controller?: CodexAnimationController) => {
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

  const getDebugSnapshot = useCallback<() => StrxLayoutDebugSnapshot>(
    () => ({
      playableCount: playablesRef.current.size,
      lastEvent: lastDebugEventRef.current,
      warnings: debugWarningsRef.current,
    }),
    [],
  );

  const value = useMemo<StrxLayoutContextType>(
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
    <StrxLayoutContext.Provider value={value}>
      {children}
    </StrxLayoutContext.Provider>
  );
}

export function useStrxLayout(): StrxLayoutContextType | null {
  return useContext(StrxLayoutContext);
}
