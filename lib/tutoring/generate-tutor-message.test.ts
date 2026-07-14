import { describe, it, expect, vi } from 'vitest';
import { generateTutorMessage } from './generate-tutor-message';
import { TutoringSession } from './types';

// Mock generateText from 'ai'
vi.mock('ai', () => ({
  generateText: vi.fn()
}));

import { generateText } from 'ai';

describe('generateTutorMessage Guardrails', () => {
  const baseSession: TutoringSession = {
    id: 's1', workspaceId: 'w1', userId: 'u1', conceptId: 'c1',
    focusType: 'misconception', focusSummary: 'test', status: 'active',
    currentTurnCount: 0, maxTurns: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };

  it('rejects multiple questions and falls back to deterministic', async () => {
    (generateText as any).mockResolvedValueOnce({ text: 'What is this? And why did you do that?' });
    
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    // We override CI to allow AI block
    const originalCI = process.env.CI;
    process.env.CI = 'false';
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const result = await generateTutorMessage({
      session: baseSession,
      decision: { nextMove: 'ask_contrast_question', question: 'Fallback question?', sourceChunkIds: [], gapFindingIds: [], shouldUpdateMastery: false, shouldCompleteSession: false, reason: '', confidenceScore: 1 },
      previousTurns: [],
      sourceChunksText: ''
    });

    expect(result).toBe('Fallback question?');
    
    process.env.CI = originalCI;
    process.env.NODE_ENV = originalEnv;
  });

  it('rejects full answers early and falls back', async () => {
    (generateText as any).mockResolvedValueOnce({ text: 'The correct answer is binary search. What do you think?' });
    
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-key';
    const originalCI = process.env.CI;
    process.env.CI = 'false';
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const result = await generateTutorMessage({
      session: baseSession,
      decision: { nextMove: 'ask_evidence_question', question: 'Fallback question?', sourceChunkIds: [], gapFindingIds: [], shouldUpdateMastery: false, shouldCompleteSession: false, reason: '', confidenceScore: 1 },
      previousTurns: [],
      sourceChunksText: ''
    });

    expect(result).toBe('Fallback question?');

    process.env.CI = originalCI;
    process.env.NODE_ENV = originalEnv;
  });
});
