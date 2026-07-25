import { AppError } from '@/lib/errors/app-error';
import {
  LearningDiagnosisInput,
  LearningDiagnosisInputSchema,
  LearningDiagnosisResult,
  LearningDiagnosisState,
  DiagnosisRoute,
} from './types';
import {
  calculateDiagnosisMastery,
  calculateDiagnosisReview,
  detectDiagnosisGaps,
  generateDiagnosisFeedback,
  selectDiagnosisNextAction,
  validateDiagnosisEvidence,
  validateDiagnosisInput,
} from './nodes';

const TERMINAL_NODES = new Set<DiagnosisRoute>([
  'completed',
  'needs_clarification',
  'insufficient_evidence',
  'failed',
]);

function createInitialState(input: LearningDiagnosisInput): LearningDiagnosisState {
  const parsed = LearningDiagnosisInputSchema.parse(input);
  return {
    ...parsed,
    status: 'running',
    activeNode: 'validate_input',
    gaps: [],
    feedback: null,
    mastery: null,
    review: null,
    nextAction: null,
    warnings: [],
    fallbackUsed: false,
    errorCode: null,
    stepTrace: [],
  };
}

function appendStep(
  state: LearningDiagnosisState,
  node: DiagnosisRoute,
  startedAt: string,
  outcome: 'success' | 'branch' | 'failure',
  safeMessage: string
): LearningDiagnosisState {
  return {
    ...state,
    stepTrace: [
      ...state.stepTrace,
      {
        node,
        startedAt,
        completedAt: new Date().toISOString(),
        outcome,
        safeMessage,
      },
    ],
  };
}

async function executeNode(state: LearningDiagnosisState): Promise<Partial<LearningDiagnosisState>> {
  switch (state.activeNode) {
    case 'validate_input':
      return validateDiagnosisInput(state);
    case 'validate_evidence':
      return validateDiagnosisEvidence(state);
    case 'detect_gaps':
      return detectDiagnosisGaps(state);
    case 'generate_feedback':
      return generateDiagnosisFeedback(state);
    case 'calculate_mastery':
      return calculateDiagnosisMastery(state);
    case 'calculate_review':
      return calculateDiagnosisReview(state);
    case 'select_next_action':
      return selectDiagnosisNextAction(state);
    default:
      return {};
  }
}

export async function runLearningDiagnosis(
  input: LearningDiagnosisInput
): Promise<LearningDiagnosisResult> {
  let state = createInitialState(input);
  let steps = 0;

  while (!TERMINAL_NODES.has(state.activeNode)) {
    if (steps >= 12) {
      state = {
        ...state,
        status: 'failed',
        activeNode: 'failed',
        errorCode: 'WORKFLOW_STEP_LIMIT',
        warnings: [...state.warnings, 'Diagnosis stopped after reaching the workflow step limit.'],
      };
      break;
    }

    const node = state.activeNode;
    const startedAt = new Date().toISOString();

    try {
      const update = await executeNode(state);
      state = { ...state, ...update };
      const terminalBranch = TERMINAL_NODES.has(state.activeNode) && state.activeNode !== 'completed';
      state = appendStep(
        state,
        node,
        startedAt,
        terminalBranch ? 'branch' : 'success',
        terminalBranch ? `Workflow branched to ${state.activeNode}.` : `Completed ${node}.`
      );
    } catch (error) {
      const code = error instanceof AppError ? error.code : 'DIAGNOSIS_NODE_FAILED';
      state = {
        ...state,
        status: 'failed',
        activeNode: 'failed',
        errorCode: code,
        warnings: [...state.warnings, 'Learning diagnosis could not be completed safely.'],
      };
      state = appendStep(state, node, startedAt, 'failure', 'Node failed with a safe workflow error.');
    }

    steps += 1;
  }

  return {
    runId: state.runId,
    traceId: state.traceId,
    status: state.status === 'running' ? 'failed' : state.status,
    gaps: state.gaps,
    feedback: state.feedback,
    mastery: state.mastery,
    review: state.review,
    nextAction: state.nextAction,
    warnings: state.warnings,
    fallbackUsed: state.fallbackUsed,
    errorCode: state.errorCode,
    stepTrace: state.stepTrace,
  };
}
