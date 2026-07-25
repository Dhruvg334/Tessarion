# Prompt System

Production prompts in Tessarion are versioned code artifacts governed by a strict registry.

## TypeScript Interfaces

Every prompt in `lib/prompts/` must implement the `PromptDefinition` interface.

```typescript
import { z } from 'zod';

export interface PromptDefinition<TInput extends z.ZodType, TOutput extends z.ZodType> {
  id: string; // e.g., 'concept-extraction'
  version: string; // Semantic version e.g., '1.2.0'
  purpose: string;
  taskCategory: 'classification' | 'generation' | 'extraction' | 'routing';
  
  // The actual instruction string. Variables must be explicit.
  systemPrompt: (input: z.infer<TInput>) => string;
  
  inputSchema: TInput;
  outputSchema: TOutput;
  
  modelRequirements: {
    supportedProviders: string[]; // e.g., ['google', 'anthropic']
    minimumContextWindow: number;
    recommendedModel: string;
  };
  
  executionPolicy: {
    maxTokens: number;
    temperature: number;
    timeoutMs: number;
    retryCount: number;
  };
  
  examples: Array<{ input: z.infer<TInput>; output: z.infer<TOutput> }>;
}
```

## Lifecycle Contracts

### 1. Selection & Pinning
Workflows do not call raw strings. They import the registry and fetch a prompt by ID and pinned version:
`const prompt = PromptRegistry.get('concept-extraction', '1.2.0');`

### 2. Hashing & Tracing
Upon execution, the prompt's `id`, `version`, and a SHA-256 hash of the final compiled `systemPrompt` string are emitted to the OpenTelemetry trace to guarantee absolute reproducibility.

### 3. Injection Protection
All user-supplied content injected into the `systemPrompt` must be safely bounded using strict XML tags (e.g., `<user_input>{text}</user_input>`). The system instructs models to treat content within these tags purely as data, not instructions.

### 4. Promotion & Rollback
- **Candidate Phase:** A developer creates `v1.3.0`.
- **Evaluation:** The candidate is run offline against the `eval/` suites.
- **Promotion:** If it passes the regression gate, the import in the LangGraph node is updated to `1.3.0` and merged via PR.
- **Rollback:** Reverting the PR instantly rolls back the workflow to `1.2.0`.

### 5. Deprecation
Old prompts are kept in the registry for historical trace reproducibility but are marked `deprecated: true`.

### 6. Migration of Existing Prompts
All existing inline string literals in `lib/tutoring/*` and `lib/ai/tasks/*` must be extracted, wrapped in the `PromptDefinition` interface, assigned `v1.0.0`, and placed into `lib/prompts/`.
