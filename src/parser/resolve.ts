import type { LayoutTransitionType } from '../context/LayoutNodeContext';
import { animationPresets, getPreset } from '../core/presets';
import type {
  AnimateObject,
  AnimateProp,
  AnimateStyle,
} from '../types/animate';
import { LruCache } from '../utils/lru';
import { warnOnce } from '../utils/warn';
import {
  applyUtility,
  EASING_TOKENS,
  LAYOUT_TOKENS,
  mergeLayoutTransition,
  parseUnsignedNumber,
  SPRING_TOKEN,
  TRANSITION_TOKENS,
  UTILITIES,
  type TransitionKind,
} from './tokens';

/** Timing and driver options shared by every animation kind. */
export interface MotionTiming {
  duration?: number;
  delay?: number;
  /** Easing token, or `"spring"` to use the spring driver. */
  easing?: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
  damping?: number;
  stiffness?: number;
  mass?: number;
}

/**
 * One explicit animation: a preset, `from:/to:` keyframes, or both.
 *
 * Comma-separated parts of a string and array entries each become a group.
 * When both a preset and keyframes are present, keyframes override the
 * preset per channel.
 */
export interface MotionGroup {
  preset?: string;
  from?: AnimateStyle;
  to?: AnimateStyle;
  timing: MotionTiming;
}

export interface MotionExit {
  style: AnimateStyle;
  timing: MotionTiming;
}

export interface MotionTransition {
  kind: TransitionKind;
  timing: MotionTiming;
}

/**
 * Normalized result of parsing any `animate` value.
 *
 * This is the single source of truth for every STRX consumer: components,
 * the animation engine, `Strx.Timeline`, and `Strx.useTimeline`.
 */
export interface MotionSpec {
  groups: readonly MotionGroup[];
  exit?: MotionExit;
  transition?: MotionTransition;
  layout?: LayoutTransitionType;
  /** Tokens that could not be understood. Reported once in development. */
  invalidTokens: readonly string[];
}

const PARSE_CACHE_LIMIT = 256;
const parseCache = new LruCache<string, MotionSpec>(PARSE_CACHE_LIMIT);

const EMPTY_SPEC: MotionSpec = Object.freeze({
  groups: Object.freeze([]),
  invalidTokens: Object.freeze([]),
});

const EASING_SET = new Set<string>(EASING_TOKENS);

/**
 * Parses any public `animate` value into a `MotionSpec`.
 *
 * String results are cached and must be treated as read-only.
 */
export function parseAnimate(
  animate: AnimateProp | null | undefined,
): MotionSpec {
  if (animate == null) {
    return EMPTY_SPEC;
  }

  if (typeof animate === 'string') {
    return parseAnimateString(animate);
  }

  if (Array.isArray(animate)) {
    return mergeSpecs(animate.map(entry => parseAnimate(entry)));
  }

  return parseAnimateObject(animate as AnimateObject);
}

/** Clears the string parse cache. Intended for tests and diagnostics. */
export function clearParseCache(): void {
  parseCache.clear();
}

/** Number of cached string parse results. */
export function getParseCacheSize(): number {
  return parseCache.size;
}

function parseAnimateString(input: string): MotionSpec {
  const cached = parseCache.get(input);

  if (cached) {
    return cached;
  }

  const spec = buildStringSpec(input);
  parseCache.set(input, spec);

  if (spec.invalidTokens.length > 0) {
    warnOnce(`animate:${input}`, describeInvalidTokens(input, spec));
  }

  return spec;
}

function buildStringSpec(input: string): MotionSpec {
  const groups: MotionGroup[] = [];
  const invalidTokens: string[] = [];
  let exit: MotionExit | undefined;
  let transition: MotionTransition | undefined;
  let layout: LayoutTransitionType | undefined;

  for (const part of input.split(',')) {
    const tokens = part.split(/\s+/).filter(token => token.length > 0);
    const timing: MotionTiming = {};
    const from: AnimateStyle = {};
    const to: AnimateStyle = {};
    const exitStyle: AnimateStyle = {};
    let preset: string | undefined;
    let hasKeyframes = false;
    let hasExit = false;
    let transitionKind: TransitionKind | undefined;

    for (const token of tokens) {
      if (token.startsWith('from:') || token.startsWith('to:')) {
        const isFrom = token.startsWith('from:');
        const utility = token.slice(isFrom ? 5 : 3);

        if (applyUtility(isFrom ? from : to, utility)) {
          hasKeyframes = true;
        } else {
          invalidTokens.push(token);
        }

        continue;
      }

      if (token.startsWith('exit:')) {
        if (applyUtility(exitStyle, token.slice(5))) {
          hasExit = true;
        } else {
          invalidTokens.push(token);
        }

        continue;
      }

      const layoutType = LAYOUT_TOKENS.get(token);

      if (layoutType) {
        layout = mergeLayoutTransition(layout, layoutType);
        continue;
      }

      const kind = TRANSITION_TOKENS.get(token);

      if (kind) {
        transitionKind = kind;
        continue;
      }

      const timingResult = applyTimingToken(timing, token);

      if (timingResult === 'applied') {
        continue;
      }

      if (timingResult === 'invalid' || preset !== undefined) {
        invalidTokens.push(token);
        continue;
      }

      preset = token;

      if (!getPreset(token)) {
        invalidTokens.push(token);
      }
    }

    if (preset !== undefined || hasKeyframes) {
      groups.push({
        ...(preset === undefined ? null : { preset }),
        ...(hasKeyframes ? { from, to } : null),
        timing,
      });
    }

    if (hasExit) {
      exit = { style: exitStyle, timing };
    }

    if (transitionKind) {
      transition = { kind: transitionKind, timing };
    }
  }

  return {
    groups,
    ...(exit ? { exit } : null),
    ...(transition ? { transition } : null),
    ...(layout ? { layout } : null),
    invalidTokens,
  };
}

type TimingResult = 'applied' | 'invalid' | 'none';

const NUMERIC_TIMING_PREFIXES = [
  ['duration-', 'duration'],
  ['delay-', 'delay'],
  ['damping-', 'damping'],
  ['stiffness-', 'stiffness'],
  ['mass-', 'mass'],
] as const;

function applyTimingToken(timing: MotionTiming, token: string): TimingResult {
  if (EASING_SET.has(token) || token === SPRING_TOKEN) {
    timing.easing = token;
    return 'applied';
  }

  for (const [prefix, key] of NUMERIC_TIMING_PREFIXES) {
    if (token.startsWith(prefix)) {
      const value = parseUnsignedNumber(token.slice(prefix.length));

      if (value === undefined) {
        return 'invalid';
      }

      timing[key] = value;
      return 'applied';
    }
  }

  if (token.startsWith('repeat-') || token.startsWith('play-')) {
    const isRepeat = token.startsWith('repeat-');
    const count = parseCount(token.slice(isRepeat ? 7 : 5));

    if (count === undefined) {
      return 'invalid';
    }

    if (isRepeat) {
      timing.repeat = count;
    } else {
      timing.playCount = count;
    }

    return 'applied';
  }

  return 'none';
}

function parseCount(input: string): number | 'infinite' | undefined {
  if (input === 'infinite') {
    return 'infinite';
  }

  const value = parseUnsignedNumber(input);

  return value !== undefined && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

function parseAnimateObject(object: AnimateObject): MotionSpec {
  if (typeof object !== 'object' || object === null) {
    return EMPTY_SPEC;
  }

  const timing = pickTiming(object as unknown as Record<string, unknown>);

  if ('type' in object && typeof object.type === 'string') {
    return { groups: [{ preset: object.type, timing }], invalidTokens: [] };
  }

  if ('from' in object && 'to' in object && object.from && object.to) {
    return {
      groups: [{ from: object.from, to: object.to, timing }],
      invalidTokens: [],
    };
  }

  return EMPTY_SPEC;
}

const TIMING_KEYS = [
  'duration',
  'delay',
  'easing',
  'repeat',
  'playCount',
  'damping',
  'stiffness',
  'mass',
] as const;

function pickTiming(source: Record<string, unknown>): MotionTiming {
  const timing: Record<string, unknown> = {};

  for (const key of TIMING_KEYS) {
    if (source[key] !== undefined) {
      timing[key] = source[key];
    }
  }

  return timing as MotionTiming;
}

function mergeSpecs(specs: readonly MotionSpec[]): MotionSpec {
  const groups: MotionGroup[] = [];
  const invalidTokens: string[] = [];
  let exit: MotionExit | undefined;
  let transition: MotionTransition | undefined;
  let layout: LayoutTransitionType | undefined;

  for (const spec of specs) {
    groups.push(...spec.groups);
    invalidTokens.push(...spec.invalidTokens);
    exit = spec.exit ?? exit;
    transition = spec.transition ?? transition;
    layout = mergeLayoutTransition(layout, spec.layout);
  }

  return {
    groups,
    ...(exit ? { exit } : null),
    ...(transition ? { transition } : null),
    ...(layout ? { layout } : null),
    invalidTokens,
  };
}

function describeInvalidTokens(input: string, spec: MotionSpec): string {
  const details = spec.invalidTokens.map(token => {
    const suggestion = suggestToken(token);

    return suggestion
      ? `"${token}" (did you mean "${suggestion}"?)`
      : `"${token}"`;
  });

  return `Ignored unknown animate token(s) ${details.join(', ')} in "${input}". Combine multiple presets with commas, e.g. "fade-in, slide-up".`;
}

function suggestToken(token: string): string | undefined {
  const candidates = getSuggestionCandidates(token);
  let best: string | undefined;
  let bestDistance = 3;

  for (const candidate of candidates) {
    const distance = levenshtein(token, candidate);

    if (distance > 0 && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function getSuggestionCandidates(token: string): string[] {
  const prefixMatch = /^(from:|to:|exit:)(-?)(.*)$/.exec(token);

  if (prefixMatch) {
    const [, prefix, sign, rest] = prefixMatch;
    const valueMatch = /(\d+(\.\d+)?)$/.exec(rest ?? '');
    const value = valueMatch ? valueMatch[1] : '0';

    return UTILITIES.map(
      utility => `${prefix}${sign}${utility.prefix}${value}`,
    );
  }

  return [
    ...Object.keys(animationPresets),
    ...LAYOUT_TOKENS.keys(),
    ...TRANSITION_TOKENS.keys(),
    ...EASING_TOKENS,
    SPRING_TOKEN,
  ];
}

function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0]!;
    previous[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j]!;
      previous[j] = Math.min(
        above + 1,
        previous[j - 1]! + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }

  return previous[b.length]!;
}
