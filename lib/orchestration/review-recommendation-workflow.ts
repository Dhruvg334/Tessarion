export type ReviewRecommendationState = 'request_received' | 'mastery_loaded' | 'due_found' | 'interleaving_applied' | 'queue_generated' | 'saved' | 'error';
export function transitionReviewRecommendation(state: ReviewRecommendationState) { return state; }
