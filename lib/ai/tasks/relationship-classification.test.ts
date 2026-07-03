import { describe, it, expect } from 'vitest';
import { classifyRelationships } from './relationship-classification';
import { ExtractedConcept } from '../types';
import { SourceChunk } from '@/types/database';

describe('classifyRelationships', () => {
  it('should extract causal relationships', async () => {
    const chunk: SourceChunk = {
      id: 'c1',
      content: 'Mitochondria causes ATP production.',
      source_document_id: 'd1',
      workspace_id: 'w1',
      chunk_index: 0,
      token_count: 10,
      section_hint: null,
      char_start: 0,
      char_end: 50,
      embedding: null,
      created_at: new Date().toISOString()
    };

    const concepts: ExtractedConcept[] = [
      { name: 'Mitochondria', definition: '', sourceChunkIds: ['c1'], confidenceScore: 1, importanceScore: 1, aliases: [], evidenceQuotes: [], suggestedBloomLevel: 1, extractionMethod: 'local_deterministic' },
      { name: 'ATP production', definition: '', sourceChunkIds: ['c1'], confidenceScore: 1, importanceScore: 1, aliases: [], evidenceQuotes: [], suggestedBloomLevel: 1, extractionMethod: 'local_deterministic' }
    ];

    const rels = await classifyRelationships(concepts, [chunk], { provider: 'local' });
    expect(rels.length).toBeGreaterThan(0);
    expect(rels[0].relationshipType).toBe('causal');
    expect(rels[0].sourceNodeName).toBe('Mitochondria');
    expect(rels[0].targetNodeName).toBe('ATP production');
  });
});
