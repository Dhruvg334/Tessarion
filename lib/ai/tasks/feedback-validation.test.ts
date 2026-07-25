import { describe, expect, it } from 'vitest';
import { validateTeachBackFeedback } from './feedback-validation';

const conceptId = '77777777-7777-4777-8777-777777777777';

describe('validateTeachBackFeedback', () => {
  it('accepts a gap grounded to a related concept when no source chunk exists', () => {
    expect(() =>
      validateTeachBackFeedback({
        coveredWell: [],
        gaps: [
          {
            gapType: 'shallow_explanation',
            description: 'The explanation is too brief.',
            severity: 'moderate',
            sourceEvidence: 'A stack is a last-in, first-out collection.',
            sourceChunkIds: [],
            relatedConceptId: conceptId,
            confidenceScore: 0.8,
            groundingStatus: 'verified',
            extractionMethod: 'local_deterministic',
          },
        ],
        unsupportedClaims: [],
        followUpQuestion: null,
        evidenceUsed: [],
      })
    ).not.toThrow();
  });

  it('rejects an unreferenced non-unsupported gap', () => {
    expect(() =>
      validateTeachBackFeedback({
        coveredWell: [],
        gaps: [
          {
            gapType: 'shallow_explanation',
            description: 'The explanation is too brief.',
            severity: 'moderate',
            sourceEvidence: 'Definition text',
            sourceChunkIds: [],
            confidenceScore: 0.8,
            groundingStatus: 'verified',
            extractionMethod: 'local_deterministic',
          },
        ],
        unsupportedClaims: [],
        followUpQuestion: null,
        evidenceUsed: [],
      })
    ).toThrow(/sourceChunkIds or relatedConceptId/);
  });
});
