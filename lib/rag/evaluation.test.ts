import { describe, it, expect } from 'vitest';
import { computeRecallAtK } from './evaluation';

describe('evaluation', () => {
  it('computes recall', () => {
    expect(computeRecallAtK(['1'], ['1', '2'], 1)).toBe(1);
  });
});
