import { TutoringFocusType, TutoringMove } from './types';

/**
 * Maps a focus type and current turn count/history to the next pedagogical move.
 * Escalates gradually from questions -> hints -> correction.
 */
export function getDeterministicMove(
  focusType: TutoringFocusType,
  previousTutorMoves: TutoringMove[]
): TutoringMove {
  const moveCount = previousTutorMoves.length;

  switch (focusType) {
    case 'misconception':
      if (moveCount === 0) return 'ask_contrast_question';
      if (moveCount === 1) return 'ask_evidence_question';
      if (moveCount === 2) return 'provide_small_hint';
      if (moveCount === 3) return 'ask_correction';
      return 'request_teach_back_again';

    case 'missing_concept':
    case 'prerequisite_gap':
      if (moveCount === 0) return 'ask_prerequisite_question';
      if (moveCount === 1) return 'ask_clarifying_question';
      if (moveCount === 2) return 'provide_small_hint';
      if (moveCount === 3) return 'ask_correction';
      return 'request_teach_back_again';

    case 'weak_connection':
      if (moveCount === 0) return 'ask_clarifying_question';
      if (moveCount === 1) return 'ask_example_question';
      if (moveCount === 2) return 'provide_small_hint';
      if (moveCount === 3) return 'ask_correction';
      return 'request_teach_back_again';

    case 'unsupported_claim':
      if (moveCount === 0) return 'ask_evidence_question';
      if (moveCount === 1) return 'ask_correction';
      if (moveCount === 2) return 'provide_small_hint';
      return 'request_teach_back_again';

    case 'shallow_explanation':
      if (moveCount === 0) return 'ask_example_question';
      if (moveCount === 1) return 'ask_clarifying_question';
      if (moveCount === 2) return 'provide_small_hint';
      if (moveCount === 3) return 'ask_correction';
      return 'request_teach_back_again';

    case 'review_reinforcement':
      if (moveCount === 0) return 'ask_clarifying_question';
      if (moveCount === 1) return 'ask_example_question';
      if (moveCount === 2) return 'provide_small_hint';
      if (moveCount === 3) return 'ask_correction';
      return 'request_teach_back_again';

    default:
      if (moveCount === 0) return 'ask_clarifying_question';
      if (moveCount === 1) return 'provide_small_hint';
      if (moveCount === 2) return 'ask_correction';
      return 'request_teach_back_again';
  }
}
