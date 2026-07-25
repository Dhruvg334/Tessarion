import { registerCoreTools } from './core-tools';

let initialized = false;

export function initializeToolRegistry(): void {
  if (initialized) return;
  registerCoreTools();
  initialized = true;
}

export * from './types';
export * from './registry';
