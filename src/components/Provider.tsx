import React, { type ReactNode } from 'react';

import {
  StrxMotionProvider,
  type StrxMotionPreset,
  type StrxReduceMotionMode,
} from '../context/StrxMotionContext';
import { StrxTimelineRoot } from '../context/TimelineRegistry';

export interface StrxProviderProps {
  children: ReactNode;
  /** Global animation defaults used when individual tokens do not override them. */
  motionPreset?: StrxMotionPreset;
  /** Overrides `motionPreset.reduceMotion` for the whole subtree. */
  reduceMotion?: StrxReduceMotionMode;
}

/**
 * Recommended root provider for STRX apps.
 *
 * It installs global motion settings, the reduce-motion policy, and the
 * registry that connects `strxId` targets to `Strx.useTimeline`.
 */
export function Provider({
  children,
  motionPreset,
  reduceMotion,
}: StrxProviderProps) {
  return (
    <StrxMotionProvider motionPreset={motionPreset} reduceMotion={reduceMotion}>
      <StrxTimelineRoot>{children}</StrxTimelineRoot>
    </StrxMotionProvider>
  );
}

Provider.displayName = 'Strx.Provider';
