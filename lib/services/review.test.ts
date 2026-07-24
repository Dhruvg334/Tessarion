import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleReviewsFromMastery } from './review';
import { ConceptMastery } from '../mastery/types';

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockSelectTerminal = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn().mockImplementation(() => mockSelectTerminal());

const mockBuilder = { 
  eq: mockEq, 
  in: mockIn, 
  single: mockSingle, 
  maybeSingle: mockSingle, 
  select: mockSelect,
  order: mockOrder,
  limit: mockLimit,
  then: function(resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
    return mockSelectTerminal().then(resolve, reject);
  }
};

mockEq.mockReturnValue(mockBuilder);
mockIn.mockReturnValue(mockBuilder);
mockOrder.mockReturnValue(mockBuilder);
mockSelect.mockReturnValue(mockBuilder);
const mockInsert = vi.fn();
const mockUpdate = vi.fn().mockReturnValue(mockBuilder);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => {
      return {
        from: () => { throw new Error('Invalid chained .from().from() call'); },
        insert: mockInsert,
        update: mockUpdate,
        select: mockSelect,
        eq: mockEq,
        in: mockIn,
      };
    }
  })
}));

import { markReviewCompleted, skipReview, scheduleReviewsFromWorkspaceMastery } from './review';

describe('review service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSingle.mockReset();
    mockSelectTerminal.mockReset();
    mockInsert.mockReset();
    
    mockEq.mockReturnValue(mockBuilder);
    mockIn.mockReturnValue(mockBuilder);
    mockOrder.mockReturnValue(mockBuilder);
    mockSelect.mockReturnValue(mockBuilder);
    mockUpdate.mockReturnValue(mockBuilder);
    mockSingle.mockReturnValue(mockBuilder);
    mockLimit.mockImplementation(() => mockBuilder);
    
    mockInsert.mockResolvedValue({ error: null });
    mockSelectTerminal.mockResolvedValue({ data: [{ id: '1' }], error: null });
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
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws

      const mismatchedMastery = { ...mockMastery, workspaceId: 'ws2' };
      
      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mismatchedMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });
    
    it('should throw INVALID_SCOPE if concept is not in workspace', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Concept not found' } }); // cNode

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });

    it('should throw INVALID_SCOPE if mastery record does not match scope', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null }); // cNode
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Mastery record not found' } }); // mRecord

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });

    it('should throw INVALID_SCOPE if signal IDs are invalid', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null }); // cNode
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSingle.mockResolvedValueOnce({ data: [{ id: 'sig1' }], error: null }); // signals (only 1 instead of 2)

      try {
        await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', ['sig1', 'sig2']);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(400);
      }
    });
    
    it('should throw DB_ERROR on update failure for suspension (scoped update)', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null }); // cNode
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSingle.mockResolvedValueOnce({ data: { id: 'active1', status: 'queued' }, error: null }); // existing active
      
      mockSelectTerminal.mockResolvedValueOnce({ data: [], error: null }); // zero rows updated for suspension

      const unassessedMastery = { ...mockMastery, state: 'unassessed' as const };
      
      try {
        await scheduleReviewsFromMastery('ws1', 'user1', unassessedMastery, 'mr1', []);
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(404);
      }
    });

    it('should update existing active review instead of inserting duplicate (scoped update)', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null }); // cNode
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSelectTerminal.mockResolvedValueOnce({ count: 1, error: null }); // cap count
      mockSingle.mockResolvedValueOnce({ data: { id: 'active1', status: 'queued' }, error: null }); // existing active

      const result = await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
      expect(result.action).toBe('updated');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should skip scheduling reinforcement if understood cap is reached', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      mockSingle.mockResolvedValueOnce({ data: { id: 'c1' }, error: null }); // cNode
      mockSingle.mockResolvedValueOnce({ data: { id: 'mr1' }, error: null }); // mRecord
      mockSelectTerminal.mockResolvedValueOnce({ count: 3, error: null }); // cap count
      mockSingle.mockResolvedValueOnce({ data: null, error: null }); // no existing active

      const result = await scheduleReviewsFromMastery('ws1', 'user1', mockMastery, 'mr1', []);
      expect(result.action).toBe('skippedUnderstoodCap');
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });


  describe('scheduleReviewsFromWorkspaceMastery', () => {
    it('should throw DB_ERROR if mastery signal fetch fails', async () => {
      // Setup ws and records
      mockSingle.mockResolvedValueOnce({ data: { id: 'ws1' }, error: null }); // ws
      
      // Override mockSelectTerminal for records fetch and signals fetch
      mockSelectTerminal
        .mockResolvedValueOnce({ data: [{ id: 'rec1', concept_node_id: 'c1', evidence_count: 1, attempts_count: 1 }], error: null }) // records
        .mockResolvedValueOnce({ data: null, error: { message: 'Fetch failed' } }); // signals

      try {
        await scheduleReviewsFromWorkspaceMastery('ws1', 'user1');
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(500);
      }
    });
  });

  describe('markReviewCompleted', () => {
    it('should throw NOT_FOUND if zero rows are updated', async () => {
      mockSelectTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Not Found' } });
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
      mockSelectTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Not Found' } });
      try {
        await skipReview('ws1', 'rev1', 'user1');
        expect.fail('Should have thrown');
      } catch (err: unknown) {
        expect((err as { statusCode?: number }).statusCode).toBe(404);
      }
    });
  });
});
