import { describe, expect, it } from 'vitest';
import { InMemoryWorkflowCheckpointStore } from '@/lib/workflows/checkpoints';
import { runCheckpointedWorkflow } from './checkpointed-runner';

describe('runCheckpointedWorkflow', () => {
  it('persists every transition and completes', async () => {
    const store = new InMemoryWorkflowCheckpointStore();
    const result = await runCheckpointedWorkflow({ threadId: 't1', workflowName: 'demo', workflowVersion: '1.0.0', workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), traceId: crypto.randomUUID(), entryStep: 'increment', initialState: { count: 0 }, checkpointStore: store, steps: [{ name: 'increment', run: (state) => ({ ...state, count: Number(state.count) + 1 }), next: (state) => Number(state.count) >= 2 ? null : 'increment' }] });
    expect(result.status).toBe('completed');
    expect(result.state.count).toBe(2);
    expect(await store.list('t1')).toHaveLength(2);
  });

  it('pauses with a resumable checkpoint', async () => {
    const store = new InMemoryWorkflowCheckpointStore();
    const result = await runCheckpointedWorkflow({ threadId: 't2', workflowName: 'tutor', workflowVersion: '1.0.0', workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), traceId: crypto.randomUUID(), entryStep: 'ask', initialState: {}, checkpointStore: store, steps: [{ name: 'ask', run: (state) => ({ ...state, waitingForInput: true }), next: () => 'evaluate' }, { name: 'evaluate', run: (state) => state, next: () => null }] });
    expect(result.status).toBe('waiting_for_input');
    expect((await store.loadLatest('t2'))?.state.activeStep).toBe('evaluate');
  });
});
