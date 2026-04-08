const globalRateState = globalThis.__northingRateLimitState || new Map();
if (!globalThis.__northingRateLimitState) {
  globalThis.__northingRateLimitState = globalRateState;
}

export function checkRateLimit(key, windowMs = 60_000, max = 20) {
  const now = Date.now();
  const row = globalRateState.get(key);

  if (!row || row.resetAt <= now) {
    globalRateState.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (row.count >= max) {
    return { ok: false, remaining: 0, resetAt: row.resetAt };
  }

  row.count += 1;
  globalRateState.set(key, row);
  return { ok: true, remaining: max - row.count, resetAt: row.resetAt };
}
