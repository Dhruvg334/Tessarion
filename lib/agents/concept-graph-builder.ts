import { SourceChunk } from '@/types/database';
import { ConceptExtractionResult, AgentRunSummary, ExtractedConcept, ExtractedRelationship } from '../ai/types';
import { createTrace, updateTraceState, completeTrace } from './tracing';
import { extractConcepts } from '../ai/tasks/concept-extraction';
import { validateConceptGrounding } from '../ai/tasks/grounding-validation';
import { classifyRelationships } from '../ai/tasks/relationship-classification';
import { validateRelationships } from '../graph/validation';
import { upsertConceptNodes, upsertConceptEdges } from '../services/persistence-helpers'; // We will create this

// Note on Phase 5 architectural layers:
// - evaluation layer is implemented
// - tracing layer is implemented
// - reflection summary layer is still planned.
// Do not claim reflection is implemented until Phase 6 or later.

export interface BuildGraphOptions {
  provider?: 'local' | 'gemini';
  minConfidence?: number;
}

export async function buildConceptGraphAgent(
  workspaceId: string,
  userId: string,
  chunks: SourceChunk[],
  options?: BuildGraphOptions
): Promise<ConceptExtractionResult> {
  const trace = await createTrace(workspaceId, userId, 'concept-graph-builder');
  
  const summary: AgentRunSummary = {
    proposedConcepts: 0,
    acceptedConcepts: 0,
    rejectedConcepts: 0,
    lowConfidenceConcepts: 0,
    proposedRelationships: 0,
    acceptedRelationships: 0,
    rejectedRelationships: 0,
    lowConfidenceRelationships: 0,
    groundingRate: 1.0,
    warnings: [],
  };

  let fallbackUsed = false;
  let status = 'success';
  const provider = options?.provider || 'local';

  try {
    // 1. retrieving_evidence (already done by caller passing chunks, but we log state)
    await updateTraceState(trace, 'retrieving_evidence');
    if (chunks.length === 0) {
      summary.warnings.push('No chunks provided to graph builder.');
      await completeTrace(trace, 'partial', summary, false, 'No chunks');
      return { runId: trace.runId, status: 'no_chunks', providerUsed: provider, fallbackUsed, summary, warnings: summary.warnings };
    }

    // 2. extracting_candidates
    await updateTraceState(trace, 'extracting_candidates');
    let extractedConcepts: ExtractedConcept[] = [];
    try {
      extractedConcepts = await extractConcepts(chunks, options);
    } catch {
      if (provider !== 'local') {
        fallbackUsed = true;
        summary.warnings.push(`Provider ${provider} failed, falling back to local deterministic.`);
        extractedConcepts = await extractConcepts(chunks, { ...options, provider: 'local' });
      } else {
        throw new Error('Local concept extraction failed');
      }
    }
    summary.proposedConcepts = extractedConcepts.length;

    // 3. validating_grounding
    await updateTraceState(trace, 'validating_grounding');
    const groundingResult = validateConceptGrounding(extractedConcepts, chunks, options?.minConfidence);
    summary.acceptedConcepts = groundingResult.accepted.length;
    summary.rejectedConcepts = groundingResult.rejected.length;
    summary.lowConfidenceConcepts = groundingResult.lowConfidence.length;
    summary.warnings.push(...groundingResult.warnings);
    summary.groundingRate = summary.proposedConcepts > 0 ? (summary.acceptedConcepts + summary.lowConfidenceConcepts) / summary.proposedConcepts : 1.0;

    // Concepts to move forward with
    const validConcepts = [...groundingResult.accepted, ...groundingResult.lowConfidence];

    // 4. classifying_relationships
    await updateTraceState(trace, 'classifying_relationships');
    let extractedRelationships: ExtractedRelationship[] = [];
    if (validConcepts.length > 1) {
      try {
        extractedRelationships = await classifyRelationships(validConcepts, chunks, options);
      } catch {
        if (provider !== 'local' && !fallbackUsed) {
          fallbackUsed = true;
          summary.warnings.push(`Relationship provider ${provider} failed, falling back to local.`);
          extractedRelationships = await classifyRelationships(validConcepts, chunks, { ...options, provider: 'local' });
        } else {
          extractedRelationships = await classifyRelationships(validConcepts, chunks, { ...options, provider: 'local' });
        }
      }
    }
    summary.proposedRelationships = extractedRelationships.length;

    // 5. validating_graph
    await updateTraceState(trace, 'validating_graph');
    const relationResult = validateRelationships(extractedRelationships, validConcepts, options?.minConfidence);
    summary.acceptedRelationships = relationResult.accepted.length;
    summary.rejectedRelationships = relationResult.rejected.length;
    summary.lowConfidenceRelationships = relationResult.lowConfidence.length;
    summary.warnings.push(...relationResult.warnings);
    
    const validRelationships = [...relationResult.accepted, ...relationResult.lowConfidence];

    // 6. persisting
    await updateTraceState(trace, 'persisting');
    
    // In order to decouple the orchestration from the specific implementation details of persistence,
    // we use a helper layer. This also allows us to properly manage merges.
    const nodeIdsMap = await upsertConceptNodes(workspaceId, userId, validConcepts);
    await upsertConceptEdges(workspaceId, userId, validRelationships, nodeIdsMap);

    // 7. completed
    if (summary.rejectedConcepts > 0 || summary.rejectedRelationships > 0) {
      status = 'partial';
    }
    
    await updateTraceState(trace, 'completed');
    await completeTrace(trace, status as 'success' | 'partial' | 'failed', summary, fallbackUsed);

    return {
      runId: trace.runId,
      status,
      providerUsed: provider,
      fallbackUsed,
      summary,
      warnings: summary.warnings,
    };

  } catch (error) {
    await updateTraceState(trace, 'failed');
    await completeTrace(trace, 'failed', summary, fallbackUsed, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
