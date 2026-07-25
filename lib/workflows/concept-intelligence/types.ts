import { z } from 'zod';
import type { ExtractedConcept, ExtractedRelationship } from '@/lib/ai/types';
import type { SourceChunk } from '@/types/database';

export const ConceptWorkflowRouteSchema = z.enum([
  'validate_source','extract_concepts','resolve_entities','classify_relationships',
  'validate_grounding','prepare_projection','completed','insufficient_evidence','failed',
]);
export type ConceptWorkflowRoute = z.infer<typeof ConceptWorkflowRouteSchema>;

export const ConceptWorkflowInputSchema = z.object({
  runId: z.string().uuid(), traceId: z.string().uuid(), workspaceId: z.string().uuid(),
  documentId: z.string().uuid(), chunks: z.array(z.custom<SourceChunk>()).min(1).max(500),
  minConfidence: z.number().min(0).max(1).default(0.55),
});
export type ConceptWorkflowInput = z.infer<typeof ConceptWorkflowInputSchema>;

export interface ConceptWorkflowStep { node: ConceptWorkflowRoute; outcome: 'success'|'branch'|'failure'; safeMessage: string; }
export interface ConceptWorkflowState extends ConceptWorkflowInput {
  activeNode: ConceptWorkflowRoute;
  status: 'running'|'completed'|'insufficient_evidence'|'failed';
  concepts: ExtractedConcept[];
  relationships: ExtractedRelationship[];
  rejectedConcepts: string[];
  rejectedRelationships: string[];
  projectionReady: boolean;
  errorCode: string | null;
  stepTrace: ConceptWorkflowStep[];
}
export type ConceptWorkflowResult = Omit<ConceptWorkflowState, 'chunks'|'minConfidence'|'activeNode'>;
