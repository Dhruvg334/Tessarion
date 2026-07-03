import { createServiceClient } from '@/lib/supabase/service';
import { AgentRunSummary } from '../ai/types';

export interface WorkflowTraceContext {
  workspaceId: string;
  userId: string;
  agentName: string;
  runId: string;
  startTime: number;
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
  };
}

export async function updateTraceState(
  trace: WorkflowTraceContext,
  state: string
) {
  const supabase = createServiceClient();
  await supabase.from('agent_runs').update({
    action: state,
  }).eq('id', trace.runId);
}

export async function completeTrace(
  trace: WorkflowTraceContext,
  status: 'success' | 'partial' | 'failed',
  summary: AgentRunSummary,
  fallbackUsed: boolean,
  errorMessage?: string
) {
  const supabase = createServiceClient();
  const latency = Date.now() - trace.startTime;

  await supabase.from('agent_runs').update({
    action: 'completed',
    status,
    output_summary: summary as unknown as Record<string, unknown>,
    fallback_used: fallbackUsed,
    latency_ms: latency,
    completed_at: new Date().toISOString(),
    error_message: errorMessage || null,
  }).eq('id', trace.runId);
}
