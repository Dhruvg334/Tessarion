/**
 * Tessarion — Local Rate Limiting
 * A basic in-memory rate limiter for local development and single-instance deployments.
 * For true distributed rate limiting (e.g., across Vercel edges), swap this with Upstash/Redis.
 */

import { AppError } from '../errors/app-error';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitInfo>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  TEACH_BACK: { maxRequests: 10, windowMs: 60_000 }, // 10 per minute
  TUTORING: { maxRequests: 20, windowMs: 60_000 },   // 20 per minute
  RETRIEVAL: { maxRequests: 30, windowMs: 60_000 },  // 30 per minute
};

/**
 * Checks if the action should be rate limited.
 * Throws AppError(429) if exceeded.
 */
export function enforceRateLimit(userId: string, action: string, config: RateLimitConfig) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return;
  }

  if (record.count >= config.maxRequests) {
    throw new AppError('Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
  }

  record.count += 1;
}

/**
 * For testing purposes only.
 */
export function resetRateLimits() {
  store.clear();
}
