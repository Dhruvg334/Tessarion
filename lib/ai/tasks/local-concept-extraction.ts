import { SourceChunk } from '@/types/database';
import { ExtractedConcept } from '../types';

/**
 * Deterministic local concept extraction.
 * Useful for CI and testing without hitting a real LLM.
 */
export async function extractConceptsLocal(chunks: SourceChunk[]): Promise<ExtractedConcept[]> {
  const conceptMap = new Map<string, ExtractedConcept>();

  for (const chunk of chunks) {
    const text = chunk.content;
    
    // Pattern 1: Definitions ("X is...", "X refers to...")
    const definitionRegex = /([A-Z][a-z0-9\s-]{2,30})\s+(?:is defined as|refers to|is a|is an|means)\s+([^.]{10,100}\.)/g;
    let match;
    while ((match = definitionRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const definition = match[2].trim();
      addOrMergeConcept(conceptMap, name, definition, chunk.id, match[0]);
    }

    // Pattern 2: Markdown Bold Text (common for key terms)
    const boldRegex = /\*\*([A-Za-z0-9\s-]{3,30})\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
      const name = match[1].trim();
      addOrMergeConcept(conceptMap, name, `A concept mentioned as ${name}.`, chunk.id, match[0]);
    }
    
    // Pattern 3: Headings
    const headingRegex = /^(?:#+)\s+([A-Za-z0-9\s-]{3,40})$/gm;
    while ((match = headingRegex.exec(text)) !== null) {
      const name = match[1].trim();
      addOrMergeConcept(conceptMap, name, `Core topic: ${name}.`, chunk.id, match[0]);
    }

    // Pattern 4: Relationship terms
    const relRegex = /([A-Za-z0-9\s-]{3,30})\s+(?:causes|leads to|results in|requires|depends on|however|unlike|whereas|but)\s+([A-Za-z0-9\s-]{3,30})(?=[.,\s]|$)/gi;
    while ((match = relRegex.exec(text)) !== null) {
      const c1 = match[1].trim();
      const c2 = match[2].trim();
      if (c1.length > 2 && c1.length < 30) {
        addOrMergeConcept(conceptMap, c1, `Concept related to ${c2}.`, chunk.id, match[0]);
      }
      if (c2.length > 2 && c2.length < 30) {
        addOrMergeConcept(conceptMap, c2, `Concept related to ${c1}.`, chunk.id, match[0]);
      }
    }
  }

  return Array.from(conceptMap.values());
}

function addOrMergeConcept(
  map: Map<string, ExtractedConcept>,
  name: string,
  definition: string,
  chunkId: string,
  evidence: string
) {
  const normalized = name.toLowerCase();
  if (map.has(normalized)) {
    const existing = map.get(normalized)!;
    if (!existing.sourceChunkIds.includes(chunkId)) {
      existing.sourceChunkIds.push(chunkId);
    }
    if (!existing.evidenceQuotes.includes(evidence)) {
      existing.evidenceQuotes.push(evidence);
    }
    // Boost confidence slightly if found multiple times
    existing.confidenceScore = Math.min(1.0, existing.confidenceScore + 0.1);
  } else {
    map.set(normalized, {
      name,
      definition,
      sourceChunkIds: [chunkId],
      confidenceScore: 0.8, // Base confidence for local
      importanceScore: 0.5,
      aliases: [],
      evidenceQuotes: [evidence],
      suggestedBloomLevel: 1,
      extractionMethod: 'local_deterministic'
    });
  }
}
