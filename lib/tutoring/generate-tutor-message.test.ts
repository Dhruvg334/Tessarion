import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTutorMessage } from './generate-tutor-message';
import { TutoringSession } from './types';

vi.mock('ai', () => ({
  generateText: vi.fn()
}));

import { generateText } from 'ai';

type GenerateTextMock = {
  mockResolvedValueOnce: (value: { text: string }) => GenerateTextMock;
  mockReset: () => void;
};

const mockedGenerateText = generateText as unknown as GenerateTextMock;

describe('generateTutorMessage guardrails', () => {
  const baseSession: TutoringSession = {
    id: 's1',
    workspaceId: 'w1',
    userId: 'u1',
    conceptId: 'c1',
    focusType: 'misconception',
    focusSummary: 'test',
    status: 'active',
    currentTurnCount: 0,
    maxTurns: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    mockedGenerateText.mockReset();
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test-key');
    vi.stubEnv('CI', 'false');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects multiple questions and falls back to deterministic text', async () => {
    mockedGenerateText.mockResolvedValueOnce({ text: 'What is this? And why did you do that?' });

    const result = await generateTutorMessage({
      session: baseSession,
      decision: {
        nextMove: 'ask_contrast_question',
        question: 'Fallback question?',
        sourceChunkIds: [],
        gapFindingIds: [],
        shouldUpdateMastery: false,
        shouldCompleteSession: false,
        reason: '',
        confidenceScore: 1
      },
      previousTurns: [],
      sourceChunksText: ''
    });

    expect(result).toBe('Fallback question?');
  });

  it('rejects early full answers and falls back to deterministic text', async () => {
    mockedGenerateText.mockResolvedValueOnce({ text: 'The correct answer is binary search. What do you think?' });

    const result = await generateTutorMessage({
      session: baseSession,
      decision: {
        nextMove: 'ask_evidence_question',
        question: 'Fallback question?',
        sourceChunkIds: [],
        gapFindingIds: [],
        shouldUpdateMastery: false,
        shouldCompleteSession: false,
        reason: '',
        confidenceScore: 1
      },
      previousTurns: [],
      sourceChunksText: ''
    });

    expect(result).toBe('Fallback question?');
  });
});
