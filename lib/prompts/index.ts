import { registerPrompt } from './registry';
import { groundingValidationPromptV1 } from './definitions/grounding-validation.v1';

let initialized = false;

export function initializePromptRegistry(): void {
  if (initialized) return;
  registerPrompt(groundingValidationPromptV1);
  initialized = true;
}

export * from './types';
export * from './registry';
export * from './definitions/grounding-validation.v1';
