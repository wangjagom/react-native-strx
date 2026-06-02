import type { AnimateObject, AnimateProp, AnimateStyle } from '../types/animate';

export type StandardAnimConfig =
  | PresetAnimConfig
  | CustomFromToAnimConfig;


export interface PresetAnimConfig {
  type: string;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  [key: string]: unknown;
}

export interface CustomFromToAnimConfig {
  type?: never;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  from: AnimateStyle;
  to: AnimateStyle;
}

const stringParseCache = new Map<string, readonly StandardAnimConfig[]>();

const easingTokens = new Set([
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
]);

export function normalizeAnimate(
  animate: AnimateProp | null | undefined,
): StandardAnimConfig[] {
  if (animate == null) {
    return [];
  }

  if (typeof animate === 'string') {
    return cloneConfigs(parseAnimateString(animate));
  }

  if (Array.isArray(animate)) {
    return animate.flatMap((entry) => normalizeAnimate(entry));
  }

  return [normalizeAnimateObject(animate as AnimateObject)];
}

export function clearNormalizeAnimateCache(): void {
  stringParseCache.clear();
}

export function getNormalizeAnimateCacheSize(): number {
  return stringParseCache.size;
}

function parseAnimateString(input: string): readonly StandardAnimConfig[] {
  const cached = stringParseCache.get(input);

  if (cached) {
    return cached;
  }

  const configs = input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseAnimationPart);

  stringParseCache.set(input, configs);

  return configs;
}

function parseAnimationPart(part: string): PresetAnimConfig {
  const tokens = part.split(/\s+/).filter(Boolean);
  const config: PresetAnimConfig = {
    type: tokens[0] ?? '',
  };

  for (const token of tokens.slice(1)) {
    applyToken(config, token);
  }

  return config;
}

function applyToken(config: StandardAnimConfig, token: string): void {
  if (token.startsWith('duration-')) {
    const duration = parseNumericSuffix(token, 'duration-');

    if (duration !== undefined) {
      config.duration = duration;
    }

    return;
  }

  if (token.startsWith('delay-')) {
    const delay = parseNumericSuffix(token, 'delay-');

    if (delay !== undefined) {
      config.delay = delay;
    }

    return;
  }

  if (token.startsWith('repeat-')) {
    const repeat = parseRepeatSuffix(token);

    if (repeat !== undefined) {
      config.repeat = repeat;
    }

    return;
  }

  if (easingTokens.has(token)) {
    config.easing = token;
  }
}

function normalizeAnimateObject(object: AnimateObject): StandardAnimConfig {
  if (isCustomFromToObject(object)) {
    return {
      duration: object.duration,
      delay: object.delay,
      easing: object.easing,
      repeat: object.repeat,
      from: object.from,
      to: object.to,
    };
  }

  return {
    ...object,
    type: object.type,
  };
}

function isCustomFromToObject(
  object: AnimateObject,
): object is Extract<AnimateObject, { from: AnimateStyle; to: AnimateStyle }> {
  return (
    typeof object === 'object' &&
    object !== null &&
    !('type' in object) &&
    'from' in object &&
    'to' in object
  );
}

function parseNumericSuffix(token: string, prefix: string): number | undefined {
  const value = Number(token.slice(prefix.length));

  return Number.isFinite(value) ? value : undefined;
}

function parseRepeatSuffix(token: string): number | 'infinite' | undefined {
  const value = token.slice('repeat-'.length);

  if (value === 'infinite') {
    return 'infinite';
  }

  const repeat = Number(value);

  return Number.isFinite(repeat) ? repeat : undefined;
}

function cloneConfigs(
  configs: readonly StandardAnimConfig[],
): StandardAnimConfig[] {
  return configs.map((config) => ({ ...config }));
}
