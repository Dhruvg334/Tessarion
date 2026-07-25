import { AppError } from '@/lib/errors/app-error';
import type { WorkflowCheckpointStore, WorkflowCheckpointStatus } from '@/lib/workflows/checkpoints/types';

export interface WorkflowStep<TState extends Record<string, unknown>> {
  name: string;
  run(state: TState): Promise<TState> | TState;
  next(state: TState): string | null;
}

export interface CheckpointedRunInput<TState extends Record<string, unknown>> {
  threadId: string;
  workflowName: string;
  workflowVersion: string;
  workspaceId: string;
  userId: string;
  traceId: string;
  entryStep: string;
  initialState: TState;
  steps: readonly WorkflowStep<TState>[];
  checkpointStore: WorkflowCheckpointStore;
  maxSteps?: number;
}

export interface CheckpointedRunResult<TState> { status: WorkflowCheckpointStatus; state: TState; executedSteps: string[]; }

export async function runCheckpointedWorkflow<TState extends Record<string, unknown>>(input: CheckpointedRunInput<TState>): Promise<CheckpointedRunResult<TState>> {
  const stepMap = new Map(input.steps.map((step) => [step.name, step]));
  const previous = await input.checkpointStore.loadLatest(input.threadId);
  let state = (previous?.state as TState | undefined) ?? structuredClone(input.initialState);
  let current = (state.activeStep as string | undefined) ?? input.entryStep;
  let sequence = previous?.sequence ?? 0;
  const executedSteps: string[] = [];
  const maxSteps = input.maxSteps ?? 50;

  for (let count = 0; count < maxSteps; count += 1) {
    const step = stepMap.get(current);
    if (!step) throw new AppError(`Unknown workflow step: ${current}`, 500, 'WORKFLOW_STEP_NOT_FOUND');
    state = await step.run(state);
    executedSteps.push(current);
    const next = step.next(state);
    const status: WorkflowCheckpointStatus = next === null ? 'completed' : state.waitingForInput === true ? 'waiting_for_input' : 'running';
    sequence += 1;
    state = { ...state, activeStep: next ?? 'completed' };
    await input.checkpointStore.save({ threadId: input.threadId, checkpointId: crypto.randomUUID(), workflowName: input.workflowName, workflowVersion: input.workflowVersion, workspaceId: input.workspaceId, userId: input.userId, traceId: input.traceId, status, sequence, state, createdAt: new Date().toISOString() });
    if (status !== 'running') return { status, state, executedSteps };
    current = next as string;
  }

  throw new AppError('Workflow exceeded maximum step count', 500, 'WORKFLOW_STEP_LIMIT_EXCEEDED');
}
