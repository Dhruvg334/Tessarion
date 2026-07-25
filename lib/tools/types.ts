import { z, ZodType } from 'zod';

export const ToolAccessSchema = z.enum(['read', 'write']);
export type ToolAccess = z.infer<typeof ToolAccessSchema>;

export interface ToolExecutionContext {
  workspaceId: string;
  userId: string;
  requestId: string;
  traceId: string;
  signal?: AbortSignal;
}

export interface ToolDefinition<TInput, TOutput> {
  name: string;
  description: string;
  access: ToolAccess;
  inputSchema: ZodType<TInput>;
  outputSchema: ZodType<TOutput>;
  timeoutMs: number;
  maxRetries: number;
  idempotent: boolean;
  mcpExposure: 'none' | 'read_only' | 'approved_write';
  sensitiveOutputFields: readonly string[];
  execute: (input: TInput, context: ToolExecutionContext) => Promise<TOutput>;
}

export const ToolFailureSchema = z.object({
  toolName: z.string(),
  code: z.string(),
  safeMessage: z.string(),
  retryable: z.boolean(),
});
export type ToolFailure = z.infer<typeof ToolFailureSchema>;
