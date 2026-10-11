/**
 * Minimal size-capped LRU cache used for parse and plan memoization.
 *
 * Reads refresh recency; writes evict the least recently used entry once the
 * cache is full. `undefined` and `null` values are cacheable.
 */
export class LruCache<Key, Value> {
  private readonly map = new Map<Key, Value>();

  constructor(private readonly limit: number) {}

  get size(): number {
    return this.map.size;
  }

  has(key: Key): boolean {
    return this.map.has(key);
  }

  get(key: Key): Value | undefined {
    if (!this.map.has(key)) {
      return undefined;
    }

    const value = this.map.get(key) as Value;
    this.map.delete(key);
    this.map.set(key, value);

    return value;
  }

  set(key: Key, value: Value): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    while (this.map.size >= this.limit) {
      const oldest = this.map.keys().next();

      if (oldest.done) {
        break;
      }

      this.map.delete(oldest.value);
    }

    this.map.set(key, value);
  }

  clear(): void {
    this.map.clear();
  }
}
