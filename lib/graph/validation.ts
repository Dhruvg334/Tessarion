import { ExtractedConcept, ExtractedRelationship } from '../ai/types';

export interface RelationshipValidationResult {
  accepted: ExtractedRelationship[];
  rejected: ExtractedRelationship[];
  lowConfidence: ExtractedRelationship[];
  warnings: string[];
}

export function validateRelationships(
  relationships: ExtractedRelationship[],
  validConcepts: ExtractedConcept[],
  minConfidence: number = 0.7
): RelationshipValidationResult {
  const result: RelationshipValidationResult = {
    accepted: [],
    rejected: [],
    lowConfidence: [],
    warnings: [],
  };

  const validConceptNames = new Set(validConcepts.map(c => c.name.toLowerCase()));
  const seenEdges = new Set<string>();

  for (const rel of relationships) {
    // 1. Check self-edges
    if (rel.sourceNodeName.toLowerCase() === rel.targetNodeName.toLowerCase()) {
      result.warnings.push(`Relationship rejected: self-edge for "${rel.sourceNodeName}".`);
      result.rejected.push(rel);
      continue;
    }

    // 2. Check nodes actually exist
    if (!validConceptNames.has(rel.sourceNodeName.toLowerCase()) || 
        !validConceptNames.has(rel.targetNodeName.toLowerCase())) {
      result.warnings.push(`Relationship rejected: missing source or target node ("${rel.sourceNodeName}" -> "${rel.targetNodeName}").`);
      result.rejected.push(rel);
      continue;
    }

    // 3. Check duplicate edges
    // For directed edges (prerequisite, causal), A->B is different from B->A
    // For undirected (related, contrasts), A-B is the same as B-A
    const isDirected = rel.relationshipType === 'prerequisite' || rel.relationshipType === 'causal';
    const edgeKey = isDirected
      ? `${rel.sourceNodeName.toLowerCase()}->${rel.targetNodeName.toLowerCase()}|${rel.relationshipType}`
      : [rel.sourceNodeName.toLowerCase(), rel.targetNodeName.toLowerCase()].sort().join('--') + `|${rel.relationshipType}`;

    if (seenEdges.has(edgeKey)) {
      result.warnings.push(`Relationship rejected: duplicate edge ("${rel.sourceNodeName}" -> "${rel.targetNodeName}").`);
      result.rejected.push(rel);
      continue;
    }
    seenEdges.add(edgeKey);

    // 4. Grounding evidence
    if (!rel.sourceChunkIds || rel.sourceChunkIds.length === 0) {
      result.warnings.push(`Relationship rejected: ungrounded edge ("${rel.sourceNodeName}" -> "${rel.targetNodeName}").`);
      result.rejected.push(rel);
      continue;
    }

    if (rel.confidenceScore < minConfidence) {
      result.lowConfidence.push(rel);
    } else {
      result.accepted.push(rel);
    }
  }

  return result;
}
