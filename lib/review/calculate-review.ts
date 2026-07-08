import { ConceptMastery } from '../mastery/types';
import { ReviewRecommendation } from './types';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateReviewRecommendation(
  mastery: ConceptMastery,
  now: Date = new Date()
): ReviewRecommendation {
  const rec: ReviewRecommendation = {
    workspaceId: mastery.workspaceId,
    userId: mastery.userId,
    conceptId: mastery.conceptId,
    masteryState: mastery.state,
    priority: null,
    reasonType: null,
    reason: '',
    recommendedAction: '',
    suggestedReviewAt: null
  };

  switch (mastery.state) {
    case 'unassessed':
      rec.reason = 'Concept has not been evaluated yet.';
      rec.recommendedAction = 'Complete teach-back first.';
      break;
    
    case 'insufficient_evidence':
      rec.reason = 'Not enough learning evidence gathered to schedule a review.';
      rec.recommendedAction = 'Add stronger source material or complete another teach-back.';
      break;

    case 'misconception':
      rec.priority = 'critical';
      rec.reasonType = 'misconception';
      rec.reason = 'Significant misconception detected in previous explanation.';
      rec.recommendedAction = 'Revisit the source evidence and explain the corrected concept.';
      rec.suggestedReviewAt = addDays(now, 1);
      break;

    case 'needs_review':
      rec.priority = 'high';
      rec.reasonType = 'needs_review';
      rec.reason = 'Explanation lacked key details or showed confusion.';
      rec.recommendedAction = 'Review the missing or weak parts and try teach-back again.';
      rec.suggestedReviewAt = addDays(now, 1);
      break;

    case 'weak_connection':
      rec.priority = 'medium'; // Can be medium or high, using medium
      rec.reasonType = 'weak_connection';
      rec.reason = 'Connections to prerequisites or related ideas were missing.';
      rec.recommendedAction = 'Connect this concept to its prerequisite or related idea.';
      rec.suggestedReviewAt = addDays(now, 2);
      break;

    case 'partial':
      rec.priority = 'medium';
      rec.reasonType = 'shallow_explanation';
      rec.reason = 'Explanation was generally correct but lacked depth.';
      rec.recommendedAction = 'Strengthen missing details with another teach-back.';
      rec.suggestedReviewAt = addDays(now, 3);
      break;

    case 'emerging':
      rec.priority = 'medium';
      rec.reasonType = 'needs_review';
      rec.reason = 'Basic understanding shown, but needs more practice.';
      rec.recommendedAction = 'Practice the basic explanation again.';
      rec.suggestedReviewAt = addDays(now, 2);
      break;

    case 'understood':
      rec.priority = 'low';
      rec.reasonType = 'scheduled_reinforcement';
      rec.reason = 'Concept is understood. Light reinforcement scheduled.';
      rec.recommendedAction = 'Light reinforcement review.';
      rec.suggestedReviewAt = addDays(now, 7);
      break;
  }

  return rec;
}
