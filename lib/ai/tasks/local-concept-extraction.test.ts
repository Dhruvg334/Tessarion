import { describe, it, expect } from 'vitest';
import { extractConceptsLocal } from './local-concept-extraction';

describe('extractConceptsLocal', () => {
  it('should extract concepts from definitions', async () => {
    const concepts = await extractConceptsLocal([{
      id: 'c1',
      content: 'Mitochondria is defined as the powerhouse of the cell.',
      source_document_id: 'd1',
      workspace_id: 'w1',
      chunk_index: 0,
      token_count: 10,
      section_hint: null,
      char_start: 0,
      char_end: 50,
      embedding: null,
      created_at: new Date().toISOString()
    }]);

    expect(concepts.some(c => c.name.toLowerCase() === 'mitochondria')).toBe(true);
  });

  it('should extract concepts from causal relationships', async () => {
    const concepts = await extractConceptsLocal([{
      id: 'c2',
      content: 'ATP production leads to cellular energy.',
      source_document_id: 'd1',
      workspace_id: 'w1',
      chunk_index: 0,
      token_count: 10,
      section_hint: null,
      char_start: 0,
      char_end: 50,
      embedding: null,
      created_at: new Date().toISOString()
    }]);

    expect(concepts.some(c => c.name.toLowerCase() === 'atp production')).toBe(true);
    expect(concepts.some(c => c.name.toLowerCase() === 'cellular energy')).toBe(true);
  });
});
