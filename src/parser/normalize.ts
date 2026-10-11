import type { AnimateProp, AnimateStyle } from '../types/animate';
import {
  clearParseCache,
  getParseCacheSize,
  parseAnimate,
  type MotionGroup,
  type MotionTiming,
} from './resolve';

export type StandardAnimConfig = PresetAnimConfig | CustomFromToAnimConfig;

interface SpringOptions {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export interface PresetAnimConfig extends SpringOptions {
  type: string;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
}

export interface CustomFromToAnimConfig extends SpringOptions {
  type?: never;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
  from: AnimateStyle;
  to: AnimateStyle;
}

/**
 * Converts any public `animate` value into explicit animation configs.
 *
 * Only explicit animations (presets and `from:/to:` keyframes) are returned;
 * `exit:`, `transition-*`, and `layout-*` tokens are handled elsewhere. A
 * group with both a preset and keyframes yields the preset config followed by
 * the keyframe config, so keyframes win per channel when merged. Results are
 * fresh objects that callers may mutate.
 */
export function normalizeAnimate(
  animate: AnimateProp | null | undefined,
): StandardAnimConfig[] {
  return parseAnimate(animate).groups.flatMap(groupToConfigs);
}

/** Clears the internal string parse cache. Intended for tests. */
export function clearNormalizeAnimateCache(): void {
  clearParseCache();
}

/** Returns the number of cached string parse entries. */
export function getNormalizeAnimateCacheSize(): number {
  return getParseCacheSize();
}

function groupToConfigs(group: MotionGroup): StandardAnimConfig[] {
  const configs: StandardAnimConfig[] = [];

  if (group.preset !== undefined) {
    configs.push({ type: group.preset, ...copyTiming(group.timing) });
  }

  if (group.from && group.to) {
    configs.push({
      ...copyTiming(group.timing),
      from: { ...group.from },
      to: { ...group.to },
    });
  }

  return configs;
}

function copyTiming(timing: MotionTiming): MotionTiming {
  return { ...timing };
}
