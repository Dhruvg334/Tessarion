import { describe, expect, it } from 'vitest';
import { InMemoryWorkflowCheckpointStore } from './in-memory-store';
import { WorkflowCheckpoint } from './types';

const baseCheckpoint: WorkflowCheckpoint = {
  threadId: 'thread-1',
  checkpointId: '11111111-1111-4111-8111-111111111111',
  workflowName: 'socratic_tutor',
  workflowVersion: '1.0.0',
  workspaceId: '22222222-2222-4222-8222-222222222222',
  userId: '33333333-3333-4333-8333-333333333333',
  traceId: '44444444-4444-4444-8444-444444444444',
  status: 'waiting_for_input',
  sequence: 1,
  state: { activeNode: 'wait_for_learner', turnCount: 1 },
  createdAt: '2026-07-26T00:00:00.000Z',
};

describe('InMemoryWorkflowCheckpointStore', () => {
  it('stores immutable checkpoint history and returns the latest state', async () => {
    const store = new InMemoryWorkflowCheckpointStore();
    await store.save(baseCheckpoint);
    await store.save({
      ...baseCheckpoint,
      checkpointId: '55555555-5555-4555-8555-555555555555',
      sequence: 2,
      status: 'completed',
      state: { activeNode: 'completed', turnCount: 2 },
    });

    expect((await store.list(baseCheckpoint.threadId)).map((item) => item.sequence)).toEqual([1, 2]);
    expect((await store.loadLatest(baseCheckpoint.threadId))?.status).toBe('completed');
  });

  it('rejects non-monotonic checkpoint sequences', async () => {
    const store = new InMemoryWorkflowCheckpointStore();
    await store.save(baseCheckpoint);

    await expect(
      store.save({ ...baseCheckpoint, checkpointId: crypto.randomUUID(), sequence: 1 })
    ).rejects.toMatchObject({ code: 'CHECKPOINT_SEQUENCE_CONFLICT' });
  });
});
