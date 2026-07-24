import { describe, it, expect } from 'vitest';
import { resolveNextAction, NextActionContext } from './next-action';

describe('next-action resolver', () => {
  const baseCtx: NextActionContext = {
    workspaceId: 'w1',
    sourceDocumentCount: 1,
    conceptCount: 5,
    teachBackSessionCount: 2,
    activeTutoringSessions: [],
    completedTutoringSessionsThisSession: [],
    reviewQueue: [],
    masterySummary: []
  };

  it('prioritizes add_source when no sources exist', () => {
    const action = resolveNextAction({ ...baseCtx, sourceDocumentCount: 0 });
    expect(action.type).toBe('add_source');
  });

  it('prioritizes extract_concepts when source exists but no concepts', () => {
    const action = resolveNextAction({ ...baseCtx, conceptCount: 0 });
    expect(action.type).toBe('extract_concepts');
  });

  it('prioritizes start_teach_back when concepts exist but no teach-back yet', () => {
    const action = resolveNextAction({ ...baseCtx, teachBackSessionCount: 0 });
    expect(action.type).toBe('start_teach_back');
  });

  it('prioritizes start_tutoring for critical review (misconception)', () => {
    const action = resolveNextAction({
      ...baseCtx,
      reviewQueue: [{ id: 'r1', reason_type: 'misconception', priority: 'critical', status: 'due' }]
    });
    expect(action.type).toBe('start_tutoring');
  });

  it('prioritizes continue_tutoring over everything else if session is active', () => {
    const action = resolveNextAction({
      ...baseCtx,
      activeTutoringSessions: [{ id: 't1', status: 'active' }],
      reviewQueue: [{ id: 'r1', reason_type: 'misconception', priority: 'critical', status: 'due' }]
    });
    expect(action.type).toBe('continue_tutoring');
  });

  it('returns retry_teach_back when tutoring just completed', () => {
    const action = resolveNextAction({
      ...baseCtx,
      completedTutoringSessionsThisSession: [{ id: 't1', status: 'completed' }]
    });
    expect(action.type).toBe('retry_teach_back');
  });

  it('returns light_reinforcement for low priority non-due reviews', () => {
    const action = resolveNextAction({
      ...baseCtx,
      reviewQueue: [{ id: 'r1', priority: 'low', status: 'queued' }]
    });
    expect(action.type).toBe('light_reinforcement');
  });

  it('returns continue_learning when all queues clear', () => {
    const action = resolveNextAction(baseCtx);
    expect(action.type).toBe('continue_learning');
  });
});
