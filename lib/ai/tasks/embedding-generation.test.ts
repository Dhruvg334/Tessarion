import { describe, it, expect } from 'vitest';
import { generateDocumentEmbedding } from './embedding-generation';

describe('Embedding generation', () => {
  it('rejects empty input', async () => {
    await expect(generateDocumentEmbedding('   ')).rejects.toThrow('Cannot embed empty');
  });

  it('generates deterministic local embedding in test mode', async () => {
    const vec = await generateDocumentEmbedding('hello', { provider: 'local' });
    expect(vec.length).toBe(768);
    const vec2 = await generateDocumentEmbedding('hello', { provider: 'local' });
    expect(vec).toEqual(vec2); // deterministic
  });
});
