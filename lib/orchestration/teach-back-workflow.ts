export type TeachBackState = 'concept_selected' | 'explanation_submitted' | 'rag_context_retrieved' | 'gap_detection_complete' | 'socratic_question_ready' | 'feedback_generated' | 'mastery_updated' | 'completed' | 'error';
// TODO: Implement workflow logic
export function transitionTeachBack(state: TeachBackState) { return state; }
