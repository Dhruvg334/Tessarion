import { describe, it, expect } from 'vitest';
import { calculateMastery, MasteryInput } from './calculate-mastery';
import { CoveredMasteryEvidence, MasteryGapInput, ConceptMastery } from './types';

function makeInput(overrides: Partial<MasteryInput> = {}): MasteryInput {
  return {
    conceptId: 'c1',
    workspaceId: 'w1',
    userId: 'u1',
    sourceSessionId: 's1',
    sourceExplanationId: 'e1',
    coveredWell: [],
    gapFindings: [],
    ...overrides,
  };
}

function groundedEvidence(desc: string, chunkIds: string[] = ['chunk-1']): CoveredMasteryEvidence {
  return {
    description: desc,
    sourceChunkIds: chunkIds,
    confidenceScore: 0.9,
  };
}

function ungroundedEvidence(desc: string): CoveredMasteryEvidence {
  return {
    description: desc,
    sourceChunkIds: [],
    confidenceScore: 0.9,
  };
}

function makeGap(overrides: Partial<MasteryGapInput> = {}): MasteryGapInput {
  return {
    id: 'gap-real-1',
    gap_type: 'missing_concept',
    severity: 'moderate',
    description: 'Missing something',
    source_chunk_ids: [],
    ...overrides,
  };
}

function existingMastery(state: ConceptMastery['state'], overrides: Partial<ConceptMastery> = {}): ConceptMastery {
  return {
    conceptId: 'c1',
    workspaceId: 'w1',
    userId: 'u1',
    state,
    confidenceScore: 0.9,
    evidenceCount: 3,
    attemptsCount: 1,
    lastAssessedAt: new Date().toISOString(),
    strongestGaps: [],
    coveredSignals: [],
    recommendationLabel: '',
    explanation: '',
    ...overrides,
  };
}

describe('calculateMastery', () => {
  it('returns understood from grounded coverage with no severe gaps', () => {
    const input = makeInput({
      coveredWell: [
        groundedEvidence('Correct definition'),
        groundedEvidence('Correct usage'),
        groundedEvidence('Correct example'),
      ],
      existingMastery: existingMastery('partial'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('understood');
  });

  it('returns partial from one missing concept', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Definition')],
      gapFindings: [makeGap({ gap_type: 'missing_concept', severity: 'moderate' })],
      existingMastery: existingMastery('emerging'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('partial');
  });

  it('returns emerging from multiple missing concepts', () => {
    const input = makeInput({
      coveredWell: [],
      gapFindings: [
        makeGap({ id: 'g1', gap_type: 'missing_concept', severity: 'moderate', description: 'Missing A' }),
        makeGap({ id: 'g2', gap_type: 'missing_concept', severity: 'moderate', description: 'Missing B' }),
      ],
      existingMastery: existingMastery('partial'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('emerging');
  });

  it('returns misconception from severe misconception', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Some correct part')],
      gapFindings: [makeGap({ gap_type: 'misconception', severity: 'significant', description: 'Thinks arrays are linked lists' })],
      existingMastery: existingMastery('understood'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('misconception');
  });

  it('returns needs_review from unsupported claim', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Some coverage')],
      gapFindings: [makeGap({ gap_type: 'unsupported_claim', severity: 'moderate', description: 'Unverified claim' })],
      existingMastery: existingMastery('partial'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('needs_review');
  });

  it('returns needs_review from missing prerequisite', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Some coverage')],
      gapFindings: [makeGap({ gap_type: 'missing_prerequisite', severity: 'moderate', description: 'Missing prereq' })],
      existingMastery: existingMastery('partial'),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('needs_review');
  });

  it('returns insufficient_evidence when evidence count is low and first attempt', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Brief')],
      gapFindings: [],
      // No existing mastery — first attempt, one piece of evidence
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('insufficient_evidence');
  });

  it('recent severe misconception overrides older understood', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Some correct part')],
      gapFindings: [makeGap({ gap_type: 'misconception', severity: 'significant', description: 'Wrong' })],
      existingMastery: existingMastery('understood', { evidenceCount: 10, attemptsCount: 5 }),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('misconception');
  });

  it('strong correction can improve old misconception only when no severe gaps', () => {
    const input = makeInput({
      coveredWell: [
        groundedEvidence('Correct definition'),
        groundedEvidence('Correct usage'),
        groundedEvidence('Correct example'),
      ],
      gapFindings: [],
      existingMastery: existingMastery('misconception', { evidenceCount: 3, attemptsCount: 2 }),
    });
    const { newMastery } = calculateMastery(input);
    expect(newMastery.state).toBe('understood');
  });

  it('strong correction cannot improve misconception when no grounded coverage', () => {
    const input = makeInput({
      coveredWell: [],
      gapFindings: [],
      existingMastery: existingMastery('misconception', { evidenceCount: 3, attemptsCount: 2 }),
    });
    const { newMastery } = calculateMastery(input);
    // With no new evidence and existing misconception, should stay misconception
    expect(newMastery.state).toBe('misconception');
  });

  it('ungrounded positive coverage is ignored', () => {
    // Only ungrounded coverage, no gaps — should not become "understood"
    const input = makeInput({
      coveredWell: [
        ungroundedEvidence('Ungrounded praise 1'),
        ungroundedEvidence('Ungrounded praise 2'),
        ungroundedEvidence('Ungrounded praise 3'),
      ],
      gapFindings: [],
      existingMastery: existingMastery('partial'),
    });
    const { newMastery } = calculateMastery(input);
    // No grounded coverage => insufficient evidence or the existing state won't improve to understood
    expect(newMastery.state).not.toBe('understood');
  });

  it('repeated mastery update with same data produces same signals', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Correct')],
      gapFindings: [makeGap()],
      existingMastery: existingMastery('partial'),
    });
    const result1 = calculateMastery(input);
    const result2 = calculateMastery(input);
    expect(result1.newMastery.state).toBe(result2.newMastery.state);
    expect(result1.newSignals.length).toBe(result2.newSignals.length);
  });

  it('signals include real gap IDs, not fake ones', () => {
    const input = makeInput({
      coveredWell: [],
      gapFindings: [makeGap({ id: 'real-uuid-123' })],
      existingMastery: existingMastery('partial'),
    });
    const { newSignals } = calculateMastery(input);
    const gapSignal = newSignals.find(s => s.signalType !== 'positive_coverage');
    expect(gapSignal?.gapFindingIds).toEqual(['real-uuid-123']);
  });

  it('positive signals include sourceChunkIds from grounded evidence', () => {
    const input = makeInput({
      coveredWell: [groundedEvidence('Good', ['chunk-abc', 'chunk-def'])],
      gapFindings: [],
      existingMastery: existingMastery('partial'),
    });
    const { newSignals } = calculateMastery(input);
    const posSignal = newSignals.find(s => s.signalType === 'positive_coverage');
    expect(posSignal?.sourceChunkIds).toEqual(['chunk-abc', 'chunk-def']);
  });

  it('uses real sourceExplanationId, not "latest"', () => {
    const input = makeInput({
      sourceExplanationId: 'real-explanation-uuid',
      coveredWell: [groundedEvidence('Good')],
      gapFindings: [],
      existingMastery: existingMastery('partial'),
    });
    const { newSignals } = calculateMastery(input);
    newSignals.forEach(sig => {
      expect(sig.sourceExplanationId).toBe('real-explanation-uuid');
    });
  });
});
