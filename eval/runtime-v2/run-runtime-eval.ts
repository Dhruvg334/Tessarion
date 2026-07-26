import { InMemoryWorkflowCheckpointStore } from '../../lib/workflows/checkpoints';
import { runCheckpointedWorkflow } from '../../lib/workflows/runtime';

async function main() {
  const cases = Array.from({ length: 12 }, (_, index) => index + 1);
  let completed = 0;
  let checkpointComplete = 0;
  for (const target of cases) {
    const store = new InMemoryWorkflowCheckpointStore();
    const result = await runCheckpointedWorkflow({ threadId: `runtime-${target}`, workflowName: 'runtime_eval', workflowVersion: '1.0.0', workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), traceId: crypto.randomUUID(), entryStep: 'count', initialState: { count: 0 }, checkpointStore: store, maxSteps: 20, steps: [{ name: 'count', run: (state) => ({ ...state, count: Number(state.count) + 1 }), next: (state) => Number(state.count) >= target ? null : 'count' }] });
    if (result.status === 'completed' && result.state.count === target) completed += 1;
    if ((await store.list(`runtime-${target}`)).length === target) checkpointComplete += 1;
  }
  const metrics = { caseCount: cases.length, completionAccuracy: completed / cases.length, checkpointCompleteness: checkpointComplete / cases.length };
  console.table(metrics);
  if (metrics.completionAccuracy < 1 || metrics.checkpointCompleteness < 1) process.exitCode = 1;
}
main().catch(() => { console.error('Runtime evaluation failed safely'); process.exitCode = 1; });
