import { GapFindingOutput } from '../types';
import { detectGapsLocal, LocalGapDetectionOptions } from './local-gap-detection';
import { AppError } from '@/lib/errors/app-error';

export interface GapDetectionOptions extends LocalGapDetectionOptions {
  provider: 'local' | 'gemini';
}

export async function detectGaps(options: GapDetectionOptions): Promise<GapFindingOutput[]> {
  if (options.provider === 'local') {
    return detectGapsLocal(options);
  }

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new AppError('AI provider is not configured', 500, 'PROVIDER_NOT_CONFIGURED');
    }
    return detectGapsLocal(options); 
  } catch (e: unknown) {
    if (e instanceof AppError) throw e;
    return detectGapsLocal(options);
  }
}
