import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { TutoringDecision, TutoringSession, TutoringTurn } from './types';

export interface GenerateTutorMessageParams {
  session: TutoringSession;
  decision: TutoringDecision;
  previousTurns: TutoringTurn[];
  sourceChunksText: string;
}

export async function generateTutorMessage(params: GenerateTutorMessageParams): Promise<string> {
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test' || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return params.decision.question;
  }

  const { session, decision, previousTurns, sourceChunksText } = params;

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
      temperature: 0.2,
    });

    const result = text.trim();
    
    const questionMarks = (result.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      console.warn('Tutor generation rejected: multiple questions detected.', result);
      return decision.question;
    }

    if (result.split(/\s+/).length > 80) {
      console.warn('Tutor generation rejected: response too long.', result);
      return decision.question;
    }

    if (decision.nextMove !== 'ask_correction' && decision.nextMove !== 'summarize_progress' && decision.nextMove !== 'complete_session') {
      const lower = result.toLowerCase();
      if (lower.includes('the correct answer is') || lower.includes('actually, it is')) {
         console.warn('Tutor generation rejected: early answer pattern detected.', result);
         return decision.question;
      }
    }

    return result;
  } catch (error) {
    console.error('Tutor message generation failed; using deterministic fallback:', error);
    return decision.question;
  }
}
