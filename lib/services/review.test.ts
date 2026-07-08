import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleReviewsFromMastery } from './review';
import { ConceptMastery } from '../mastery/types';

const mockSingle = vi.fn();
const mockEq = vi.fn();
mockEq.mockReturnValue({ eq: mockEq, single: mockSingle, maybeSingle: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
const mockInsert = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: (table: string) => {
      if (table === 'workspaces') {
        return { select: mockSelect };
      }
      if (table === 'mastery_records') {
        return { select: mockSelect };
      }
      return {
        insert: mockInsert,
        update: mockUpdate,
        select: mockSelect,
        eq: mockEq,
      };
    }
  })
}));

describe('review service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleReviewsFromMastery', () => {
    const mockMastery: ConceptMastery = {
      workspaceId: 'ws1',
      userId: 'user1',
      conceptId: 'c1',
      state: 'understood',
      score: 1,
      confidenceScore: 0.9,
      evidenceCount: 1,
      attemptsCount: 1,
      lastAssessedAt: new Date().toISOString(),
      strongestGaps: [],
      coveredSignals: [],
      recommendationLabel: '',
      explanation: ''
    };

    it('should throw UNAUTHORIZED if workspace scope validation fails', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(403);
      }
    });

    it('should throw INVALID_SCOPE if mastery object does not match scope', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null });

      const mismatchedMastery = { ...mockMastery, workspaceId: 'ws2' };
      
      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mismatchedMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });
  });
});
