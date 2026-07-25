import { AppError } from '@/lib/errors/app-error';
import { createServiceClient } from '@/lib/supabase/service';
import {
  WorkflowCheckpointSchema,
  type WorkflowCheckpoint,
  type WorkflowCheckpointStore,
} from '@/lib/workflows/checkpoints/types';

type SupabaseLike = ReturnType<typeof createServiceClient>;

interface WorkflowCheckpointRow {
  thread_id: string;
  checkpoint_id: string;
  workflow_name: string;
  workflow_version: string;
  workspace_id: string;
  user_id: string;
  trace_id: string;
  status: WorkflowCheckpoint['status'];
  sequence: number;
  state: Record<string, unknown>;
  created_at: string;
}

function toRow(checkpoint: WorkflowCheckpoint): WorkflowCheckpointRow {
  return {
    thread_id: checkpoint.threadId,
    checkpoint_id: checkpoint.checkpointId,
    workflow_name: checkpoint.workflowName,
    workflow_version: checkpoint.workflowVersion,
    workspace_id: checkpoint.workspaceId,
    user_id: checkpoint.userId,
    trace_id: checkpoint.traceId,
    status: checkpoint.status,
    sequence: checkpoint.sequence,
    state: checkpoint.state,
    created_at: checkpoint.createdAt,
  };
}

function fromRow(row: WorkflowCheckpointRow): WorkflowCheckpoint {
  return WorkflowCheckpointSchema.parse({
    threadId: row.thread_id,
    checkpointId: row.checkpoint_id,
    workflowName: row.workflow_name,
    workflowVersion: row.workflow_version,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    traceId: row.trace_id,
    status: row.status,
    sequence: row.sequence,
    state: row.state,
    createdAt: row.created_at,
  });
}

export class SupabaseWorkflowCheckpointStore implements WorkflowCheckpointStore {
  constructor(private readonly client: SupabaseLike = createServiceClient()) {}

  async save(checkpoint: WorkflowCheckpoint): Promise<void> {
    const parsed = WorkflowCheckpointSchema.parse(checkpoint);
    const { error } = await this.client.from('workflow_checkpoints').insert(toRow(parsed));
    if (error) {
      throw new AppError('Workflow checkpoint could not be persisted', 500, 'CHECKPOINT_PERSIST_FAILED');
    }
  }

  async loadLatest(threadId: string): Promise<WorkflowCheckpoint | null> {
    const { data, error } = await this.client
      .from('workflow_checkpoints')
      .select('*')
      .eq('thread_id', threadId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new AppError('Workflow checkpoint could not be loaded', 500, 'CHECKPOINT_LOAD_FAILED');
    }
    return data ? fromRow(data as WorkflowCheckpointRow) : null;
  }

  async list(threadId: string): Promise<WorkflowCheckpoint[]> {
    const { data, error } = await this.client
      .from('workflow_checkpoints')
      .select('*')
      .eq('thread_id', threadId)
      .order('sequence', { ascending: true });

    if (error) {
      throw new AppError('Workflow checkpoints could not be listed', 500, 'CHECKPOINT_LIST_FAILED');
    }
    return ((data ?? []) as WorkflowCheckpointRow[]).map(fromRow);
  }

  async deleteThread(threadId: string): Promise<void> {
    const { error } = await this.client.from('workflow_checkpoints').delete().eq('thread_id', threadId);
    if (error) {
      throw new AppError('Workflow checkpoints could not be deleted', 500, 'CHECKPOINT_DELETE_FAILED');
    }
  }
}
