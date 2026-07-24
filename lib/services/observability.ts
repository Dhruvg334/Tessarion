import { createServiceClient } from '@/lib/supabase/service';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OperationalEvent, OperationalEventType, OperationalSeverity } from '@/lib/observability/types';
import { safeTraceMetadata } from '@/lib/observability/request-context';
import { AppError } from '@/lib/errors/app-error';

export interface RecordEventParams {
  workspaceId: string;
  userId: string;
  eventType: OperationalEventType;
  severity?: OperationalSeverity;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  traceId?: string;
  safeMessage: string;
  metadata?: Record<string, unknown>;
  strict?: boolean;
}

const MAX_METADATA_SIZE = 5000;

interface OperationalEventRow {
  id: string;
  workspace_id: string;
  user_id: string;
  event_type: OperationalEventType;
  severity: OperationalSeverity;
  entity_type: string | null;
  entity_id: string | null;
  request_id: string | null;
  trace_id: string | null;
  safe_message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function truncateMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const str = JSON.stringify(metadata);
  if (str.length <= MAX_METADATA_SIZE) return metadata;
  return { _truncated: true, _original_size: str.length };
}

export async function recordOperationalEvent(params: RecordEventParams): Promise<void> {
  try {
    const supabase = createServiceClient();
    
    let sanitizedMetadata = safeTraceMetadata(params.metadata);
    sanitizedMetadata = truncateMetadata(sanitizedMetadata);

    const severity = params.severity || 'info';

    const { error } = await supabase.from('operational_events').insert({
      workspace_id: params.workspaceId,
      user_id: params.userId,
      event_type: params.eventType,
      severity,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      request_id: params.requestId || null,
      trace_id: params.traceId || null,
      safe_message: params.safeMessage.substring(0, 2000),
      metadata: sanitizedMetadata
    });

    if (error) {
      if (params.strict) {
        throw new AppError('Failed to record operational event', 500, 'DB_ERROR', error);
      }

      console.error('Failed to record operational event.');
    }
  } catch (err) {
    if (params.strict) {
      throw err instanceof AppError ? err : new AppError('Failed to record operational event', 500, 'INTERNAL_ERROR', err);
    }
    console.error('Failed to record operational event.');
  }
}

export async function listWorkspaceOperationalEvents(workspaceId: string, userId: string, limit = 50): Promise<OperationalEvent[]> {
  const supabase = await createServerSupabaseClient();
  
  // RLS will enforce that the user can only see their own workspace events
  const { data, error } = await supabase
    .from('operational_events')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new AppError('Failed to list operational events', 500, 'DB_ERROR', error);
  }

  return ((data || []) as OperationalEventRow[]).map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    eventType: row.event_type,
    severity: row.severity,
    entityType: row.entity_type || undefined,
    entityId: row.entity_id || undefined,
    requestId: row.request_id || undefined,
    traceId: row.trace_id || undefined,
    safeMessage: row.safe_message,
    metadata: row.metadata || {},
    createdAt: row.created_at
  }));
}
