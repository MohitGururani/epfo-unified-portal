interface CacheRecord {
  value: any;
  expiresAt: number | null; // timestamp or null for persistent in cache
  createdAt: number;
}

class RedisCache {
  private store: Map<string, CacheRecord> = new Map();
  public stats = {
    hits: 42,
    misses: 8,
    writes: 24,
    deletes: 6,
    lastAccessedKey: '',
  };

  set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, {
      value: JSON.parse(JSON.stringify(value)),
      expiresAt,
      createdAt: Date.now(),
    });
    this.stats.writes++;
    this.stats.lastAccessedKey = key;
  }

  get<T = any>(key: string): T | null {
    this.stats.lastAccessedKey = key;
    const record = this.store.get(key);
    if (!record) {
      this.stats.misses++;
      return null;
    }

    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return JSON.parse(JSON.stringify(record.value));
  }

  del(key: string): boolean {
    this.stats.deletes++;
    return this.store.delete(key);
  }

  delPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    return count;
  }

  has(key: string): boolean {
    const record = this.store.get(key);
    if (!record) return false;
    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  keys(): { key: string; ttl: number | null; sizeBytes: number; type: string }[] {
    const now = Date.now();
    const result: { key: string; ttl: number | null; sizeBytes: number; type: string }[] = [];

    for (const [key, record] of this.store.entries()) {
      if (record.expiresAt && now > record.expiresAt) {
        this.store.delete(key);
        continue;
      }
      const ttl = record.expiresAt ? Math.max(0, Math.round((record.expiresAt - now) / 1000)) : null;
      const valStr = JSON.stringify(record.value);
      result.push({
        key,
        ttl,
        sizeBytes: valStr ? valStr.length : 0,
        type: typeof record.value === 'object' ? 'hash/json' : 'string',
      });
    }

    return result;
  }

  flush(): void {
    this.store.clear();
    this.stats.deletes++;
  }
}

export const redis = new RedisCache();

// Seed initial Redis cache entries
redis.set('pf:summary:100982349012', {
  uan: '100982349012',
  totalBalance: 743400,
  employeeShare: 424180,
  employerShare: 136820,
  pensionFund: 182400,
  cachedAt: new Date().toISOString()
}, 300);

redis.set('config:epfo:interest_rate', { rate: 8.25, fy: '2025-2026' });
redis.set('ratelimit:ip:103.21.144.92', { requests: 12, resetInSeconds: 48 }, 60);
