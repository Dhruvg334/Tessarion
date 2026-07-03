import { ExtractedConcept, ExtractedRelationship } from '../types';
import { SourceChunk } from '@/types/database';

export interface RelationshipExtractionOptions {
  provider?: 'local' | 'gemini';
  minConfidence?: number;
}

export async function classifyRelationships(
  concepts: ExtractedConcept[],
  chunks: SourceChunk[],
  options?: RelationshipExtractionOptions
): Promise<ExtractedRelationship[]> {
  const provider = options?.provider || 'local';
  
  if (provider === 'local') {
    return classifyRelationshipsLocal(concepts, chunks);
  }

  // TODO: Implement Gemini-backed extraction
  // Fallback to local
  return classifyRelationshipsLocal(concepts, chunks);
}

function classifyRelationshipsLocal(
  concepts: ExtractedConcept[],
  chunks: SourceChunk[]
): ExtractedRelationship[] {
  const relationships: ExtractedRelationship[] = [];
  const fullText = chunks.map(c => c.content.toLowerCase()).join('\n');

  // We loop through all pairs of concepts and look for evidence of a relationship.
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const c1 = concepts[i];
      const c2 = concepts[j];
      
      const n1 = c1.name.toLowerCase();
      const n2 = c2.name.toLowerCase();

      // Look for causal
      if (fullText.includes(`${n1} causes ${n2}`) || fullText.includes(`${n1} leads to ${n2}`)) {
        relationships.push({
          sourceNodeName: c1.name,
          targetNodeName: c2.name,
          relationshipType: 'causal',
          description: `${c1.name} causes ${c2.name}.`,
          sourceChunkIds: getSharedChunks(c1, c2),
          confidenceScore: 0.8,
          evidence: `${n1} causes ${n2}`,
          extractionMethod: 'local_deterministic'
        });
      }
      
      // Look for prerequisite
      if (fullText.includes(`${n1} requires ${n2}`) || fullText.includes(`${n1} depends on ${n2}`)) {
        relationships.push({
          sourceNodeName: c2.name, // n2 is the prerequisite
          targetNodeName: c1.name,
          relationshipType: 'prerequisite',
          description: `${c2.name} is a prerequisite for ${c1.name}.`,
          sourceChunkIds: getSharedChunks(c1, c2),
          confidenceScore: 0.8,
          evidence: `${n1} requires ${n2}`,
          extractionMethod: 'local_deterministic'
        });
      }

      // Look for contrast
      if (fullText.includes(`${n1} however ${n2}`) || fullText.includes(`${n1} unlike ${n2}`)) {
        relationships.push({
          sourceNodeName: c1.name,
          targetNodeName: c2.name,
          relationshipType: 'contrasts',
          description: `${c1.name} contrasts with ${c2.name}.`,
          sourceChunkIds: getSharedChunks(c1, c2),
          confidenceScore: 0.8,
          evidence: `${n1} unlike ${n2}`,
          extractionMethod: 'local_deterministic'
        });
      }
      
      // Removed blind 'related' extraction based only on sharedChunks,
      // as it creates O(N^2) false positive relationships in a chunk and destroys Relationship Precision.
    }
  }

  return relationships;
}

function getSharedChunks(c1: ExtractedConcept, c2: ExtractedConcept): string[] {
  return c1.sourceChunkIds.filter(id => c2.sourceChunkIds.includes(id));
}
