import { useCallback, useMemo } from 'react';

import type { AnimateProp, PlaybackMode } from '../types/animate';
import { useStrxLayout } from '../context/StrxLayoutContext';
import {
  compileCodexAnimation,
  estimateCodexAnimationDelay,
  estimateCodexAnimationDuration,
  type CodexCompiledAnimation,
} from './useCodexAnimation';

/**
 * A single event-playable animation target for `Strx.useTimeline`.
 */
export interface StrxTimelinePlayable {
  /**
   * Target component ID.
   *
   * This must match the `strxId` prop on a STRX component inside the nearest
   * `Strx.LayoutRoot`.
   */
  target: string;
  /**
   * Animation to run when the timeline plays.
   *
   * Accepts the same values as a component `animate` prop.
   */
  animate: AnimateProp;
}

/**
 * Options used to create an event-driven STRX timeline.
 */
export interface UseTimelineOptions {
  /**
   * How target animations are scheduled.
   *
   * - `parallel`: all targets start together.
   * - `serial`: each target waits for the previous target's estimated duration.
   * - `stagger`: each target starts at `interval` millisecond offsets.
   */
  playback?: PlaybackMode;
  /**
   * Millisecond offset between targets when `playback="stagger"`.
   *
   * Invalid or negative values are treated as `0`.
   */
  interval?: number;
  /**
   * Number of times to play each target animation.
   *
   * Use `"infinite"` to loop until `timeline.stop()` is called.
   */
  playCount?: number | 'infinite';
  /**
   * Target animations controlled by this timeline.
   */
  playables: readonly StrxTimelinePlayable[];
}

/**
 * Controller returned by `Strx.useTimeline`.
 */
export interface StrxTimelineController {
  /**
   * Starts every registered target animation using the configured playback
   * mode, interval, and play count.
   */
  play: () => void;
  /**
   * Clears event-driven animated styles for all configured targets.
   */
  reset: () => void;
  /**
   * Cancels pending starts and running animations for all configured targets.
   */
  stop: () => void;
}

interface CompiledTimelinePlayable {
  target: string;
  animation: CodexCompiledAnimation;
  offset: number;
}

const DEFAULT_TIMELINE_INTERVAL = 100;

/**
 * Creates an event-driven animation controller.
 *
 * `useTimeline` must run under `Strx.LayoutRoot`, because the root owns the
 * registry that connects `playables[].target` to component `strxId` values.
 */
export function useTimeline({
  playback = 'parallel',
  interval = DEFAULT_TIMELINE_INTERVAL,
  playCount,
  playables,
}: UseTimelineOptions): StrxTimelineController {
  const strxLayout = useStrxLayout();
  const compiledPlayables = useMemo(
    () => compileTimelinePlayables(playables, playback, interval),
    [interval, playback, playables],
  );

  const play = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    for (const playable of compiledPlayables) {
      const controller = strxLayout.getPlayable(playable.target);

      if (!controller) {
        continue;
      }

      controller.play(playable.animation, {
        offset: playable.offset,
        playCount,
      });
    }
  }, [compiledPlayables, playCount, strxLayout]);

  const reset = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.reset();
    }
  }, [compiledPlayables, strxLayout]);

  const stop = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.stop();
    }
  }, [compiledPlayables, strxLayout]);

  return useMemo(
    () => ({
      play,
      reset,
      stop,
    }),
    [play, reset, stop],
  );
}

function compileTimelinePlayables(
  playables: readonly StrxTimelinePlayable[],
  playback: PlaybackMode,
  interval: number,
): CompiledTimelinePlayable[] {
  const compiled: CompiledTimelinePlayable[] = [];
  const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : 0;
  let serialOffset = 0;
  let staggerDelayCarry = 0;

  for (let index = 0; index < playables.length; index += 1) {
    const playable = playables[index];

    if (!playable || !isSafeTarget(playable.target)) {
      continue;
    }

    const animation = compileCodexAnimation(playable.animate);

    if (!animation) {
      continue;
    }

    const offset =
      playback === 'serial'
        ? serialOffset
        : playback === 'stagger'
          ? staggerDelayCarry + index * safeInterval
          : 0;

    compiled.push({
      target: playable.target,
      animation,
      offset,
    });

    if (playback === 'serial') {
      const duration = estimateCodexAnimationDuration(animation);

      if (!Number.isFinite(duration)) {
        break;
      }

      serialOffset += duration;
    } else if (playback === 'stagger') {
      staggerDelayCarry += estimateCodexAnimationDelay(animation);
    }
  }

  return compiled;
}

function isSafeTarget(target: string): boolean {
  return target.length > 0 && target.length <= 128;
}
