import { detectGapsLocal } from '@/lib/ai/tasks/local-gap-detection';
import { generateFeedbackSummary } from '@/lib/ai/tasks/reflection-summary';
import { generateSocraticQuestions } from '@/lib/ai/tasks/socratic-question';
import { validateTeachBackFeedback } from '@/lib/ai/tasks/feedback-validation';
import { calculateMastery } from '@/lib/mastery/calculate-mastery';
import { CoveredMasteryEvidence, MasteryGapInput } from '@/lib/mastery/types';
import { calculateReviewRecommendation } from '@/lib/review/calculate-review';
import { LearningDiagnosisState } from './types';

export function validateDiagnosisInput(state: LearningDiagnosisState): Partial<LearningDiagnosisState> {
  if (!state.learnerExplanation.trim()) {
    return {
      status: 'failed',
      activeNode: 'failed',
      errorCode: 'EMPTY_EXPLANATION',
      warnings: ['A teach-back explanation is required.'],
    };
  }

  return { activeNode: 'validate_evidence' };
}

export function validateDiagnosisEvidence(state: LearningDiagnosisState): Partial<LearningDiagnosisState> {
  if (state.sourceChunks.length === 0 && !state.conceptDefinition.trim()) {
    return {
      status: 'insufficient_evidence',
      activeNode: 'insufficient_evidence',
      errorCode: 'INSUFFICIENT_SOURCE_EVIDENCE',
      warnings: ['No grounded source evidence is available for diagnosis.'],
      nextAction: 'continue_learning',
    };
  }

  return { activeNode: 'detect_gaps' };
}

export async function detectDiagnosisGaps(
  state: LearningDiagnosisState
): Promise<Partial<LearningDiagnosisState>> {
  const gaps = await detectGapsLocal({
    studentExplanation: state.learnerExplanation,
    conceptName: state.conceptName,
    conceptDefinition: state.conceptDefinition,
    sourceChunks: state.sourceChunks,
    prerequisiteConcepts: state.prerequisiteConcepts,
  });

  return {
    gaps,
    fallbackUsed: true,
    activeNode: 'generate_feedback',
  };
}

export async function generateDiagnosisFeedback(
  state: LearningDiagnosisState
): Promise<Partial<LearningDiagnosisState>> {
  const questions = state.gaps.length > 0
    ? await generateSocraticQuestions({
        gaps: state.gaps,
        studentExplanation: state.learnerExplanation,
        provider: 'local',
      })
    : [];

  const feedback = await generateFeedbackSummary({
    studentExplanation: state.learnerExplanation,
    conceptName: state.conceptName,
    conceptNodeId: state.conceptId,
    sourceChunks: state.sourceChunks,
    gaps: state.gaps,
    followUpQuestion: questions[0] ?? null,
  });

  validateTeachBackFeedback(feedback);

  return {
    feedback,
    activeNode: 'calculate_mastery',
  };
}

export function calculateDiagnosisMastery(
  state: LearningDiagnosisState
): Partial<LearningDiagnosisState> {
  if (!state.feedback) {
    return {
      status: 'failed',
      activeNode: 'failed',
      errorCode: 'MISSING_FEEDBACK',
      warnings: [...state.warnings, 'Feedback was unavailable for mastery calculation.'],
    };
  }

  const coveredWell: CoveredMasteryEvidence[] = state.feedback.coveredWell.map((item) => ({
    description: item.description,
    sourceChunkIds: item.sourceChunkIds,
    relatedConceptId: item.relatedConceptId,
    evidenceQuote: item.evidenceQuote,
    confidenceScore: item.confidenceScore,
  }));

  const masteryGaps: MasteryGapInput[] = [
    ...state.feedback.gaps,
    ...state.feedback.unsupportedClaims,
  ].map((gap, index) => ({
    id: `diagnosis-gap-${index + 1}`,
    gap_type: gap.gapType,
    severity: gap.severity,
    description: gap.description,
    source_chunk_ids: gap.sourceChunkIds,
  }));

  const { newMastery } = calculateMastery({
    conceptId: state.conceptId,
    workspaceId: state.workspaceId,
    userId: state.userId,
    sourceSessionId: state.sessionId,
    sourceExplanationId: state.explanationId,
    coveredWell,
    gapFindings: masteryGaps,
    existingMastery: state.existingMastery,
  });

  return {
    mastery: newMastery,
    activeNode: 'calculate_review',
  };
}

export function calculateDiagnosisReview(
  state: LearningDiagnosisState
): Partial<LearningDiagnosisState> {
  if (!state.mastery) {
    return {
      status: 'failed',
      activeNode: 'failed',
      errorCode: 'MISSING_MASTERY',
      warnings: [...state.warnings, 'Mastery was unavailable for review calculation.'],
    };
  }

  return {
    review: calculateReviewRecommendation(state.mastery, new Date('2026-01-01T00:00:00.000Z')),
    activeNode: 'select_next_action',
  };
}

export function selectDiagnosisNextAction(
  state: LearningDiagnosisState
): Partial<LearningDiagnosisState> {
  if (!state.mastery) {
    return {
      status: 'failed',
      activeNode: 'failed',
      errorCode: 'MISSING_MASTERY',
    };
  }

  const nextAction = (() => {
    switch (state.mastery.state) {
      case 'misconception':
      case 'needs_review':
      case 'weak_connection':
        return 'start_tutoring' as const;
      case 'insufficient_evidence':
      case 'emerging':
      case 'partial':
        return 'teach_back_again' as const;
      case 'understood':
        return 'review_later' as const;
      default:
        return 'continue_learning' as const;
    }
  })();

  return {
    nextAction,
    status: 'completed',
    activeNode: 'completed',
  };
}
