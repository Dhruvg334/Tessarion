import { describe, it, expect } from 'vitest';
import { decideNextMove } from './decide-next-move';
import { TutoringSession, TutoringTurn } from './types';

describe('decideNextMove', () => {
  const baseSession: TutoringSession = {
    id: 's1',
    workspaceId: 'w1',
    userId: 'u1',
    conceptId: 'c1',
    teachBackSessionId: null,
    reviewScheduleId: null,
    focusType: 'misconception',
    focusSummary: 'test',
    status: 'active',
    currentTurnCount: 0,
    maxTurns: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };

  it('starts with asking a contrast question for misconception', () => {
    const decision = decideNextMove({
      session: baseSession,
      previousTurns: [],
      availableSourceChunkIds: []
    });

    expect(decision.nextMove).toBe('ask_contrast_question');
    expect(decision.shouldCompleteSession).toBe(false);
  });

  it('summarizes and completes when max turns are reached', () => {
    const session = { ...baseSession, currentTurnCount: 6 };
    const decision = decideNextMove({
      session,
      previousTurns: [
        { role: 'tutor', tutorMove: 'ask_contrast_question' } as TutoringTurn,
        { role: 'tutor', tutorMove: 'ask_evidence_question' } as TutoringTurn
      ],
      availableSourceChunkIds: []
    });

    expect(decision.nextMove).toBe('summarize_progress');
    expect(decision.shouldCompleteSession).toBe(true);
  });
});
