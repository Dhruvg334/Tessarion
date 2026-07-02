import { describe, it, expect } from 'vitest';
import { hasSupabaseClientEnv, assertSupabaseClientEnv } from './env';

describe('Env validation', () => {
  it('hasSupabaseClientEnv returns false when missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(hasSupabaseClientEnv()).toBe(false);
    expect(() => assertSupabaseClientEnv()).toThrow();
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  });
});
