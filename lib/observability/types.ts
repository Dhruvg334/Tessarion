export type OperationalEventType =
  | 'workspace_created'
  | 'source_added'
  | 'source_chunked'
  | 'concept_extraction_started'
  | 'concept_extraction_completed'
  | 'concept_extraction_failed'
  | 'retrieval_requested'
  | 'teach_back_started'
  | 'teach_back_submitted'
  | 'teach_back_feedback_generated'
  | 'mastery_updated'
  | 'review_scheduled'
  | 'review_completed'
  | 'review_skipped'
  | 'tutoring_started'
  | 'tutoring_turn_submitted'
  | 'tutoring_completed'
  | 'tutoring_abandoned'
  | 'provider_call_started'
  | 'provider_call_failed'
  | 'rate_limit_exceeded'
  | 'validation_failed'
  | 'api_error';

export type OperationalSeverity = 'info' | 'warning' | 'error';

export interface OperationalEvent {
  id: string;
  workspaceId: string;
  userId: string;
  eventType: OperationalEventType;
  severity: OperationalSeverity;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  traceId?: string;
  safeMessage: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
