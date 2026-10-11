const MAX_WARNED_KEYS = 256;
const warnedKeys = new Set<string>();

/**
 * Logs a development-only warning once per key.
 *
 * Production builds never warn. The set of remembered keys is capped so
 * dynamically generated animate strings cannot grow it without bound.
 */
export function warnOnce(key: string, message: string): void {
  if (!__DEV__ || warnedKeys.has(key)) {
    return;
  }

  if (warnedKeys.size >= MAX_WARNED_KEYS) {
    warnedKeys.clear();
  }

  warnedKeys.add(key);
  console.warn(`[react-native-strx] ${message}`);
}

/** Clears remembered warning keys. Intended for tests. */
export function resetWarnings(): void {
  warnedKeys.clear();
}
