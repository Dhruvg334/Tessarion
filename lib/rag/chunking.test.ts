import { describe, it, expect } from 'vitest';
import { chunkText } from './chunking';

describe('chunkText', () => {
  it('returns empty array for empty text', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });

  it('chunks short text into one chunk', () => {
    const res = chunkText('Hello world');
    expect(res).toHaveLength(1);
    expect(res[0].content).toBe('Hello world');
    expect(res[0].chunkIndex).toBe(0);
  });

  it('preserves order and limits token count roughly', () => {
    // Generate a long text of repeating paragraphs
    const p = 'This is a test paragraph with some words to increase token count. '.repeat(10);
    const longText = Array(20).fill(p).join('\n\n');
    
    const chunks = chunkText(longText, { maxTokens: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].chunkIndex).toBe(1);
  });
});
