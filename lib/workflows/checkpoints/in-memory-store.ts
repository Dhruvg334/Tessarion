import { AppError } from '@/lib/errors/app-error';
import {
  WorkflowCheckpoint,
  WorkflowCheckpointSchema,
  WorkflowCheckpointStore,
} from './types';

function cloneCheckpoint(checkpoint: WorkflowCheckpoint): WorkflowCheckpoint {
  return structuredClone(checkpoint);
}

function assertSerializableState(state: Record<string, unknown>): void {
  try {
    JSON.stringify(state);
  } catch {
    throw new AppError(
      'Workflow checkpoint state must be JSON-serializable',
      400,
      'CHECKPOINT_STATE_NOT_SERIALIZABLE'
    );
  }
}

export class InMemoryWorkflowCheckpointStore implements WorkflowCheckpointStore {
  private readonly threads = new Map<string, WorkflowCheckpoint[]>();

  async save(input: WorkflowCheckpoint): Promise<void> {
    const checkpoint = WorkflowCheckpointSchema.parse(input);
    assertSerializableState(checkpoint.state);

    const current = this.threads.get(checkpoint.threadId) ?? [];
    const latest = current.at(-1);

    if (latest && checkpoint.sequence <= latest.sequence) {
      throw new AppError(
        'Workflow checkpoint sequence must increase monotonically',
        409,
        'CHECKPOINT_SEQUENCE_CONFLICT'
      );
    }

    this.threads.set(checkpoint.threadId, [...current, cloneCheckpoint(checkpoint)]);
  }

  async loadLatest(threadId: string): Promise<WorkflowCheckpoint | null> {
    const latest = this.threads.get(threadId)?.at(-1);
    return latest ? cloneCheckpoint(latest) : null;
  }

  async list(threadId: string): Promise<WorkflowCheckpoint[]> {
    return (this.threads.get(threadId) ?? []).map(cloneCheckpoint);
  }

  async deleteThread(threadId: string): Promise<void> {
    this.threads.delete(threadId);
  }
}
