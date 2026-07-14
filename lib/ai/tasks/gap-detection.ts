import { GapFindingOutput } from '../types';
import { detectGapsLocal, LocalGapDetectionOptions } from './local-gap-detection';

export interface GapDetectionOptions extends LocalGapDetectionOptions {
  provider: 'local' | 'gemini';
}

export async function detectGaps(options: GapDetectionOptions): Promise<GapFindingOutput[]> {
  if (options.provider === 'local') {
    return detectGapsLocal(options);
  }

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('No API key');
    }
    return detectGapsLocal(options); 
  } catch {
    return detectGapsLocal(options);
  }
}
