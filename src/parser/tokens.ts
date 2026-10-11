import type { LayoutTransitionType } from '../context/LayoutNodeContext';
import type { AnimateStyle } from '../types/animate';

/** Style subsets animated by `transition-*` tokens. */
export type TransitionKind =
  'all' | 'colors' | 'opacity' | 'transform' | 'spacing' | 'layout';

export const EASING_TOKENS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
] as const;

export type EasingToken = (typeof EASING_TOKENS)[number];

/** Switches an animation to the spring driver. */
export const SPRING_TOKEN = 'spring';

export const LAYOUT_TOKENS: ReadonlyMap<string, LayoutTransitionType> = new Map(
  [
    ['layout-linear', 'linear'],
    ['layout-spring', 'spring'],
    ['layout-fade', 'fade'],
    ['layout-spring-stiff', 'spring-stiff'],
    ['layout-spring-bouncy', 'spring-bouncy'],
  ],
);

export const TRANSITION_TOKENS: ReadonlyMap<string, TransitionKind> = new Map([
  ['transition', 'all'],
  ['transition-all', 'all'],
  ['transition-colors', 'colors'],
  ['transition-opacity', 'opacity'],
  ['transition-transform', 'transform'],
  ['transition-spacing', 'spacing'],
  ['transition-layout', 'layout'],
]);

const LAYOUT_PRIORITY: Readonly<Record<LayoutTransitionType, number>> = {
  linear: 1,
  fade: 2,
  spring: 3,
  'spring-stiff': 4,
  'spring-bouncy': 5,
};

/** Picks the stronger of two layout transitions, e.g. spring over linear. */
export function mergeLayoutTransition(
  current: LayoutTransitionType | undefined,
  next: LayoutTransitionType | undefined,
): LayoutTransitionType | undefined {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  return LAYOUT_PRIORITY[next] > LAYOUT_PRIORITY[current] ? next : current;
}

export const KEYFRAME_PREFIXES = ['from:', 'to:', 'exit:'] as const;

export type KeyframePrefix = (typeof KEYFRAME_PREFIXES)[number];

interface UtilityDefinition {
  prefix: string;
  key: keyof AnimateStyle;
  /** Whether a leading `-` is accepted, e.g. `-translate-x-4`. */
  signed: boolean;
  toValue: (value: number) => number | string;
}

/**
 * Tailwind-like utilities accepted after `from:`, `to:`, and `exit:`.
 *
 * Longer prefixes must come before shorter ones that share a start, such as
 * `scale-x-` before `scale-`.
 */
export const UTILITIES: readonly UtilityDefinition[] = [
  {
    prefix: 'opacity-',
    key: 'opacity',
    signed: false,
    toValue: value => Math.min(value, 100) / 100,
  },
  {
    prefix: 'translate-x-',
    key: 'translateX',
    signed: true,
    toValue: value => value,
  },
  {
    prefix: 'translate-y-',
    key: 'translateY',
    signed: true,
    toValue: value => value,
  },
  {
    prefix: 'scale-x-',
    key: 'scaleX',
    signed: false,
    toValue: value => value / 100,
  },
  {
    prefix: 'scale-y-',
    key: 'scaleY',
    signed: false,
    toValue: value => value / 100,
  },
  {
    prefix: 'scale-',
    key: 'scale',
    signed: false,
    toValue: value => value / 100,
  },
  {
    prefix: 'rotate-',
    key: 'rotate',
    signed: true,
    toValue: value => `${value}deg`,
  },
  { prefix: 'w-', key: 'width', signed: false, toValue: value => value },
  { prefix: 'h-', key: 'height', signed: false, toValue: value => value },
];

/**
 * Parses an unsigned decimal such as `300` or `0.5`.
 *
 * Signs, exponents, hex, and empty strings are rejected so every token family
 * shares one number grammar.
 */
export function parseUnsignedNumber(input: string): number | undefined {
  if (input.length === 0 || input.length > 12) {
    return undefined;
  }

  let dotCount = 0;

  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);

    if (charCode === 46) {
      dotCount += 1;

      if (dotCount > 1) {
        return undefined;
      }

      continue;
    }

    if (charCode < 48 || charCode > 57) {
      return undefined;
    }
  }

  const value = Number(input);

  return Number.isFinite(value) ? value : undefined;
}

/**
 * Applies one utility (the part after `from:`/`to:`/`exit:`) to a style.
 *
 * Returns `false` when the utility is unknown or its value is invalid.
 */
export function applyUtility(style: AnimateStyle, utility: string): boolean {
  const negative = utility.charCodeAt(0) === 45;
  const body = negative ? utility.slice(1) : utility;

  for (const definition of UTILITIES) {
    if (!body.startsWith(definition.prefix)) {
      continue;
    }

    if (negative && !definition.signed) {
      return false;
    }

    const value = parseUnsignedNumber(body.slice(definition.prefix.length));

    if (value === undefined) {
      return false;
    }

    (style as Record<string, number | string>)[definition.key] =
      definition.toValue(negative ? -value : value);
    return true;
  }

  return false;
}
