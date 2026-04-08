import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const globalRateState = globalThis.__northingRateLimitState || new Map();
if (!globalThis.__northingRateLimitState) {
  globalThis.__northingRateLimitState = globalRateState;
}

function checkRateLimitMemory(key, windowMs = 60_000, max = 20) {
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

const upstashLimiterCache = new Map();
let redisSingleton = null;

function getRedis() {
  if (!redisSingleton && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisSingleton = Redis.fromEnv();
  }
  return redisSingleton;
}

function windowDurationLabel(windowMs) {
  const sec = Math.max(1, Math.ceil(windowMs / 1000));
  return `${sec} s`;
}

function getUpstashLimiter(windowMs, max) {
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${max}:${windowMs}`;
  if (!upstashLimiterCache.has(cacheKey)) {
    upstashLimiterCache.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, windowDurationLabel(windowMs)),
        prefix: `northing:rl:${max}:${windowMs}`,
      })
    );
  }
  return upstashLimiterCache.get(cacheKey);
}

/**
 * Rate limit by key. Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set (shared across serverless instances); otherwise in-memory (dev / fallback).
 */
export async function checkRateLimit(key, windowMs = 60_000, max = 20) {
  const limiter = getUpstashLimiter(windowMs, max);
  if (!limiter) {
    return checkRateLimitMemory(key, windowMs, max);
  }
  try {
    const result = await limiter.limit(key);
    return {
      ok: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch {
    return checkRateLimitMemory(key, windowMs, max);
  }
}
