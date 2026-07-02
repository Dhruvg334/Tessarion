/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';
import { reciprocalRankFusion } from './retrieval';
import { RetrievedChunk } from './types';

describe('retrieval rrf', () => {
  it('fuses properly', () => {
    const d: RetrievedChunk[] = [{ id: '1', confidence: 0 } as any];
    const s: RetrievedChunk[] = [{ id: '1', confidence: 0 } as any];
    const res = reciprocalRankFusion(d, s);
    expect(res[0].rrfScore).toBeGreaterThan(0);
  });
});
