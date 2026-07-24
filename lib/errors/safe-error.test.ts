import { describe, it, expect } from 'vitest';
import { normalizeError, toSafeApiError } from './safe-error';
import { AppError } from './app-error';

describe('safe-error', () => {
  describe('normalizeError', () => {
    it('returns AppError directly', () => {
      const err = new AppError('Test', 400, 'TEST_CODE');
      expect(normalizeError(err)).toBe(err);
    });

    it('wraps generic Error', () => {
      const err = new Error('Database connection failed');
      const normalized = normalizeError(err);
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.statusCode).toBe(500);
      expect(normalized.code).toBe('INTERNAL_ERROR');
      // The message is hidden by default in AppError constructor unless detailed? No, we set the message to generic.
      expect(normalized.message).toBe('An unexpected error occurred');
    });

    it('wraps string or unknown', () => {
      const normalized = normalizeError('Some weird error');
      expect(normalized.message).toBe('An unexpected error occurred');
      expect(normalized.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('toSafeApiError', () => {
    it('passes through safe 4xx AppErrors', () => {
      const err = new AppError('Invalid input', 400, 'BAD_REQUEST');
      const safe = toSafeApiError(err);
      expect(safe.status).toBe(400);
      expect(safe.code).toBe('BAD_REQUEST');
      expect(safe.message).toBe('Invalid input');
    });

    it('masks 5xx AppErrors with fallback message', () => {
      const err = new AppError('Database connection failed', 500, 'DB_ERROR');
      const safe = toSafeApiError(err);
      expect(safe.status).toBe(500);
      expect(safe.code).toBe('DB_ERROR'); // Code is safe to leak
      expect(safe.message).toBe('Internal Server Error');
    });

    it('masks raw errors completely', () => {
      const safe = toSafeApiError(new Error('SyntaxError: unexpected token'));
      expect(safe.status).toBe(500);
      expect(safe.code).toBe('INTERNAL_ERROR');
      expect(safe.message).toBe('Internal Server Error');
    });
  });
});
