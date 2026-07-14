/**
 * Tessarion - Application Domain Types
 * These are application-level types representing the core entities.
 * Note: Once the Supabase generated types are added, these may be replaced or mapped.
 */

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceDocument {
  id: string;
  workspace_id: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  input_type: 'upload' | 'paste' | null;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed' | 'partial' | null;
  processing_steps: Record<string, unknown>;
  error_message: string | null;
  chunk_count: number;
  uploaded_at: string;
  processed_at: string | null;
}

export interface SourceChunk {
  id: string;
  source_document_id: string;
  workspace_id: string;
  content: string;
  chunk_index: number;
  token_count: number | null;
  section_hint: string | null;
  char_start: number | null;
  char_end: number | null;
  embedding: number[] | null;
  created_at: string;
}

export interface ConceptNode {
  id: string;
  workspace_id: string;
  name: string;
  definition: string | null;
  source_chunk_ids: string[];
  mastery_level: 'untested' | 'weak' | 'developing' | 'strong' | 'mastered' | null;
  mastery_score: number;
  blooms_level_achieved: number | null;
  last_teach_back_at: string | null;
  next_review_at: string | null;
  teach_back_count: number;
  gap_count: number;
  confidence_score: number | null;
  cluster_label: string | null;
  dependency_depth: number | null;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptEdge {
  id: string;
  workspace_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: 'prerequisite' | 'related' | 'contrasts' | 'causal' | null;
  strength: number | null;
  description: string | null;
  source_chunk_ids: string[];
  confidence_score: number | null;
  created_at: string;
}

export interface TeachBackSession {
  id: string;
  workspace_id: string;
  concept_node_id: string;
  status: 'in_progress' | 'completed' | 'abandoned' | null;
  metacognition_prediction: number | null;
  blooms_level_achieved: number | null;
  coverage_score: number | null;
  overall_score: number | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentExplanation {
  id: string;
  session_id: string;
  content: string;
  sequence_index: number;
  word_count: number | null;
  submitted_at: string;
}

export interface GapFinding {
  id: string;
  session_id: string;
  gap_type: 'missing_concept' | 'misconception' | 'weak_connection' | 'shallow_explanation' | 'missing_prerequisite' | 'unsupported_claim' | null;
  description: string;
  severity: 'minor' | 'moderate' | 'significant' | null;
  source_evidence: string | null;
  source_chunk_ids: string[];
  related_concept_id: string | null;
  confidence_score: number | null;
  dismissed_by_student: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface SocraticQuestion {
  id: string;
  session_id: string;
  question_text: string;
  target_gap_id: string | null;
  blooms_level: number | null;
  reasoning: string | null;
  sequence_index: number | null;
  created_at: string;
}

export interface MasterySignal {
  id: string;
  workspace_id: string;
  concept_id: string;
  user_id: string;
  source_session_id: string;
  source_explanation_id: string | null;
  signal_type: string;
  strength: number | null;
  confidence_score: number | null;
  evidence: string | null;
  source_chunk_ids: string[];
  gap_finding_ids: string[];
  created_at: string;
}

export interface MasteryRecord {
  id: string;
  concept_node_id: string;
  mastery_score: number;
  mastery_level: 'unassessed' | 'insufficient_evidence' | 'emerging' | 'partial' | 'understood' | 'weak_connection' | 'misconception' | 'needs_review' | null;
  confidence_score: number | null;
  evidence_count: number;
  attempts_count: number;
  last_assessed_at: string | null;
  strongest_gaps: string[];
  recommendation_label: string | null;
  explanation: string | null;
  ease_factor: number | null;
  interval_days: number | null;
  trigger_type: 'teach_back' | 'review' | 'propagation' | 'manual' | null;
  trigger_session_id: string | null;
  recorded_at: string;
}

export interface ReviewSchedule {
  id: string;
  workspace_id: string;
  user_id: string;
  concept_node_id: string;
  mastery_record_id: string | null;
  status: 'not_ready' | 'queued' | 'due' | 'overdue' | 'completed' | 'skipped' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason_type: 'misconception' | 'needs_review' | 'weak_connection' | 'shallow_explanation' | 'missing_prerequisite' | 'insufficient_evidence' | 'scheduled_reinforcement' | 'new_concept' | 'repeated_failure' | 'improvement_check';
  reason: string;
  scheduled_for: string | null;
  completed_at: string | null;
  skipped_at: string | null;
  attempts_count: number;
  source_mastery_signal_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  workspace_id: string;
  session_id: string | null;
  agent_name: string;
  action: string;
  status: 'success' | 'partial' | 'failed' | null;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  model_used: string | null;
  token_usage: Record<string, unknown>;
  latency_ms: number | null;
  error_message: string | null;
  fallback_used: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  event_type: string;
  action_description: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface TutoringSession {
  id: string;
  workspace_id: string;
  user_id: string;
  concept_node_id: string;
  teach_back_session_id: string | null;
  review_schedule_id: string | null;
  focus_type: string;
  focus_summary: string;
  status: string;
  max_turns: number;
  current_turn_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TutoringTurn {
  id: string;
  tutoring_session_id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  turn_type: string;
  content: string;
  source_chunk_ids: string[];
  gap_finding_ids: string[];
  mastery_signal_ids: string[];
  tutor_move: string | null;
  created_at: string;
}
