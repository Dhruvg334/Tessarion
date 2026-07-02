import { describe, it, expect } from 'vitest';
import { chunkText } from './chunking';

describe('chunkText context aware', () => {
  it('detects headings', () => {
    const res = chunkText('## My Section\n\nSome text');
    expect(res[0].sectionHint).toBe('My Section');
  });
});
