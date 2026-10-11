import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { AnimateProp, PlaybackMode } from '../types/animate';
import { useTimelineRegistry } from '../context/TimelineRegistry';
import { useStrxMotion } from '../context/StrxMotionContext';
import {
  compileAnimation,
  estimateAnimationDelay,
  estimateAnimationDuration,
  type StrxCompiledAnimation,
} from './engine';

/**
 * A single event-playable animation target for `Strx.useTimeline`.
 */
export interface StrxTimelinePlayable {
  /**
   * Target component ID.
   *
   * This must match the `strxId` prop on a STRX component inside the nearest
   * `Strx.TimelineRoot`.
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
   * Called once after every target of a finite `play()` or `reverse()` has
   * finished. Not called for infinite timelines, or when the run is stopped,
   * reset, or replaced by another `play()`/`reverse()` first.
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
  animation: StrxCompiledAnimation;
  offset: number;
}

const DEFAULT_TIMELINE_INTERVAL = 100;

/**
 * Creates an event-driven animation controller.
 *
 * `useTimeline` must run under `Strx.TimelineRoot`, because the root owns the
 * registry that connects `playables[].target` to component `strxId` values.
 */
export function useTimeline({
  playback = 'parallel',
  interval = DEFAULT_TIMELINE_INTERVAL,
  playCount,
  playables,
  onComplete,
}: UseTimelineOptions): StrxTimelineController {
  const strxLayout = useTimelineRegistry();
  const motion = useStrxMotion();
  const compiledPlayables = useMemo(
    () =>
      compileTimelinePlayables(playables, playback, interval, {
        duration: motion.duration,
        easing: motion.easing,
        reduceMotionEnabled: motion.isReduceMotionEnabled,
      }),
    [
      interval,
      motion.duration,
      motion.easing,
      motion.isReduceMotionEnabled,
      playback,
      playables,
    ],
  );

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  // Each play/reverse starts a new run; callbacks from older runs are ignored.
  const runIdRef = useRef(0);

  const start = useCallback(
    (direction: 'play' | 'reverse') => {
      if (!strxLayout) {
        return;
      }

      runIdRef.current += 1;
      const runId = runIdRef.current;
      strxLayout.reportDebugEvent(`timeline ${direction} ${playback}`);

      const controllers = compiledPlayables.flatMap(playable => {
        const controller = strxLayout.getPlayable(playable.target);

        if (!controller) {
          strxLayout.reportDebugWarning(
            'Timeline target was not registered. Check strxId.',
          );
          return [];
        }

        return [{ controller, playable }];
      });
      let pending = controllers.length;
      const onFinish =
        playCount === 'infinite'
          ? undefined
          : () => {
              pending -= 1;

              if (pending === 0 && runIdRef.current === runId) {
                onCompleteRef.current?.();
              }
            };

      for (const { controller, playable } of controllers) {
        controller[direction](playable.animation, {
          offset: playable.offset,
          playCount,
          onFinish,
        });
      }
    },
    [compiledPlayables, playCount, playback, strxLayout],
  );

  const play = useCallback(() => start('play'), [start]);
  const reverse = useCallback(() => start('reverse'), [start]);

  const reset = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    runIdRef.current += 1;
    strxLayout.reportDebugEvent('timeline reset');

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.reset(playable.animation);
    }
  }, [compiledPlayables, strxLayout]);

  const stop = useCallback(() => {
    if (!strxLayout) {
      return;
    }

    runIdRef.current += 1;
    strxLayout.reportDebugEvent('timeline stop');

    for (const playable of compiledPlayables) {
      strxLayout.getPlayable(playable.target)?.stop();
    }
  }, [compiledPlayables, strxLayout]);

  useEffect(
    () => () => {
      runIdRef.current += 1;
    },
    [],
  );

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

    const animation = compileAnimation(playable.animate, compileOptions);

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
      const duration = estimateAnimationDuration(animation);

      if (!Number.isFinite(duration)) {
        break;
      }

      serialOffset += duration;
    } else if (playback === 'stagger') {
      staggerDelayCarry += estimateAnimationDelay(animation);
    }
  }

  return compiled;
}

function isSafeTarget(target: string): boolean {
  return target.length > 0 && target.length <= 128;
}
