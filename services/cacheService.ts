
type CacheKey = string;
type CacheValue = any;

class CacheService {
  private cache: Map<CacheKey, CacheValue>;
  private maxEntries: number;

  constructor(maxEntries: number = 50) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  private generateKey(prefix: string, params: any): CacheKey {
    // Sort keys to ensure consistent stringification regardless of prop order
    const sortedParams = Object.keys(params).sort().reduce((obj: any, key) => {
        obj[key] = params[key];
        return obj;
    }, {});
    return `${prefix}::${JSON.stringify(sortedParams)}`;
  }

  get<T>(prefix: string, params: any): T | null {
    const key = this.generateKey(prefix, params);
    if (this.cache.has(key)) {
      console.log(`[Cache] Hit for ${prefix}`);
      return this.cache.get(key) as T;
    }
    return null;
  }

  set(prefix: string, params: any, value: any): void {
    const key = this.generateKey(prefix, params);
    
    // LRU-like behavior: delete if exists to re-insert at end (most recently used)
    if (this.cache.has(key)) {
        this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
        // Remove first item (oldest)
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
    }

    // Mark data as from cache for future retrievals
    const valueWithFlag = { ...value, isFromCache: true };
    this.cache.set(key, valueWithFlag);
    console.log(`[Cache] Stored for ${prefix}`);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const appCache = new CacheService();
