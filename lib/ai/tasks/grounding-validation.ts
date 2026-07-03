import { ExtractedConcept } from '../types';
import { SourceChunk } from '@/types/database';

export interface GroundingValidationResult {
  accepted: ExtractedConcept[];
  rejected: ExtractedConcept[];
  lowConfidence: ExtractedConcept[];
  warnings: string[];
}

export function validateConceptGrounding(
  concepts: ExtractedConcept[],
  chunks: SourceChunk[],
  minConfidence: number = 0.7
): GroundingValidationResult {
  const result: GroundingValidationResult = {
    accepted: [],
    rejected: [],
    lowConfidence: [],
    warnings: [],
  };

  const chunkMap = new Map(chunks.map(c => [c.id, c.content.toLowerCase()]));
  const fullText = chunks.map(c => c.content.toLowerCase()).join('\n');

  for (const concept of concepts) {
    if (!concept.sourceChunkIds || concept.sourceChunkIds.length === 0) {
      result.warnings.push(`Concept "${concept.name}" rejected: missing source chunk IDs.`);
      result.rejected.push(concept);
      continue;
    }

    let evidenceFound = false;
    let validChunks = 0;

    // Verify it actually appears in the listed chunks
    for (const chunkId of concept.sourceChunkIds) {
      const chunkText = chunkMap.get(chunkId);
      if (chunkText) {
        // Simple case-insensitive exact match of the concept name or aliases
        const namesToFind = [concept.name.toLowerCase(), ...concept.aliases.map(a => a.toLowerCase())];
        const found = namesToFind.some(name => chunkText.includes(name));
        
        // Also check if any evidence quote actually exists in the chunk
        const quoteFound = concept.evidenceQuotes?.some(q => chunkText.includes(q.toLowerCase()));
        
        if (found || quoteFound) {
          evidenceFound = true;
          validChunks++;
        }
      }
    }

    if (!evidenceFound) {
      // Last resort: does it exist anywhere in the combined text?
      const namesToFind = [concept.name.toLowerCase(), ...concept.aliases.map(a => a.toLowerCase())];
      const foundInDocument = namesToFind.some(name => fullText.includes(name));
      
      if (!foundInDocument) {
        result.warnings.push(`Concept "${concept.name}" rejected: unsupported by source text.`);
        result.rejected.push(concept);
        continue;
      } else {
        // It's in the doc, but chunk mapping was wrong. Let's penalize it.
        concept.confidenceScore -= 0.3;
        result.warnings.push(`Concept "${concept.name}" penalized: wrong chunk mapping.`);
      }
    } else {
      // Boost confidence if found in multiple chunks
      if (validChunks > 1) {
        concept.confidenceScore = Math.min(1.0, concept.confidenceScore + 0.1);
      }
    }

    // Final bucket
    if (concept.confidenceScore < minConfidence) {
      result.lowConfidence.push(concept);
    } else {
      result.accepted.push(concept);
    }
  }

  return result;
}
