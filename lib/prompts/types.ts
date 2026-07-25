import { z, ZodType } from 'zod';

export const PromptStatusSchema = z.enum(['candidate', 'production', 'deprecated']);
export type PromptStatus = z.infer<typeof PromptStatusSchema>;

export const PromptTaskSchema = z.enum([
  'concept_extraction',
  'relationship_classification',
  'teach_back_analysis',
  'gap_detection',
  'grounding_validation',
  'socratic_tutor',
  'retrieval_routing',
  'graph_validation',
  'evidence_compression',
]);
export type PromptTask = z.infer<typeof PromptTaskSchema>;

export interface PromptGenerationPolicy {
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
  maxRetries: number;
}

export interface PromptProviderPolicy {
  allowedProviderIds: readonly string[];
  preferredProviderId?: string;
  allowLocalFallback: boolean;
}

export interface PromptDefinition<TInput, TOutput> {
  id: string;
  version: `${number}.${number}.${number}`;
  task: PromptTask;
  status: PromptStatus;
  purpose: string;
  system: string;
  inputSchema: ZodType<TInput>;
  outputSchema: ZodType<TOutput>;
  providerPolicy: PromptProviderPolicy;
  generationPolicy: PromptGenerationPolicy;
  prohibitedBehaviors: readonly string[];
  evaluationSuite: string;
  changelog: readonly string[];
}

export interface ResolvedPrompt<TInput, TOutput> {
  definition: PromptDefinition<TInput, TOutput>;
  promptKey: string;
  contentHash: string;
}
