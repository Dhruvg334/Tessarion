import { AppError } from '@/lib/errors/app-error';

export function assertNoExternalProviderInCI(providerId: string) {
  if (process.env.CI === 'true') {
    if (providerId !== 'local') {
      throw new AppError(`External provider '${providerId}' is forbidden in CI environment`, 403);
    }
  }
}

export function assertLocalEvalMode() {
  if (process.env.TESSARION_EVAL_MODE === 'local') {
    if (process.env.TESSARION_AI_PROVIDER && process.env.TESSARION_AI_PROVIDER !== 'local') {
      throw new Error(`Eval mode requires local provider, but found: ${process.env.TESSARION_AI_PROVIDER}`);
    }
  }
}
