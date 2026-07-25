import { ConceptWorkflowInputSchema, type ConceptWorkflowInput, type ConceptWorkflowResult, type ConceptWorkflowState, type ConceptWorkflowRoute } from './types';
import { validateSource, extractConceptsNode, resolveEntities, classifyRelationshipsNode, validateGrounding, prepareProjection } from './nodes';

const terminals = new Set<ConceptWorkflowRoute>(['completed','insufficient_evidence','failed']);
export async function runConceptIntelligence(input: ConceptWorkflowInput): Promise<ConceptWorkflowResult> {
  const parsed = ConceptWorkflowInputSchema.parse(input);
  let state: ConceptWorkflowState = { ...parsed, activeNode: 'validate_source', status: 'running', concepts: [], relationships: [], rejectedConcepts: [], rejectedRelationships: [], projectionReady: false, errorCode: null, stepTrace: [] };
  for (let i = 0; i < 10 && !terminals.has(state.activeNode); i++) {
    const node = state.activeNode;
    try {
      const update = node === 'validate_source' ? validateSource(state)
        : node === 'extract_concepts' ? await extractConceptsNode(state)
        : node === 'resolve_entities' ? resolveEntities(state)
        : node === 'classify_relationships' ? await classifyRelationshipsNode(state)
        : node === 'validate_grounding' ? validateGrounding(state)
        : node === 'prepare_projection' ? prepareProjection(state) : {};
      state = { ...state, ...update, stepTrace: [...state.stepTrace, { node, outcome: terminals.has((update.activeNode ?? state.activeNode) as ConceptWorkflowRoute) && update.status !== 'completed' ? 'branch' : 'success', safeMessage: `Completed ${node}.` }] };
    } catch {
      state = { ...state, status: 'failed', activeNode: 'failed', errorCode: 'CONCEPT_WORKFLOW_NODE_FAILED', stepTrace: [...state.stepTrace, { node, outcome: 'failure', safeMessage: 'The concept workflow stopped safely.' }] };
    }
  }
  const { chunks: _chunks, minConfidence: _minConfidence, activeNode: _activeNode, ...result } = state;
  return result;
}
