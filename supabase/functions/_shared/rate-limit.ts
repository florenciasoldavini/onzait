type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export function createRateLimiter({
  maxRequests,
  now = Date.now,
  windowMs,
}: {
  maxRequests: number;
  now?: () => number;
  windowMs: number;
}) {
  const entries = new Map<string, RateLimitEntry>();

  return {
    consume(key: string) {
      const currentTime = now();
      const current = entries.get(key);

      if (!current || current.resetAt <= currentTime) {
        entries.set(key, {
          count: 1,
          resetAt: currentTime + windowMs,
        });
        return true;
      }

      if (current.count >= maxRequests) {
        return false;
      }

      current.count += 1;
      return true;
    },
  };
}
