import { z } from 'zod';

export const WorkflowCheckpointStatusSchema = z.enum([
  'running',
  'waiting_for_input',
  'completed',
  'failed',
]);

export const WorkflowCheckpointSchema = z.object({
  threadId: z.string().min(1).max(160),
  checkpointId: z.string().uuid(),
  workflowName: z.string().min(1).max(100),
  workflowVersion: z.string().min(1).max(40),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  traceId: z.string().uuid(),
  status: WorkflowCheckpointStatusSchema,
  sequence: z.number().int().min(0),
  state: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export type WorkflowCheckpoint = z.infer<typeof WorkflowCheckpointSchema>;

export interface WorkflowCheckpointStore {
  save(checkpoint: WorkflowCheckpoint): Promise<void>;
  loadLatest(threadId: string): Promise<WorkflowCheckpoint | null>;
  list(threadId: string): Promise<WorkflowCheckpoint[]>;
  deleteThread(threadId: string): Promise<void>;
}
