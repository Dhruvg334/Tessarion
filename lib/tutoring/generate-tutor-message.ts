import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { TutoringDecision, TutoringSession, TutoringTurn } from './types';

export interface GenerateTutorMessageParams {
  session: TutoringSession;
  decision: TutoringDecision;
  previousTurns: TutoringTurn[];
  sourceChunksText: string;
}

/**
 * Generates the phrasing for the tutor message using an AI model.
 * STRICTLY bound by the deterministic `TutoringDecision`.
 */
export async function generateTutorMessage(params: GenerateTutorMessageParams): Promise<string> {
  // Offline/CI safe fallback
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test' || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return params.decision.question;
  }

  const { session, decision, previousTurns, sourceChunksText } = params;

  // If the decision is to complete the session, we can just use the deterministic message
  if (decision.shouldCompleteSession) {
    return decision.question;
  }

  const systemPrompt = `
You are Tessarion, an expert Socratic tutor.
Your goal is to guide the student to correct their understanding.

STRICT INSTRUCTIONS:
1. You MUST make EXACTLY ONE pedagogical move: ${decision.nextMove}.
2. You MUST ask EXACTLY ONE question. Do not ask multiple questions.
3. Keep your response brief (1-2 sentences maximum).
4. DO NOT give the full answer immediately, UNLESS the move is 'ask_correction'.
5. Base your question ONLY on the provided Source Material. Do not invent facts.
6. If the source material does not contain the answer, state that honestly and ask them to rely only on the source.

CURRENT CONTEXT:
Focus Area: ${session.focusType} (${session.focusSummary})
Allowed Move: ${decision.nextMove}
Provided Deterministic Fallback Question: "${decision.question}"

SOURCE MATERIAL:
${sourceChunksText || 'No source material provided.'}
  `.trim();

  const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
    { role: 'system', content: systemPrompt }
  ];

  // Provide limited context of the last few turns
  const recentTurns = previousTurns.slice(-4);
  for (const turn of recentTurns) {
    if (turn.role === 'student' || turn.role === 'tutor') {
      messages.push({
        role: turn.role === 'tutor' ? 'assistant' : 'user',
        content: turn.content
      });
    }
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages,
      temperature: 0.2, // Low temperature for consistent adherence to policy
    });

    const result = text.trim();
    
    // Guardrail 1: One-question rule
    const questionMarks = (result.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      console.warn('AI Output rejected: Multiple questions detected. Falling back to deterministic.', result);
      return decision.question;
    }

    // Guardrail 2: Long lecture check
    if (result.split(/\s+/).length > 80) {
      console.warn('AI Output rejected: Response too long. Falling back to deterministic.', result);
      return decision.question;
    }

    // Guardrail 3: No full answer early
    // Very rudimentary check: If not ask_correction or summarize, and sounds like giving the answer
    if (decision.nextMove !== 'ask_correction' && decision.nextMove !== 'summarize_progress' && decision.nextMove !== 'complete_session') {
      const lower = result.toLowerCase();
      if (lower.includes('the correct answer is') || lower.includes('actually, it is')) {
         console.warn('AI Output rejected: Full answer pattern detected early. Falling back.', result);
         return decision.question;
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to generate tutor message via AI, falling back to deterministic:', error);
    return decision.question;
  }
}
