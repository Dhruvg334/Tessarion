import { z } from 'zod';
import { GapFindingOutput, TeachBackSummary } from '@/lib/ai/types';
import { ConceptMastery } from '@/lib/mastery/types';
import { ReviewRecommendation } from '@/lib/review/types';

export const DiagnosisRouteSchema = z.enum([
  'validate_input',
  'validate_evidence',
  'detect_gaps',
  'generate_feedback',
  'calculate_mastery',
  'calculate_review',
  'select_next_action',
  'completed',
  'needs_clarification',
  'insufficient_evidence',
  'failed',
]);
export type DiagnosisRoute = z.infer<typeof DiagnosisRouteSchema>;

export const DiagnosisStatusSchema = z.enum([
  'running',
  'completed',
  'needs_clarification',
  'insufficient_evidence',
  'failed',
]);
export type DiagnosisStatus = z.infer<typeof DiagnosisStatusSchema>;

export const DiagnosisSourceChunkSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
});
export type DiagnosisSourceChunk = z.infer<typeof DiagnosisSourceChunkSchema>;

export const LearningDiagnosisInputSchema = z.object({
  runId: z.string().uuid(),
  traceId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  explanationId: z.string().uuid(),
  conceptId: z.string().uuid(),
  conceptName: z.string().min(1).max(200),
  conceptDefinition: z.string().max(10_000).default(''),
  learnerExplanation: z.string().min(1).max(5_000),
  sourceChunks: z.array(DiagnosisSourceChunkSchema).max(30),
  prerequisiteConcepts: z.array(z.string().min(1).max(200)).max(20).default([]),
  existingMastery: z.custom<ConceptMastery>().nullable().default(null),
});
export type LearningDiagnosisInput = z.infer<typeof LearningDiagnosisInputSchema>;

export interface DiagnosisStepTrace {
  node: DiagnosisRoute;
  startedAt: string;
  completedAt: string;
  outcome: 'success' | 'branch' | 'failure';
  safeMessage: string;
}

export interface LearningDiagnosisState extends LearningDiagnosisInput {
  status: DiagnosisStatus;
  activeNode: DiagnosisRoute;
  gaps: GapFindingOutput[];
  feedback: TeachBackSummary | null;
  mastery: ConceptMastery | null;
  review: ReviewRecommendation | null;
  nextAction: 'teach_back_again' | 'start_tutoring' | 'review_later' | 'continue_learning' | null;
  warnings: string[];
  fallbackUsed: boolean;
  errorCode: string | null;
  stepTrace: DiagnosisStepTrace[];
}

export interface LearningDiagnosisResult {
  runId: string;
  traceId: string;
  status: Exclude<DiagnosisStatus, 'running'>;
  gaps: GapFindingOutput[];
  feedback: TeachBackSummary | null;
  mastery: ConceptMastery | null;
  review: ReviewRecommendation | null;
  nextAction: LearningDiagnosisState['nextAction'];
  warnings: string[];
  fallbackUsed: boolean;
  errorCode: string | null;
  stepTrace: DiagnosisStepTrace[];
}
