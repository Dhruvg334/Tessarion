import { MasteryState } from '../mastery/types';

export type ReviewStatus = 'not_ready' | 'queued' | 'due' | 'overdue' | 'completed' | 'skipped' | 'suspended';
export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReviewReasonType = 'misconception' | 'needs_review' | 'weak_connection' | 'shallow_explanation' | 'missing_prerequisite' | 'insufficient_evidence' | 'scheduled_reinforcement' | 'new_concept' | 'repeated_failure' | 'improvement_check';

export interface ReviewRecommendation {
  workspaceId: string;
  userId: string;
  conceptId: string;
  masteryState: MasteryState;
  priority: ReviewPriority | null;
  reasonType: ReviewReasonType | null;
  reason: string;
  recommendedAction: string;
  suggestedReviewAt: Date | null;
}

export interface ReviewScheduleData {
  id: string;
  workspaceId: string;
  userId: string;
  conceptId: string;
  masteryRecordId: string | null;
  status: ReviewStatus;
  priority: ReviewPriority;
  reasonType: ReviewReasonType;
  reason: string;
  scheduledFor: string | null;
  completedAt: string | null;
  skippedAt: string | null;
  attemptsCount: number;
  sourceMasterySignalIds: string[];
  createdAt: string;
  updatedAt: string;
}
