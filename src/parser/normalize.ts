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
const STRING_PARSE_CACHE_LIMIT = 256;
const MAX_ANIMATE_STRING_LENGTH = 512;

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
  if (input.length > MAX_ANIMATE_STRING_LENGTH) {
    return [];
  }

  const cached = stringParseCache.get(input);

  if (cached) {
    return cached;
  }

  const configs: StandardAnimConfig[] = [];

  forEachAnimationPart(input, (part) => {
    const config = parseAnimationPart(part);

    if (config.type.length > 0) {
      configs.push(config);
    }
  });

  setCappedMapValue(
    stringParseCache,
    input,
    configs,
    STRING_PARSE_CACHE_LIMIT,
  );

  return configs;
}

function parseAnimationPart(part: string): PresetAnimConfig {
  const config: PresetAnimConfig = {
    type: '',
  };
  let tokenIndex = 0;

  forEachToken(part, (token) => {
    if (tokenIndex === 0) {
      config.type = token;
    } else {
      applyToken(config, token);
    }

    tokenIndex += 1;
  });

  return config;
}

function forEachAnimationPart(
  input: string,
  visitor: (part: string) => void,
): void {
  let partStart = 0;

  for (let index = 0; index <= input.length; index += 1) {
    const isBoundary = index === input.length || input.charCodeAt(index) === 44;

    if (!isBoundary) {
      continue;
    }

    visitor(input.slice(partStart, index));
    partStart = index + 1;
  }
}

function forEachToken(input: string, visitor: (token: string) => void): void {
  let tokenStart = -1;

  for (let index = 0; index <= input.length; index += 1) {
    const charCode = index < input.length ? input.charCodeAt(index) : 32;
    const isBoundary =
      charCode === 32 ||
      charCode === 9 ||
      charCode === 10 ||
      charCode === 13;

    if (!isBoundary && tokenStart === -1) {
      tokenStart = index;
    }

    if ((isBoundary || index === input.length) && tokenStart !== -1) {
      visitor(input.slice(tokenStart, index));
      tokenStart = -1;
    }
  }
}

function setCappedMapValue<Key, Value>(
  cache: Map<Key, Value>,
  key: Key,
  value: Value,
  limit: number,
): void {
  if (cache.has(key)) {
    cache.delete(key);
  }

  while (cache.size >= limit) {
    const firstKey = cache.keys().next().value as Key | undefined;

    if (firstKey === undefined) {
      break;
    }

    cache.delete(firstKey);
  }

  cache.set(key, value);
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
