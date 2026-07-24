import { describe, it, expect, beforeEach } from 'vitest';
import { SECURITY_LIMITS } from './limits';
import { enforceRateLimit, RATE_LIMITS, resetRateLimits } from './rate-limit';
import { AppError } from '../errors/app-error';

describe('Security Limits', () => {
  it('defines reasonable max source text lengths', () => {
    expect(SECURITY_LIMITS.MAX_SOURCE_TEXT_LENGTH).toBe(50000);
  });

  it('defines reasonable teach-back lengths', () => {
    expect(SECURITY_LIMITS.MAX_TEACH_BACK_LENGTH).toBe(5000);
  });
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('allows requests within limits', () => {
    expect(() => enforceRateLimit('user1', 'teach-back', RATE_LIMITS.TEACH_BACK)).not.toThrow();
  });

  it('blocks requests exceeding limits', () => {
    const config = { maxRequests: 2, windowMs: 1000 };
    enforceRateLimit('user2', 'test-action', config);
    enforceRateLimit('user2', 'test-action', config);
    
    expect(() => enforceRateLimit('user2', 'test-action', config))
      .toThrow(AppError);
    
    try {
      enforceRateLimit('user2', 'test-action', config);
    } catch (e: unknown) {
      const err = e as AppError;
      expect(err.statusCode).toBe(429);
      expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
    }
  });
});
