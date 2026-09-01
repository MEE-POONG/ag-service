type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  accountRateLimits?: Map<string, RateLimitEntry>
}

const store = globalForRateLimit.accountRateLimits ?? new Map<string, RateLimitEntry>()
globalForRateLimit.accountRateLimits = store

export function checkRequestRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
