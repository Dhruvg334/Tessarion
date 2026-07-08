import { describe, it, expect } from 'vitest';
import { calculateReviewRecommendation } from './calculate-review';
import { ConceptMastery, MasteryState } from '../mastery/types';

describe('calculateReviewRecommendation', () => {
  const createMockMastery = (state: MasteryState): ConceptMastery => ({
    workspaceId: 'ws-1',
    userId: 'user-1',
    conceptId: 'concept-1',
    state,
    score: 0,
    confidenceScore: 0.9,
    evidenceCount: 1,
    attemptsCount: 1,
    lastAssessedAt: null,
    strongestGaps: [],
    coveredSignals: [],
    recommendationLabel: '',
    explanation: ''
  });

  const fixedNow = new Date('2026-07-08T12:00:00Z');

  it('handles unassessed concepts by not scheduling', () => {
    const mastery = createMockMastery('unassessed');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBeNull();
    expect(rec.suggestedReviewAt).toBeNull();
  });

  it('handles insufficient_evidence by not scheduling', () => {
    const mastery = createMockMastery('insufficient_evidence');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBeNull();
    expect(rec.suggestedReviewAt).toBeNull();
  });

  it('schedules critical priority for misconception', () => {
    const mastery = createMockMastery('misconception');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('critical');
    expect(rec.reasonType).toBe('misconception');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 1);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('schedules high priority for needs_review', () => {
    const mastery = createMockMastery('needs_review');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('high');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 1);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('schedules medium priority for weak_connection', () => {
    const mastery = createMockMastery('weak_connection');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('medium');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 2);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('schedules medium priority for partial', () => {
    const mastery = createMockMastery('partial');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('medium');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 3);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('schedules medium priority for emerging', () => {
    const mastery = createMockMastery('emerging');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('medium');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 2);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });

  it('schedules low priority for understood', () => {
    const mastery = createMockMastery('understood');
    const rec = calculateReviewRecommendation(mastery, fixedNow);
    expect(rec.priority).toBe('low');
    
    const expectedDate = new Date(fixedNow);
    expectedDate.setDate(expectedDate.getDate() + 7);
    expect(rec.suggestedReviewAt?.toISOString()).toBe(expectedDate.toISOString());
  });
});
