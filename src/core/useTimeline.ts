import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { AnimateProp, PlaybackMode } from '../types/animate';
import { useStrxLayout } from '../context/StrxLayoutContext';
import { useStrxMotion } from '../context/StrxMotionContext';
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
   * - `serial`: each target waits for the previous target's estimated delay + duration.
   * - `stagger`: each target starts at `interval` offsets, and previous explicit
   *   `delay-*` values push later targets back.
   */
  playback?: PlaybackMode;
  /**
   * Millisecond offset between targets when `playback="stagger"`.
   * Previous target `delay-*` tokens are also added to later stagger offsets.
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
  /**
   * Called once after a finite `play()` or `reverse()` timeline is expected to finish.
   * Infinite timelines do not call this callback.
   */
  onComplete?: () => void;
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
   * Starts every registered target animation from its declared `to` frame back
   * to `from`, using the same playback mode, interval, and play count.
   */
  reverse: () => void;
  /**
   * Immediately returns all configured targets to their declared `from` frame.
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
  onComplete,
}: UseTimelineOptions): StrxTimelineController {
  const strxLayout = useStrxLayout();
  const motion = useStrxMotion();
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compiledPlayables = useMemo(
    () => compileTimelinePlayables(playables, playback, interval, {
      duration: motion.duration,
      easing: motion.easing,
      reduceMotionEnabled: motion.isReduceMotionEnabled,
    }),
    [interval, motion.duration, motion.easing, motion.isReduceMotionEnabled, playback, playables],
  );

  const clearCompleteTimer = useCallback(() => {
    if (completeTimerRef.current !== null) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  }, []);

  const scheduleComplete = useCallback(() => {
    clearCompleteTimer();

    if (!onComplete || playCount === 'infinite') {
      return;
    }

    const duration = getTimelineTotalDuration(compiledPlayables, playCount);

    if (!Number.isFinite(duration)) {
      return;
    }

    completeTimerRef.current = setTimeout(() => {
      completeTimerRef.current = null;
      onComplete();
    }, duration);
  }, [clearCompleteTimer, compiledPlayables, onComplete, playCount]);

  const play = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    clearCompleteTimer();
    strxLayout.reportDebugEvent(`timeline play ${playback}`);

    for (const playable of compiledPlayables) {
      const controller = strxLayout.getPlayable(playable.target);

      if (!controller) {
        strxLayout.reportDebugWarning('Timeline target was not registered. Check strxId.');
        continue;
      }

      controller.play(playable.animation, {
        offset: playable.offset,
        playCount,
      });
    }

    scheduleComplete();
  }, [clearCompleteTimer, compiledPlayables, playCount, playback, scheduleComplete, strxLayout]);

  const reverse = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    clearCompleteTimer();
    strxLayout.reportDebugEvent(`timeline reverse ${playback}`);

    for (const playable of compiledPlayables) {
      const controller = strxLayout.getPlayable(playable.target);

      if (!controller) {
        strxLayout.reportDebugWarning('Timeline target was not registered. Check strxId.');
        continue;
      }

      controller.reverse(playable.animation, {
        offset: playable.offset,
        playCount,
      });
    }

    scheduleComplete();
  }, [clearCompleteTimer, compiledPlayables, playCount, playback, scheduleComplete, strxLayout]);

  const reset = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    clearCompleteTimer();
    strxLayout.reportDebugEvent('timeline reset');

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.reset(playable.animation);
    }
  }, [clearCompleteTimer, compiledPlayables, strxLayout]);

  const stop = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    clearCompleteTimer();
    strxLayout.reportDebugEvent('timeline stop');

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.stop();
    }
  }, [clearCompleteTimer, compiledPlayables, strxLayout]);

  useEffect(() => {
    return clearCompleteTimer;
  }, [clearCompleteTimer]);

  return useMemo(
    () => ({
      play,
      reverse,
      reset,
      stop,
    }),
    [play, reset, reverse, stop],
  );
}

function compileTimelinePlayables(
  playables: readonly StrxTimelinePlayable[],
  playback: PlaybackMode,
  interval: number,
  compileOptions = {},
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

    const animation = compileCodexAnimation(playable.animate, compileOptions);

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

function getTimelineTotalDuration(
  playables: readonly CompiledTimelinePlayable[],
  playCount: number | 'infinite' | undefined,
): number {
  let total = 0;

  for (const playable of playables) {
    const duration = getAnimationDuration(playable.animation, playCount);

    if (!Number.isFinite(duration)) {
      return Infinity;
    }

    total = Math.max(total, playable.offset + duration);
  }

  return total;
}

function getAnimationDuration(
  animation: CodexCompiledAnimation,
  playCount: number | 'infinite' | undefined,
): number {
  if (playCount === undefined) {
    return estimateCodexAnimationDuration(animation);
  }

  if (playCount === 'infinite') {
    return Infinity;
  }

  const count = Number.isFinite(playCount) && playCount > 0 ? playCount : 1;

  return Math.max(0, animation.plan.delay) +
    Math.max(0, animation.plan.duration) * count;
}

function isSafeTarget(target: string): boolean {
  return target.length > 0 && target.length <= 128;
}
