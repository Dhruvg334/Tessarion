import { createServiceClient } from '@/lib/supabase/service';
import { getInfrastructureConfig } from '@/lib/infrastructure/config';
import { OtlpHttpTraceExporter } from '@/lib/observability/exporters/otlp-http';
import type { SafeTraceSpan } from '@/lib/observability/trace-model';

export interface WorkflowTraceContext {
  workspaceId: string;
  userId: string;
  agentName: string;
  runId: string;
  startTime: number;
  steps: Array<{ state: string; status: string; timestamp: string }>;
}

export async function createTrace(
  workspaceId: string,
  userId: string,
  agentName: string
): Promise<WorkflowTraceContext> {
  const runId = crypto.randomUUID();
  const supabase = createServiceClient();
  
  await supabase.from('agent_runs').insert({
    id: runId,
    workspace_id: workspaceId,
    agent_name: agentName,
    action: 'started',
    status: 'success',
    started_at: new Date().toISOString(),
    input_summary: { userId },
    output_summary: {},
    fallback_used: false,
  });

  return {
    workspaceId,
    userId,
    agentName,
    runId,
    startTime: Date.now(),
    steps: [{ state: 'started', status: 'completed', timestamp: new Date().toISOString() }],
  };
}

export async function updateTraceState(
  trace: WorkflowTraceContext,
  state: string
) {
  trace.steps.push({ state, status: 'completed', timestamp: new Date().toISOString() });
  const supabase = createServiceClient();
  await supabase.from('agent_runs').update({
    action: state,
    output_summary: { steps: trace.steps } as unknown as Record<string, unknown>,
  }).eq('id', trace.runId);
}

export async function completeTrace<T extends object>(
  trace: WorkflowTraceContext,
  status: 'success' | 'partial' | 'failed',
  summary: T,
  fallbackUsed: boolean,
  errorMessage?: string
) {
  const supabase = createServiceClient();
  const latency = Date.now() - trace.startTime;

  await supabase.from('agent_runs').update({
    action: 'completed',
    status,
    output_summary: { ...summary, steps: trace.steps } as unknown as Record<string, unknown>,
    fallback_used: fallbackUsed,
    latency_ms: latency,
    completed_at: new Date().toISOString(),
    error_message: errorMessage || null,
  }).eq('id', trace.runId);

  await exportCompletedTrace(trace, status, latency, fallbackUsed, errorMessage);
}

async function exportCompletedTrace(
  trace: WorkflowTraceContext,
  status: 'success' | 'partial' | 'failed',
  latency: number,
  fallbackUsed: boolean,
  errorMessage?: string,
): Promise<void> {
  const config = getInfrastructureConfig();
  if (!config.arize || !isUuid(trace.workspaceId) || !isUuid(trace.userId) || !isUuid(trace.runId)) return;

  const completedAt = new Date().toISOString();
  const rootSpanId = crypto.randomUUID();
  const root: SafeTraceSpan = {
    traceId: trace.runId,
    spanId: rootSpanId,
    parentSpanId: null,
    kind: 'workflow',
    name: trace.agentName,
    status: status === 'failed' ? 'error' : 'ok',
    startedAt: new Date(trace.startTime).toISOString(),
    endedAt: completedAt,
    durationMs: latency,
    workspaceId: trace.workspaceId,
    userId: trace.userId,
    requestId: trace.runId,
    workflowName: trace.agentName,
    workflowVersion: '1.0.0',
    nodeName: null,
    promptId: null,
    promptVersion: null,
    promptHash: null,
    providerId: null,
    modelId: null,
    toolName: null,
    attributes: {
      'openinference.span.kind': 'CHAIN',
      'tessarion.fallback_used': fallbackUsed,
      'tessarion.result': status,
    },
    safeErrorCode: errorMessage ? 'AGENT_RUN_FAILED' : null,
  };

  const steps: SafeTraceSpan[] = trace.steps.map((step, index) => {
    const nextTimestamp = trace.steps[index + 1]?.timestamp ?? completedAt;
    const durationMs = Math.max(0, Date.parse(nextTimestamp) - Date.parse(step.timestamp));
    return {
      ...root,
      spanId: crypto.randomUUID(),
      parentSpanId: rootSpanId,
      kind: 'node',
      name: `${trace.agentName}.${step.state}`,
      status: step.status === 'failed' ? 'error' : 'ok',
      startedAt: step.timestamp,
      endedAt: nextTimestamp,
      durationMs,
      nodeName: step.state,
      attributes: {
        'openinference.span.kind': 'CHAIN',
        'tessarion.step.index': index,
        'tessarion.step.status': step.status,
      },
      safeErrorCode: step.status === 'failed' ? 'AGENT_STEP_FAILED' : null,
    };
  });

  const exporter = new OtlpHttpTraceExporter({
    endpoint: config.arize.endpoint,
    headers: {
      'arize-space-id': config.arize.spaceId,
      'arize-api-key': config.arize.apiKey,
    },
    serviceName: config.arize.serviceName,
    projectName: config.arize.projectName,
    timeoutMs: 3_000,
  });

  try {
    await exporter.export([root, ...steps]);
  } catch {
    // External tracing must never interrupt the learner workflow.
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
