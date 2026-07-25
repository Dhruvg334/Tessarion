import { z } from 'zod';

export const TraceSpanKindSchema = z.enum([
  'request',
  'workflow',
  'node',
  'model',
  'tool',
  'retrieval',
  'graph',
  'validation',
  'persistence',
]);

export const TraceStatusSchema = z.enum(['ok', 'error', 'unset']);

export const SafeTraceSpanSchema = z.object({
  traceId: z.string().uuid(),
  spanId: z.string().uuid(),
  parentSpanId: z.string().uuid().nullable(),
  kind: TraceSpanKindSchema,
  name: z.string().min(1).max(160),
  status: TraceStatusSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  durationMs: z.number().int().min(0).nullable(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  requestId: z.string().uuid(),
  workflowName: z.string().max(100).nullable(),
  workflowVersion: z.string().max(40).nullable(),
  nodeName: z.string().max(100).nullable(),
  promptId: z.string().max(100).nullable(),
  promptVersion: z.string().max(40).nullable(),
  promptHash: z.string().length(64).nullable(),
  providerId: z.string().max(80).nullable(),
  modelId: z.string().max(120).nullable(),
  toolName: z.string().max(100).nullable(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  safeErrorCode: z.string().max(100).nullable(),
});

export type SafeTraceSpan = z.infer<typeof SafeTraceSpanSchema>;

export function createTraceSpan(input: Omit<SafeTraceSpan, 'spanId' | 'startedAt' | 'endedAt' | 'durationMs' | 'status'>): SafeTraceSpan {
  return SafeTraceSpanSchema.parse({
    ...input,
    spanId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMs: null,
    status: 'unset',
  });
}
