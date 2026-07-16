export function createTtlCache<T>(now = Date.now) {
  const entries = new Map<string, { expiresAt: number; value: T }>();

  return {
    get(key: string): T | null {
      const current = entries.get(key);

      if (!current || current.expiresAt <= now()) {
        entries.delete(key);
        return null;
      }

      return current.value;
    },
    set(key: string, value: T, ttlMs: number) {
      entries.set(key, { expiresAt: now() + ttlMs, value });
    },
  };
}
