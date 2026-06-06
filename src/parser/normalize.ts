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
  playCount?: number | 'infinite';
  [key: string]: unknown;
}

export interface CustomFromToAnimConfig {
  type?: never;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | 'infinite';
  playCount?: number | 'infinite';
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

/**
 * Converts any public `animate` prop value into normalized animation configs.
 *
 * Strings are tokenized with a capped cache, arrays are flattened, and objects
 * are preserved as preset or custom from/to configs. Invalid or oversized
 * strings return an empty config list instead of throwing in render.
 */
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

/**
 * Clears the internal string parse cache.
 *
 * This is mainly useful for tests or long-running development sessions that
 * intentionally exercise many generated animation strings.
 */
export function clearNormalizeAnimateCache(): void {
  stringParseCache.clear();
}

/**
 * Returns the number of cached string parse entries.
 *
 * The cache is capped internally, so this value is a small diagnostic signal
 * rather than an application state source.
 */
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

    if (
      !('type' in config) ||
      (typeof config.type === 'string' && config.type.length > 0)
    ) {
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

function parseAnimationPart(part: string): StandardAnimConfig {
  const config: PresetAnimConfig = {
    type: '',
  };
  const from: AnimateStyle = {};
  const to: AnimateStyle = {};
  let hasFrameToken = false;
  let tokenIndex = 0;

  forEachToken(part, (token) => {
    if (token.startsWith('from:')) {
      hasFrameToken =
        applyUtilityToken(from, token.slice('from:'.length)) || hasFrameToken;
      return;
    }

    if (token.startsWith('to:')) {
      hasFrameToken =
        applyUtilityToken(to, token.slice('to:'.length)) || hasFrameToken;
      return;
    }

    if (token.startsWith('exit:')) {
      applyUtilityToken(to, token.slice('exit:'.length));
      return;
    }

    if (isControlToken(token)) {
      applyToken(config, token);
      return;
    }

    if (tokenIndex === 0 && config.type.length === 0) {
      config.type = token;
    } else {
      applyToken(config, token);
    }

    tokenIndex += 1;
  });

  if (hasFrameToken) {
    return {
      duration: config.duration,
      delay: config.delay,
      easing: config.easing,
      repeat: config.repeat,
      playCount: config.playCount,
      from,
      to,
    };
  }

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

  if (token.startsWith('play-')) {
    const playCount = parsePlayCountSuffix(token);

    if (playCount !== undefined) {
      config.playCount = playCount;
    }

    return;
  }

  if (easingTokens.has(token)) {
    config.easing = token;
  }
}

function isControlToken(token: string): boolean {
  return (
    token.startsWith('duration-') ||
    token.startsWith('delay-') ||
    token.startsWith('repeat-') ||
    token.startsWith('play-') ||
    easingTokens.has(token)
  );
}

function applyUtilityToken(style: AnimateStyle, token: string): boolean {
  if (token.length === 0) {
    return false;
  }

  if (token.startsWith('opacity-')) {
    const value = parseNumericSuffix(token, 'opacity-');

    if (value !== undefined) {
      style.opacity = value / 100;
      return true;
    }
  }

  if (token.startsWith('translate-x-')) {
    const value = parseNumericSuffix(token, 'translate-x-');

    if (value !== undefined) {
      style.translateX = value;
      return true;
    }
  }

  if (token.startsWith('-translate-x-')) {
    const value = parseNumericSuffix(token, '-translate-x-');

    if (value !== undefined) {
      style.translateX = -value;
      return true;
    }
  }

  if (token.startsWith('translate-y-')) {
    const value = parseNumericSuffix(token, 'translate-y-');

    if (value !== undefined) {
      style.translateY = value;
      return true;
    }
  }

  if (token.startsWith('-translate-y-')) {
    const value = parseNumericSuffix(token, '-translate-y-');

    if (value !== undefined) {
      style.translateY = -value;
      return true;
    }
  }

  if (token.startsWith('scale-x-')) {
    const value = parseNumericSuffix(token, 'scale-x-');

    if (value !== undefined) {
      style.scaleX = value / 100;
      return true;
    }
  }

  if (token.startsWith('scale-y-')) {
    const value = parseNumericSuffix(token, 'scale-y-');

    if (value !== undefined) {
      style.scaleY = value / 100;
      return true;
    }
  }

  if (token.startsWith('scale-')) {
    const value = parseNumericSuffix(token, 'scale-');

    if (value !== undefined) {
      style.scale = value / 100;
      return true;
    }
  }

  if (token.startsWith('rotate-')) {
    const value = parseNumericSuffix(token, 'rotate-');

    if (value !== undefined) {
      style.rotate = `${value}deg`;
      return true;
    }
  }

  if (token.startsWith('-rotate-')) {
    const value = parseNumericSuffix(token, '-rotate-');

    if (value !== undefined) {
      style.rotate = `${-value}deg`;
      return true;
    }
  }

  if (token.startsWith('w-')) {
    const value = parseNumericSuffix(token, 'w-');

    if (value !== undefined) {
      style.width = value;
      return true;
    }
  }

  if (token.startsWith('h-')) {
    const value = parseNumericSuffix(token, 'h-');

    if (value !== undefined) {
      style.height = value;
      return true;
    }
  }

  return false;
}

function normalizeAnimateObject(object: AnimateObject): StandardAnimConfig {
  if (isCustomFromToObject(object)) {
    return {
      duration: object.duration,
      delay: object.delay,
      easing: object.easing,
      repeat: object.repeat,
      playCount: object.playCount,
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

function parsePlayCountSuffix(token: string): number | 'infinite' | undefined {
  const value = token.slice('play-'.length);

  if (value === 'infinite') {
    return 'infinite';
  }

  const playCount = Number(value);

  return Number.isInteger(playCount) && playCount > 0 ? playCount : undefined;
}

function cloneConfigs(
  configs: readonly StandardAnimConfig[],
): StandardAnimConfig[] {
  return configs.map((config) => ({ ...config }));
}
