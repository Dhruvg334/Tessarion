import { createHash } from 'node:crypto';
import { AppError } from '@/lib/errors/app-error';
import { PromptDefinition, PromptStatus, ResolvedPrompt } from './types';

const registry = new Map<string, PromptDefinition<unknown, unknown>>();

function key(id: string, version: string): string {
  return `${id}@${version}`;
}

function hashPrompt(definition: PromptDefinition<unknown, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify({
      id: definition.id,
      version: definition.version,
      task: definition.task,
      system: definition.system,
      generationPolicy: definition.generationPolicy,
      providerPolicy: definition.providerPolicy,
      prohibitedBehaviors: definition.prohibitedBehaviors,
    }))
    .digest('hex');
}

export function registerPrompt<TInput, TOutput>(definition: PromptDefinition<TInput, TOutput>): void {
  const promptKey = key(definition.id, definition.version);
  if (registry.has(promptKey)) {
    throw new AppError(`Prompt already registered: ${promptKey}`, 500, 'PROMPT_ALREADY_REGISTERED');
  }
  registry.set(promptKey, definition as PromptDefinition<unknown, unknown>);
}

export function resolvePrompt<TInput, TOutput>(id: string, version?: string): ResolvedPrompt<TInput, TOutput> {
  let definition: PromptDefinition<unknown, unknown> | undefined;
  let promptKey = '';

  if (version) {
    promptKey = key(id, version);
    definition = registry.get(promptKey);
  } else {
    const candidates = [...registry.entries()]
      .filter(([, item]) => item.id === id && item.status === 'production')
      .sort((a, b) => b[1].version.localeCompare(a[1].version, undefined, { numeric: true }));
    [promptKey, definition] = candidates[0] ?? [];
  }

  if (!definition) {
    throw new AppError(`Prompt not found: ${id}${version ? `@${version}` : ''}`, 404, 'PROMPT_NOT_FOUND');
  }

  return {
    definition: definition as PromptDefinition<TInput, TOutput>,
    promptKey,
    contentHash: hashPrompt(definition),
  };
}

export function listPrompts(status?: PromptStatus): Array<{ key: string; definition: PromptDefinition<unknown, unknown>; contentHash: string }> {
  return [...registry.entries()]
    .filter(([, definition]) => !status || definition.status === status)
    .map(([promptKey, definition]) => ({ key: promptKey, definition, contentHash: hashPrompt(definition) }));
}

export function clearPromptRegistryForTests(): void {
  registry.clear();
}
