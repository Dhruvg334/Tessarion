import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleReviewsFromMastery } from './review';
import { ConceptMastery } from '../mastery/types';

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
mockEq.mockReturnValue({ eq: mockEq, in: mockIn, single: mockSingle, maybeSingle: mockSingle });
mockIn.mockReturnValue({ eq: mockEq, in: mockIn, single: mockSingle, maybeSingle: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq, in: mockIn });
const mockInsert = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: (_table: string) => {
      return {
        insert: mockInsert,
        update: mockUpdate,
        select: mockSelect,
        eq: mockEq,
        in: mockIn,
      };
    }
  })
}));

import { markReviewCompleted, skipReview } from './review';

describe('review service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockResolvedValue({ data: [{ id: '1' }], error: null });
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

    it('should throw INVALID_SCOPE if mastery record does not match scope', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null });
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Mastery record not found' } });

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });

    it('should throw INVALID_SCOPE if signal IDs are invalid', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSingle.mockResolvedValueOnce({ data: [{ id: 'sig1' }], error: null }); // signals (only 1 instead of 2)

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', ['sig1', 'sig2']);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });
    
    it('should update existing active review instead of inserting duplicate', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSingle.mockResolvedValueOnce({ data: { id: 'active1', status: 'queued' }, error: null }); // existing active
      mockSingle.mockResolvedValueOnce({ count: 1, error: null }); // cap count

      const result = await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
      expect(result.action).toBe('updated');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should skip scheduling reinforcement if understood cap is reached', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSingle.mockResolvedValueOnce({ data: null, error: null }); // no existing active
      mockSingle.mockResolvedValueOnce({ count: 3, error: null }); // cap count >= 3

      const result = await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
      expect(result.action).toBe('skippedUnderstoodCap');
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('markReviewCompleted', () => {
    it('should throw NOT_FOUND if zero rows are updated', async () => {
      mockUpdate.mockResolvedValueOnce({ data: [], error: null });
      try {
        await markReviewCompleted('ws1', 'rev1', 'user1');
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(404);
      }
    });
  });
  
  describe('skipReview', () => {
    it('should throw NOT_FOUND if zero rows are updated', async () => {
      mockUpdate.mockResolvedValueOnce({ data: [], error: null });
      try {
        await skipReview('ws1', 'rev1', 'user1');
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(404);
      }
    });
  });
});
