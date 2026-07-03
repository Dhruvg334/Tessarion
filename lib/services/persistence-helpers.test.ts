import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertConceptEdges } from './persistence-helpers';
import { AppError } from '@/lib/errors/app-error';
import { ExtractedRelationship } from '../ai/types';

const mockEq = vi.fn();
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
const mockInsert = vi.fn().mockReturnValue({ eq: mockEq });
const mockUpsert = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: mockInsert,
      upsert: mockUpsert,
      select: mockSelect,
      eq: mockEq,
    })
  })
}));

describe('persistence-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertConceptEdges', () => {
    it('should throw AppError if edge persistence fails', async () => {
      // Mock existing edges fetch success
      mockEq.mockResolvedValueOnce({ data: [], error: null });
      // Mock insert failure
      mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } });

      const nodeIds = new Map([['source', 'id1'], ['target', 'id2']]);
      const rels: unknown[] = [{ sourceNodeName: 'source', targetNodeName: 'target', relationshipType: 'causal', confidenceScore: 1, sourceChunkIds: ['c1'] }];

      await expect(upsertConceptEdges('ws1', 'user1', rels as unknown as ExtractedRelationship[], nodeIds)).rejects.toThrow(AppError);

      mockEq.mockResolvedValueOnce({ data: [], error: null });
      mockInsert.mockResolvedValueOnce({ error: { message: 'Insert failed' } });
      await expect(upsertConceptEdges('ws1', 'user1', rels as unknown as ExtractedRelationship[], nodeIds)).rejects.toThrow('DB_ERROR');
    });

    it('should prevent duplicate edge insertion and merge chunks', async () => {
      // Mock existing edge
      mockEq.mockResolvedValueOnce({ 
        data: [{
          id: 'edge1',
          source_node_id: 'id1',
          target_node_id: 'id2',
          relationship_type: 'causal',
          source_chunk_ids: ['c1'],
          confidence_score: 0.5
        }], 
        error: null 
      });
      // Mock update success
      mockUpsert.mockResolvedValueOnce({ error: null });

      const nodeIds = new Map([['source', 'id1'], ['target', 'id2']]);
      // New extraction has chunk c2 and higher confidence
      const rels: unknown[] = [{ sourceNodeName: 'source', targetNodeName: 'target', relationshipType: 'causal', confidenceScore: 0.9, sourceChunkIds: ['c2'] }];

      await upsertConceptEdges('ws1', 'user1', rels as unknown as ExtractedRelationship[], nodeIds);

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      const upsertArgs = mockUpsert.mock.calls[0][0];
      expect(upsertArgs[0].id).toBe('edge1');
      expect(upsertArgs[0].confidence_score).toBe(0.9);
      expect(upsertArgs[0].source_chunk_ids).toContain('c1');
      expect(upsertArgs[0].source_chunk_ids).toContain('c2');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
