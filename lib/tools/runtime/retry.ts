import { AppError } from '@/lib/errors/app-error';
import { executeTool, getTool } from '@/lib/tools/registry';
import type { ToolExecutionContext } from '@/lib/tools/types';

export interface ToolAttemptRecord {
  attempt: number;
  startedAt: string;
  endedAt: string;
  status: 'succeeded' | 'failed';
  safeErrorCode: string | null;
}

export interface RetryingToolResult<T> {
  output: T;
  attempts: ToolAttemptRecord[];
}

export interface RetryingToolOptions {
  baseDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function retryable(error: unknown): boolean {
  return error instanceof AppError && ['TOOL_TIMEOUT', 'TOOL_EXECUTION_FAILED'].includes(error.code);
}

export async function executeToolWithRetry<TInput, TOutput>(
  name: string,
  input: TInput,
  context: ToolExecutionContext,
  options: RetryingToolOptions = {}
): Promise<RetryingToolResult<TOutput>> {
  const definition = getTool<TInput, TOutput>(name);
  const attempts: ToolAttemptRecord[] = [];
  const sleep = options.sleep ?? defaultSleep;
  const baseDelayMs = options.baseDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 1_000;

  for (let attempt = 0; attempt <= definition.maxRetries; attempt += 1) {
    const startedAt = new Date().toISOString();
    try {
      const output = await executeTool<TInput, TOutput>(name, input, context);
      attempts.push({ attempt: attempt + 1, startedAt, endedAt: new Date().toISOString(), status: 'succeeded', safeErrorCode: null });
      return { output, attempts };
    } catch (error) {
      const safeErrorCode = error instanceof AppError ? error.code : 'TOOL_EXECUTION_FAILED';
      attempts.push({ attempt: attempt + 1, startedAt, endedAt: new Date().toISOString(), status: 'failed', safeErrorCode });
      if (attempt >= definition.maxRetries || !definition.idempotent || !retryable(error)) throw error;
      await sleep(Math.min(maxDelayMs, baseDelayMs * 2 ** attempt));
    }
  }

  throw new AppError('Tool retry policy exhausted', 500, 'TOOL_RETRY_EXHAUSTED');
}
