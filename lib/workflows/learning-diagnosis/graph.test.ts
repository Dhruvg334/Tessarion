import { describe, expect, it } from 'vitest';
import { runLearningDiagnosis } from './graph';
import { LearningDiagnosisInput } from './types';

const baseInput: LearningDiagnosisInput = {
  runId: '11111111-1111-4111-8111-111111111111',
  traceId: '22222222-2222-4222-8222-222222222222',
  workspaceId: '33333333-3333-4333-8333-333333333333',
  userId: '44444444-4444-4444-8444-444444444444',
  sessionId: '55555555-5555-4555-8555-555555555555',
  explanationId: '66666666-6666-4666-8666-666666666666',
  conceptId: '77777777-7777-4777-8777-777777777777',
  conceptName: 'Binary Search',
  conceptDefinition: 'Binary search repeatedly halves a sorted search interval.',
  learnerExplanation: 'Binary search repeatedly halves a sorted search interval until the target is found.',
  sourceChunks: [{
    id: 'chunk-1',
    content: 'Binary search repeatedly halves a sorted search interval until the target is found.',
  }],
  prerequisiteConcepts: [],
  existingMastery: null,
};

describe('runLearningDiagnosis', () => {
  it('completes a grounded diagnosis deterministically', async () => {
    const result = await runLearningDiagnosis(baseInput);

    expect(result.status).toBe('completed');
    expect(result.mastery?.state).toBe('insufficient_evidence');
    expect(result.nextAction).toBe('teach_back_again');
    expect(result.stepTrace.map((step) => step.node)).toEqual([
      'validate_input',
      'validate_evidence',
      'detect_gaps',
      'generate_feedback',
      'calculate_mastery',
      'calculate_review',
      'select_next_action',
    ]);
  });

  it('stops when no source evidence exists', async () => {
    const result = await runLearningDiagnosis({
      ...baseInput,
      conceptDefinition: '',
      sourceChunks: [],
    });

    expect(result.status).toBe('insufficient_evidence');
    expect(result.errorCode).toBe('INSUFFICIENT_SOURCE_EVIDENCE');
    expect(result.mastery).toBeNull();
  });

  it('routes shallow explanations back to teach-back', async () => {
    const result = await runLearningDiagnosis({
      ...baseInput,
      learnerExplanation: 'Binary search.',
    });

    expect(result.status).toBe('completed');
    expect(result.mastery?.state).toBe('partial');
    expect(result.nextAction).toBe('teach_back_again');
  });
});
