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
      availableSourceChunkIds: ['chunk-1']
    });

    expect(decision.nextMove).toBe('ask_contrast_question');
    expect(decision.shouldUpdateMastery).toBe(false);
    expect(decision.shouldCompleteSession).toBe(false);
    expect(decision.sourceChunkIds).toEqual(['chunk-1']);
  });
  
  it('escalates to ask_evidence_question for misconception', () => {
    const session = { ...baseSession, currentTurnCount: 1 };
    const decision = decideNextMove({
      session,
      previousTurns: [
        { role: 'tutor', tutorMove: 'ask_contrast_question' } as TutoringTurn,
      ],
      availableSourceChunkIds: ['chunk-2']
    });

    expect(decision.nextMove).toBe('ask_evidence_question');
    expect(decision.shouldUpdateMastery).toBe(false);
    expect(decision.sourceChunkIds).toEqual(['chunk-2']);
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
    expect(decision.shouldUpdateMastery).toBe(false);
    expect(decision.sourceChunkIds).toEqual([]);
  });

  it('starts with asking evidence for unsupported claim', () => {
    const decision = decideNextMove({
      session: { ...baseSession, focusType: 'unsupported_claim' },
      previousTurns: [],
      availableSourceChunkIds: []
    });
    expect(decision.nextMove).toBe('ask_evidence_question');
    expect(decision.sourceChunkIds).toEqual([]);
  });

  it('starts with asking example for shallow explanation', () => {
    const decision = decideNextMove({
      session: { ...baseSession, focusType: 'shallow_explanation' },
      previousTurns: [],
      availableSourceChunkIds: ['chunk-4']
    });
    expect(decision.nextMove).toBe('ask_example_question');
    expect(decision.sourceChunkIds).toEqual(['chunk-4']);
  });

});
