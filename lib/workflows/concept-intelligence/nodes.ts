import { extractConceptsLocal } from '@/lib/ai/tasks/local-concept-extraction';
import { classifyRelationships } from '@/lib/ai/tasks/relationship-classification';
import type { ConceptWorkflowState } from './types';

export function validateSource(state: ConceptWorkflowState): Partial<ConceptWorkflowState> {
  const usable = state.chunks.filter((chunk) => chunk.content.trim().length >= 20);
  if (usable.length === 0) return { status: 'insufficient_evidence', activeNode: 'insufficient_evidence', errorCode: 'NO_USABLE_SOURCE' };
  return { chunks: usable, activeNode: 'extract_concepts' };
}

export async function extractConceptsNode(state: ConceptWorkflowState): Promise<Partial<ConceptWorkflowState>> {
  const concepts = await extractConceptsLocal(state.chunks);
  return concepts.length === 0
    ? { status: 'insufficient_evidence', activeNode: 'insufficient_evidence', errorCode: 'NO_GROUNDED_CONCEPTS' }
    : { concepts, activeNode: 'resolve_entities' };
}

export function resolveEntities(state: ConceptWorkflowState): Partial<ConceptWorkflowState> {
  const byName = new Map<string, (typeof state.concepts)[number]>();
  for (const concept of state.concepts) {
    const key = concept.name.trim().toLowerCase().replace(/\s+/g, ' ');
    const existing = byName.get(key);
    if (!existing || concept.confidenceScore > existing.confidenceScore) byName.set(key, concept);
  }
  return { concepts: [...byName.values()], activeNode: 'classify_relationships' };
}

export async function classifyRelationshipsNode(state: ConceptWorkflowState): Promise<Partial<ConceptWorkflowState>> {
  return { relationships: await classifyRelationships(state.concepts, state.chunks, { provider: 'local' }), activeNode: 'validate_grounding' };
}

export function validateGrounding(state: ConceptWorkflowState): Partial<ConceptWorkflowState> {
  const validConcepts = state.concepts.filter((c) => c.confidenceScore >= state.minConfidence && c.sourceChunkIds.length > 0 && c.evidenceQuotes.length > 0);
  const conceptNames = new Set(validConcepts.map((c) => c.name));
  const validRelationships = state.relationships.filter((r) => r.confidenceScore >= state.minConfidence && r.sourceChunkIds.length > 0 && r.evidence.trim() && conceptNames.has(r.sourceNodeName) && conceptNames.has(r.targetNodeName));
  return {
    concepts: validConcepts,
    relationships: validRelationships,
    rejectedConcepts: state.concepts.filter((c) => !validConcepts.includes(c)).map((c) => c.name),
    rejectedRelationships: state.relationships.filter((r) => !validRelationships.includes(r)).map((r) => `${r.sourceNodeName}->${r.targetNodeName}`),
    activeNode: 'prepare_projection',
  };
}

export function prepareProjection(state: ConceptWorkflowState): Partial<ConceptWorkflowState> {
  if (state.concepts.length === 0) return { status: 'insufficient_evidence', activeNode: 'insufficient_evidence', projectionReady: false, errorCode: 'GROUNDING_REJECTED_ALL_CONCEPTS' };
  return { projectionReady: true, status: 'completed', activeNode: 'completed' };
}
