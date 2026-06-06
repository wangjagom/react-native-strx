import React, { type ReactNode } from 'react';

import { DebugOverlay, type StrxDebugOverlayPosition } from './DebugOverlay';
import { StrxLayoutRoot } from '../context/StrxLayoutContext';
import {
  StrxMotionProvider,
  type StrxMotionPreset,
  type StrxReduceMotionMode,
} from '../context/StrxMotionContext';

export interface StrxProviderProps {
  children: ReactNode;
  /** Global animation defaults used when individual tokens do not override them. */
  motionPreset?: StrxMotionPreset;
  /** Overrides `motionPreset.reduceMotion` for the whole subtree. */
  reduceMotion?: StrxReduceMotionMode;
  /** Enables the aggregate runtime debug overlay. Keep this dev-only. */
  debug?: boolean;
  /** Screen corner used by the debug overlay. */
  debugPosition?: StrxDebugOverlayPosition;
  /** Starts the debug overlay expanded instead of collapsed. */
  debugInitialExpanded?: boolean;
  /** Shows the tiny easing/timing preview inside the debug overlay. */
  debugShowMotionPreview?: boolean;
}

/**
 * Recommended root provider for STRX apps.
 *
 * It installs global motion settings, reduce-motion policy, timeline registry,
 * layout registry, and an optional debug overlay in one place.
 */
export function Provider({
  children,
  motionPreset,
  reduceMotion,
  debug = false,
  debugPosition,
  debugInitialExpanded,
  debugShowMotionPreview,
}: StrxProviderProps) {
  return (
    <StrxMotionProvider
      motionPreset={motionPreset}
      reduceMotion={reduceMotion}
      debug={debug}
    >
      <StrxLayoutRoot>
        {children}
        <DebugOverlay
          enabled={debug}
          position={debugPosition}
          initialExpanded={debugInitialExpanded}
          showMotionPreview={debugShowMotionPreview}
        />
      </StrxLayoutRoot>
    </StrxMotionProvider>
  );
}
