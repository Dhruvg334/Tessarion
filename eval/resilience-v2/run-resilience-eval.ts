import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import { clearToolRegistryForTests, registerTool } from '@/lib/tools/registry';
import { executeToolWithRetry } from '@/lib/tools/runtime';
import { InMemoryWorkflowCheckpointStore } from '@/lib/workflows/checkpoints';
import { runCheckpointedWorkflow } from '@/lib/workflows/runtime';

interface ResilienceCaseResult {
  id: string;
  passed: boolean;
  detail: string;
}

const context = {
  workspaceId: crypto.randomUUID(),
  userId: crypto.randomUUID(),
  requestId: crypto.randomUUID(),
  traceId: crypto.randomUUID(),
};

async function main(): Promise<void> {
  const results: ResilienceCaseResult[] = [];
  results.push(await transientReadRetries());
  results.push(await persistentReadStopsAtLimit());
  results.push(await nonIdempotentWriteDoesNotRetry());
  results.push(await successfulWriteRunsOnce());
  results.push(await workflowCompletesWithCheckpoints());
  results.push(await workflowPausesForInput());
  results.push(await workflowResumesFromCheckpoint());
  results.push(await workflowRejectsUnknownStep());
  results.push(await workflowStopsInfiniteLoop());
  results.push(await checkpointHistoryIsMonotonic());

  const passRate = results.filter((result) => result.passed).length / results.length;
  console.table(results);
  console.table({ caseCount: results.length, passRate });
  if (results.length < 10 || passRate !== 1) process.exitCode = 1;
}

async function transientReadRetries(): Promise<ResilienceCaseResult> {
  clearToolRegistryForTests();
  let calls = 0;
  registerTool({ name: 'eval_flaky_read', description: 'eval', access: 'read', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 2, idempotent: true, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { calls += 1; if (calls < 3) throw new Error('temporary'); return { ok: true }; } });
  const result = await executeToolWithRetry<Record<string, never>, { ok: boolean }>('eval_flaky_read', {}, context, { sleep: async () => undefined });
  return outcome('transient-read-retries', result.output.ok && result.attempts.length === 3, `attempts=${result.attempts.length}`);
}

async function persistentReadStopsAtLimit(): Promise<ResilienceCaseResult> {
  clearToolRegistryForTests();
  let calls = 0;
  registerTool({ name: 'eval_failing_read', description: 'eval', access: 'read', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 2, idempotent: true, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { calls += 1; throw new Error('temporary'); } });
  try { await executeToolWithRetry('eval_failing_read', {}, context, { sleep: async () => undefined }); } catch { return outcome('persistent-read-stops', calls === 3, `calls=${calls}`); }
  return outcome('persistent-read-stops', false, 'did not fail');
}

async function nonIdempotentWriteDoesNotRetry(): Promise<ResilienceCaseResult> {
  clearToolRegistryForTests();
  let calls = 0;
  registerTool({ name: 'eval_write_once', description: 'eval', access: 'write', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 3, idempotent: false, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { calls += 1; throw new Error('failed'); } });
  try { await executeToolWithRetry('eval_write_once', {}, context, { sleep: async () => undefined }); } catch { return outcome('non-idempotent-write-once', calls === 1, `calls=${calls}`); }
  return outcome('non-idempotent-write-once', false, 'did not fail');
}

async function successfulWriteRunsOnce(): Promise<ResilienceCaseResult> {
  clearToolRegistryForTests();
  let calls = 0;
  registerTool({ name: 'eval_write_success', description: 'eval', access: 'write', inputSchema: z.object({}), outputSchema: z.object({ ok: z.boolean() }), timeoutMs: 1000, maxRetries: 0, idempotent: false, mcpExposure: 'none', sensitiveOutputFields: [], execute: async () => { calls += 1; return { ok: true }; } });
  const result = await executeToolWithRetry<Record<string, never>, { ok: boolean }>('eval_write_success', {}, context);
  return outcome('successful-write-once', calls === 1 && result.attempts.length === 1, `calls=${calls}`);
}

async function workflowCompletesWithCheckpoints(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  const result = await runCheckpointedWorkflow({ threadId: 'eval-complete', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, entryStep: 'increment', initialState: { count: 0 }, checkpointStore: store, steps: [{ name: 'increment', run: (state) => ({ ...state, count: Number(state.count) + 1 }), next: (state) => Number(state.count) >= 3 ? null : 'increment' }] });
  const history = await store.list('eval-complete');
  return outcome('workflow-checkpoints', result.status === 'completed' && history.length === 3, `checkpoints=${history.length}`);
}

async function workflowPausesForInput(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  const result = await runCheckpointedWorkflow({ threadId: 'eval-pause', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, entryStep: 'ask', initialState: {}, checkpointStore: store, steps: [{ name: 'ask', run: (state) => ({ ...state, waitingForInput: true }), next: () => 'evaluate' }, { name: 'evaluate', run: (state) => state, next: () => null }] });
  return outcome('workflow-pauses', result.status === 'waiting_for_input' && result.state.activeStep === 'evaluate', `status=${result.status}`);
}

async function workflowResumesFromCheckpoint(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  const base = { threadId: 'eval-resume', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, checkpointStore: store, steps: [{ name: 'ask', run: (state: Record<string, unknown>) => ({ ...state, waitingForInput: true }), next: () => 'evaluate' }, { name: 'evaluate', run: (state: Record<string, unknown>) => ({ ...state, waitingForInput: false, evaluated: true }), next: () => null }] };
  await runCheckpointedWorkflow({ ...base, entryStep: 'ask', initialState: {} });
  const latest = await store.loadLatest('eval-resume');
  if (!latest) return outcome('workflow-resumes', false, 'missing checkpoint');
  await store.save({ ...latest, checkpointId: crypto.randomUUID(), sequence: latest.sequence + 1, status: 'running', state: { ...latest.state, waitingForInput: false }, createdAt: new Date().toISOString() });
  const resumed = await runCheckpointedWorkflow({ ...base, entryStep: 'ask', initialState: {} });
  return outcome('workflow-resumes', resumed.status === 'completed' && resumed.state.evaluated === true, `status=${resumed.status}`);
}

async function workflowRejectsUnknownStep(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  try { await runCheckpointedWorkflow({ threadId: 'eval-unknown', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, entryStep: 'missing', initialState: {}, checkpointStore: store, steps: [] }); } catch (error) { return outcome('unknown-step-rejected', error instanceof AppError && error.code === 'WORKFLOW_STEP_NOT_FOUND', error instanceof AppError ? error.code : 'unknown'); }
  return outcome('unknown-step-rejected', false, 'did not fail');
}

async function workflowStopsInfiniteLoop(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  try { await runCheckpointedWorkflow({ threadId: 'eval-loop', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, entryStep: 'loop', initialState: {}, checkpointStore: store, maxSteps: 3, steps: [{ name: 'loop', run: (state) => state, next: () => 'loop' }] }); } catch (error) { return outcome('infinite-loop-bounded', error instanceof AppError && error.code === 'WORKFLOW_STEP_LIMIT_EXCEEDED', error instanceof AppError ? error.code : 'unknown'); }
  return outcome('infinite-loop-bounded', false, 'did not fail');
}

async function checkpointHistoryIsMonotonic(): Promise<ResilienceCaseResult> {
  const store = new InMemoryWorkflowCheckpointStore();
  await runCheckpointedWorkflow({ threadId: 'eval-sequence', workflowName: 'eval', workflowVersion: '1.0.0', workspaceId: context.workspaceId, userId: context.userId, traceId: context.traceId, entryStep: 'step', initialState: { count: 0 }, checkpointStore: store, steps: [{ name: 'step', run: (state) => ({ ...state, count: Number(state.count) + 1 }), next: (state) => Number(state.count) >= 4 ? null : 'step' }] });
  const history = await store.list('eval-sequence');
  return outcome('checkpoint-sequence', history.every((item, index) => item.sequence === index + 1), history.map((item) => item.sequence).join(','));
}

function outcome(id: string, passed: boolean, detail: string): ResilienceCaseResult { return { id, passed, detail }; }
void main();
