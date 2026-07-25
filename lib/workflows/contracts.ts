import { z } from 'zod';

export const WorkflowNameSchema = z.enum([
  'concept_intelligence',
  'learning_diagnosis',
  'socratic_tutor',
]);
export type WorkflowName = z.infer<typeof WorkflowNameSchema>;

export const WorkflowStatusSchema = z.enum([
  'queued',
  'running',
  'waiting_for_input',
  'completed',
  'partial',
  'failed',
  'cancelled',
]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

export const WorkflowIdentitySchema = z.object({
  workflowName: WorkflowNameSchema,
  workflowVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  runId: z.string().uuid(),
  traceId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(200),
});
export type WorkflowIdentity = z.infer<typeof WorkflowIdentitySchema>;

export const WorkflowErrorSchema = z.object({
  code: z.string().min(1).max(100),
  safeMessage: z.string().min(1).max(1_000),
  node: z.string().min(1).max(100),
  recoverable: z.boolean(),
  retryCount: z.number().int().min(0),
});
export type WorkflowError = z.infer<typeof WorkflowErrorSchema>;

export const WorkflowEnvelopeSchema = z.object({
  identity: WorkflowIdentitySchema,
  status: WorkflowStatusSchema,
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  activeNode: z.string().min(1).max(100).nullable(),
  error: WorkflowErrorSchema.nullable(),
  fallbackUsed: z.boolean(),
});
export type WorkflowEnvelope = z.infer<typeof WorkflowEnvelopeSchema>;

export interface WorkflowNodeContract<TState, TOutput> {
  name: string;
  maxRetries: number;
  timeoutMs: number;
  allowedTools: readonly string[];
  execute: (state: Readonly<TState>, signal?: AbortSignal) => Promise<Partial<TState> & { nodeOutput?: TOutput }>;
}
