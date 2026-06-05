import React, {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';

import { animationPresets } from '../core/presets';
import { normalizeAnimate, type StandardAnimConfig } from '../parser/normalize';
import type { AnimateObject, AnimateProp, PlaybackMode } from '../types/animate';
import { View, type CodexViewProps } from './View';

/**
 * Props for `Strx.Timeline`.
 *
 * `Strx.Timeline` wraps children and injects timing controls into each child's
 * `animate` prop. It is useful for render-time entrance choreography where
 * several child components should appear together, one after another, or with a
 * staggered delay.
 */
export interface TimelineProps
  extends Omit<CodexViewProps, 'animate' | 'children' | 'playback' | 'interval'> {
  /**
   * How child animations are scheduled.
   *
   * - `parallel`: all child animations start together.
   * - `serial`: each child waits for the previous child's estimated duration.
   * - `stagger`: each child starts at `interval` millisecond offsets.
   */
  playback?: PlaybackMode;
  /**
   * Millisecond offset between children when `playback="stagger"`.
   *
   * Invalid or negative values are treated as `0`.
   */
  interval?: number;
  /**
   * Number of times to play the whole child choreography.
   *
   * Use `"infinite"` for a loop. When a finite value greater than `1` is used,
   * STRX spaces repeat cycles using the estimated duration of the full timeline.
   */
  playCount?: number | 'infinite';
  /**
   * Child elements whose `animate` props should be orchestrated.
   *
   * Non-element children are rendered unchanged.
   */
  children: ReactNode;
}

interface TimelineChildProps {
  animate?: AnimateProp;
  [key: string]: unknown;
}

const DEFAULT_TIMELINE_INTERVAL = 100;
const DEFAULT_TIMELINE_DURATION = 300;

/**
 * Render-time choreography wrapper for STRX children.
 *
 * Unlike `Strx.useTimeline`, this component starts from render by modifying the
 * child `animate` declarations. Use `Strx.useTimeline` when an event such as
 * `onPress` should start the animation.
 */
export function Timeline({
  playback = 'parallel',
  interval = DEFAULT_TIMELINE_INTERVAL,
  playCount,
  children,
  ...props
}: TimelineProps) {
  const orchestratedChildren = useMemo(() => {
    const childList = Children.toArray(children);
    const childOffsets: number[] = [];
    const childDurations: number[] = [];
    let serialOffset = 0;
    let staggerDelayCarry = 0;
    const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : 0;

    for (let index = 0; index < childList.length; index += 1) {
      const child = childList[index];

      if (!isValidElement<TimelineChildProps>(child)) {
        childOffsets[index] = 0;
        childDurations[index] = 0;
        continue;
      }

      const offset =
        playback === 'serial'
          ? serialOffset
          : playback === 'stagger'
            ? staggerDelayCarry + index * safeInterval
            : 0;
      const duration = estimateAnimateDuration(child.props.animate, undefined);
      const delay = estimateAnimateDelay(child.props.animate);

      childOffsets[index] = offset;
      childDurations[index] = duration;

      if (playback === 'serial' && Number.isFinite(duration)) {
        serialOffset += duration;
      } else if (playback === 'stagger') {
        staggerDelayCarry += delay;
      }
    }

    const cycleDuration = getTimelineCycleDuration(childOffsets, childDurations);

    return childList.map((child, index) => {
      if (!isValidElement<TimelineChildProps>(child)) {
        return child;
      }

      const animate = child.props.animate;
      const offset = childOffsets[index] ?? 0;
      const nextAnimate = createTimelineAnimate(
        animate,
        offset,
        playCount,
      );
      const playbackProps =
        typeof playCount === 'number' && playCount > 1
          ? { playback: 'stagger' as PlaybackMode, interval: cycleDuration }
          : null;

      return cloneElement(child as ReactElement<TimelineChildProps>, {
        animate: nextAnimate,
        ...playbackProps,
      });
    });
  }, [children, interval, playback, playCount]);

  return <View {...props}>{orchestratedChildren}</View>;
}

Timeline.displayName = 'StrxTimeline';

function createTimelineAnimate(
  animate: AnimateProp | undefined,
  offset: number,
  playCount: number | 'infinite' | undefined,
): AnimateProp | undefined {
  if (animate === undefined || animate === null) {
    return animate;
  }

  if (typeof playCount === 'number' && playCount > 1) {
    const entries: AnimateProp[] = [];

    for (let cycle = 0; cycle < playCount; cycle += 1) {
      const entry = applyTimelineControls(animate, offset, undefined);

      if (entry !== undefined && entry !== null) {
        entries.push(entry);
      }
    }

    return entries;
  }

  return applyTimelineControls(animate, offset, playCount);
}

function applyTimelineControls(
  animate: AnimateProp | undefined,
  delayOffset: number,
  playCount: number | 'infinite' | undefined,
): AnimateProp | undefined {
  if (animate === undefined || animate === null) {
    return animate;
  }

  if (Array.isArray(animate)) {
    return animate.map(entry =>
      applyTimelineControls(entry, delayOffset, playCount),
    ) as AnimateProp;
  }

  if (typeof animate === 'string') {
    return appendControlTokens(animate, delayOffset, playCount);
  }

  if (typeof animate === 'object') {
    const object = animate as AnimateObject;

    return {
      ...object,
      ...(delayOffset > 0
        ? { delay: getNumberValue(object.delay) + delayOffset }
        : null),
      ...(playCount === undefined ? null : { playCount }),
    } as AnimateObject;
  }

  return animate;
}

function appendControlTokens(
  animate: string,
  delayOffset: number,
  playCount: number | 'infinite' | undefined,
): string {
  let result = animate;

  if (delayOffset > 0) {
    result = `${result} delay-${Math.round(delayOffset)}`;
  }

  if (playCount !== undefined) {
    result = `${result} ${playCount === 'infinite' ? 'play-infinite' : `play-${playCount}`}`;
  }

  return result;
}

function estimateAnimateDuration(
  animate: AnimateProp | undefined,
  timelinePlayCount: number | 'infinite' | undefined,
): number {
  if (animate === undefined || animate === null) {
    return 0;
  }

  const configs = normalizeAnimate(animate);
  let longest = 0;

  for (const config of configs) {
    const duration = getConfigDuration(config);
    const delay = getNumberValue(config.delay);
    const playCount = timelinePlayCount ?? config.playCount ?? config.repeat ?? 1;

    if (playCount === 'infinite') {
      return Number.POSITIVE_INFINITY;
    }

    longest = Math.max(longest, delay + duration * Math.max(1, playCount));
  }

  return longest;
}

function estimateAnimateDelay(animate: AnimateProp | undefined): number {
  if (animate === undefined || animate === null) {
    return 0;
  }

  const configs = normalizeAnimate(animate);
  let longestDelay = 0;

  for (const config of configs) {
    longestDelay = Math.max(longestDelay, getNumberValue(config.delay));
  }

  return longestDelay;
}

function getTimelineCycleDuration(
  offsets: number[],
  durations: number[],
): number {
  let duration = DEFAULT_TIMELINE_DURATION;

  for (let index = 0; index < offsets.length; index += 1) {
    const offset = offsets[index] ?? 0;
    const childDuration = durations[index] ?? 0;

    if (Number.isFinite(offset) && Number.isFinite(childDuration)) {
      duration = Math.max(duration, offset + childDuration);
    }
  }

  return duration;
}

function getConfigDuration(config: StandardAnimConfig): number {
  if (typeof config.duration === 'number' && Number.isFinite(config.duration)) {
    return config.duration;
  }

  if ('type' in config && typeof config.type === 'string') {
    return animationPresets[config.type]?.options.duration ?? DEFAULT_TIMELINE_DURATION;
  }

  return DEFAULT_TIMELINE_DURATION;
}

function getNumberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
