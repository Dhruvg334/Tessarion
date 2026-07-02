import { describe, it, expect } from 'vitest';
import { AppError } from './app-error';

describe('AppError', () => {
  it('stores correctly', () => {
    const e = new AppError('test', 404, 'CODE');
    expect(e.message).toBe('test');
    expect(e.statusCode).toBe(404);
    expect(e.code).toBe('CODE');
  });
});
