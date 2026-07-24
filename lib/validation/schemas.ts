import { z } from 'zod';
import { SECURITY_LIMITS } from '../security/limits';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(SECURITY_LIMITS.MAX_TITLE_LENGTH),
  description: z.string().max(500).optional(),
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(SECURITY_LIMITS.MAX_TITLE_LENGTH).optional(),
  description: z.string().max(500).optional(),
  archived_at: z.string().datetime().nullable().optional(),
});
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export const pasteDocumentSchema = z.object({
  file_name: z.string().min(1, "File name is required").max(SECURITY_LIMITS.MAX_TITLE_LENGTH),
  content: z.string().min(1, "Content cannot be empty").max(SECURITY_LIMITS.MAX_SOURCE_TEXT_LENGTH, "Source text is too long"),
});
export type PasteDocumentInput = z.infer<typeof pasteDocumentSchema>;

export const updateConceptSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  definition: z.string().optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
});
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;

export const createConceptEdgeSchema = z.object({
  source_node_id: z.string().uuid(),
  target_node_id: z.string().uuid(),
  relationship_type: z.enum(['prerequisite', 'related', 'contrasts', 'causal']),
  description: z.string().optional(),
});
export type CreateConceptEdgeInput = z.infer<typeof createConceptEdgeSchema>;

export const startTeachBackSessionSchema = z.object({
  concept_node_id: z.string().uuid(),
});
export type StartTeachBackSessionInput = z.infer<typeof startTeachBackSessionSchema>;

export const submitExplanationSchema = z.object({
  content: z.string().min(1, "Explanation cannot be empty"),
});
export type SubmitExplanationInput = z.infer<typeof submitExplanationSchema>;

export const submitFollowupSchema = z.object({
  content: z.string().min(1, "Followup response cannot be empty"),
  target_gap_id: z.string().uuid().optional(),
});
export type SubmitFollowupInput = z.infer<typeof submitFollowupSchema>;

export const completeReviewSchema = z.object({
  review_schedule_id: z.string().uuid(),
  skipped: z.boolean().default(false),
});
export type CompleteReviewInput = z.infer<typeof completeReviewSchema>;

export const extractConceptsSchema = z.object({
  provider: z.enum(['local', 'gemini']).default('local'),
  minConfidence: z.number().min(0).max(1).default(0.7),
  documentOnly: z.boolean().default(false),
});
export type ExtractConceptsInput = z.infer<typeof extractConceptsSchema>;

export const generateGraphSchema = z.object({
  provider: z.enum(['local', 'gemini']).default('local'),
  minConfidence: z.number().min(0).max(1).default(0.7),
  documentOnly: z.boolean().default(false),
});
export type GenerateGraphInput = z.infer<typeof generateGraphSchema>;
