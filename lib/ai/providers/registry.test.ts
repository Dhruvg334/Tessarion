import { describe, it, expect } from 'vitest';
import { getEmbeddingProvider } from './registry';

describe('Provider Registry', () => {
  it('returns local provider without keys', () => {
    const p = getEmbeddingProvider('local');
    expect(p.id).toBe('local');
    expect(p.isConfigured()).toBe(true);
  });
  
  it('throws for unknown provider', () => {
    expect(() => getEmbeddingProvider('unknown')).toThrow();
  });
});
