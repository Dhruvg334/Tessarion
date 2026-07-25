import { describe, expect, it, vi } from 'vitest';
import { SupabaseWorkflowCheckpointStore } from './supabase-store';

function checkpoint(sequence = 1) {
  return {
    threadId: 'thread-1', checkpointId: crypto.randomUUID(), workflowName: 'diagnosis', workflowVersion: '1.0.0',
    workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), traceId: crypto.randomUUID(), status: 'running' as const,
    sequence, state: { activeStep: 'retrieve' }, createdAt: new Date().toISOString(),
  };
}

describe('SupabaseWorkflowCheckpointStore', () => {
  it('maps checkpoints to persistence rows', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = { from: vi.fn(() => ({ insert })) } as never;
    const store = new SupabaseWorkflowCheckpointStore(client);
    await store.save(checkpoint());
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ thread_id: 'thread-1', sequence: 1 }));
  });

  it('normalizes persistence failures', async () => {
    const client = { from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: { message: 'db' } }) })) } as never;
    const store = new SupabaseWorkflowCheckpointStore(client);
    await expect(store.save(checkpoint())).rejects.toMatchObject({ code: 'CHECKPOINT_PERSIST_FAILED' });
  });
});
