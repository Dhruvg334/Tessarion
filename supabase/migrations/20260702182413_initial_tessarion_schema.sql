-- Migration: 001_initial_tessarion_schema
-- Purpose: Create core tables, extensions, and RLS policies for Tessarion

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tables

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- workspaces
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  archived_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- source_documents
CREATE TABLE public.source_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name text,
  file_type text,
  file_size bigint,
  storage_path text,
  input_type text CHECK (input_type IN ('upload', 'paste')),
  processing_status text CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed', 'partial')),
  processing_steps jsonb DEFAULT '{}'::jsonb,
  error_message text,
  chunk_count integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT NOW(),
  processed_at timestamptz
);

-- source_chunks
CREATE TABLE public.source_chunks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_document_id uuid REFERENCES public.source_documents(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content text NOT NULL,
  chunk_index integer NOT NULL,
  token_count integer,
  section_hint text,
  char_start integer,
  char_end integer,
  embedding vector(768),
  created_at timestamptz DEFAULT NOW()
);

-- concept_nodes
CREATE TABLE public.concept_nodes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  definition text,
  source_chunk_ids uuid[] DEFAULT '{}',
  mastery_level text CHECK (mastery_level IN ('untested', 'weak', 'developing', 'strong', 'mastered')),
  mastery_score numeric DEFAULT 0,
  blooms_level_achieved integer,
  last_teach_back_at timestamptz,
  next_review_at timestamptz,
  teach_back_count integer DEFAULT 0,
  gap_count integer DEFAULT 0,
  confidence_score numeric,
  cluster_label text,
  dependency_depth integer,
  position_x numeric,
  position_y numeric,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- concept_edges
CREATE TABLE public.concept_edges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  source_node_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  target_node_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  relationship_type text CHECK (relationship_type IN ('prerequisite', 'related', 'contrasts', 'causal')),
  strength numeric,
  description text,
  source_chunk_ids uuid[] DEFAULT '{}',
  confidence_score numeric,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT concept_edges_no_self_loops CHECK (source_node_id != target_node_id)
);

-- teach_back_sessions
CREATE TABLE public.teach_back_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  concept_node_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  status text CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  metacognition_prediction integer,
  blooms_level_achieved integer,
  coverage_score numeric,
  overall_score numeric,
  started_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- student_explanations
CREATE TABLE public.student_explanations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  sequence_index integer NOT NULL,
  word_count integer,
  submitted_at timestamptz DEFAULT NOW()
);

-- gap_findings
CREATE TABLE public.gap_findings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE CASCADE,
  gap_type text CHECK (gap_type IN ('missing_concept', 'misconception', 'weak_connection', 'shallow_explanation', 'missing_prerequisite', 'unsupported_claim')),
  description text NOT NULL,
  severity text CHECK (severity IN ('minor', 'moderate', 'significant')),
  source_evidence text,
  source_chunk_ids uuid[] DEFAULT '{}',
  related_concept_id uuid REFERENCES public.concept_nodes(id) ON DELETE SET NULL,
  confidence_score numeric,
  dismissed_by_student boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- socratic_questions
CREATE TABLE public.socratic_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  target_gap_id uuid REFERENCES public.gap_findings(id) ON DELETE SET NULL,
  blooms_level integer,
  reasoning text,
  sequence_index integer,
  created_at timestamptz DEFAULT NOW()
);

-- mastery_records
CREATE TABLE public.mastery_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_node_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  mastery_score numeric NOT NULL,
  mastery_level text CHECK (mastery_level IN ('untested', 'weak', 'developing', 'strong', 'mastered')),
  ease_factor numeric,
  interval_days integer,
  trigger_type text CHECK (trigger_type IN ('teach_back', 'review', 'propagation', 'manual')),
  trigger_session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE SET NULL,
  recorded_at timestamptz DEFAULT NOW()
);

-- review_schedules
CREATE TABLE public.review_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_node_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  recommendation_type text CHECK (recommendation_type IN ('re_teach', 'elaborate', 'compare')),
  reason text,
  urgency text CHECK (urgency IN ('low', 'medium', 'high')),
  completed_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- agent_runs
CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE SET NULL,
  agent_name text NOT NULL,
  action text NOT NULL,
  status text CHECK (status IN ('success', 'partial', 'failed')),
  input_summary jsonb DEFAULT '{}'::jsonb,
  output_summary jsonb DEFAULT '{}'::jsonb,
  model_used text,
  token_usage jsonb DEFAULT '{}'::jsonb,
  latency_ms integer,
  error_message text,
  fallback_used boolean DEFAULT false,
  started_at timestamptz DEFAULT NOW(),
  completed_at timestamptz
);

-- audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  action_description text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW()
);


-- 4. Triggers for updated_at

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER set_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER set_concept_nodes_updated_at BEFORE UPDATE ON public.concept_nodes FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER set_teach_back_sessions_updated_at BEFORE UPDATE ON public.teach_back_sessions FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


-- 5. Indexes

CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_source_documents_workspace_id ON public.source_documents(workspace_id);
CREATE INDEX idx_source_documents_processing_status ON public.source_documents(processing_status);
CREATE INDEX idx_source_chunks_workspace_id ON public.source_chunks(workspace_id);
CREATE INDEX idx_source_chunks_source_document_id ON public.source_chunks(source_document_id);
-- Vector index using HNSW for cosine distance
CREATE INDEX idx_source_chunks_embedding ON public.source_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_concept_nodes_workspace_id ON public.concept_nodes(workspace_id);
CREATE INDEX idx_concept_nodes_mastery_level ON public.concept_nodes(mastery_level);
CREATE INDEX idx_concept_nodes_next_review_at ON public.concept_nodes(next_review_at);
CREATE INDEX idx_concept_edges_workspace_id ON public.concept_edges(workspace_id);
CREATE INDEX idx_concept_edges_source_node_id ON public.concept_edges(source_node_id);
CREATE INDEX idx_concept_edges_target_node_id ON public.concept_edges(target_node_id);
CREATE INDEX idx_teach_back_sessions_workspace_id ON public.teach_back_sessions(workspace_id);
CREATE INDEX idx_teach_back_sessions_concept_node_id ON public.teach_back_sessions(concept_node_id);
CREATE INDEX idx_student_explanations_session_id ON public.student_explanations(session_id);
CREATE INDEX idx_gap_findings_session_id ON public.gap_findings(session_id);
CREATE INDEX idx_socratic_questions_session_id ON public.socratic_questions(session_id);
CREATE INDEX idx_mastery_records_concept_node_id ON public.mastery_records(concept_node_id);
CREATE INDEX idx_review_schedules_workspace_id ON public.review_schedules(workspace_id);
CREATE INDEX idx_review_schedules_scheduled_date ON public.review_schedules(scheduled_date);
CREATE INDEX idx_agent_runs_workspace_id ON public.agent_runs(workspace_id);
CREATE INDEX idx_audit_logs_workspace_id ON public.audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);


-- 6. Row-Level Security

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teach_back_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socratic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: user can only see/update their own profile
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Workspaces: user can only CRUD own workspaces
CREATE POLICY "Users can access own workspaces" ON public.workspaces FOR ALL USING (auth.uid() = user_id);

-- Workspace scoped tables
CREATE POLICY "Access via workspace_id" ON public.source_documents FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.source_chunks FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.concept_nodes FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.concept_edges FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.teach_back_sessions FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.review_schedules FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.agent_runs FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));
CREATE POLICY "Access via workspace_id" ON public.audit_logs FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));

-- Session scoped tables
CREATE POLICY "Access via session_id" ON public.student_explanations FOR ALL USING (session_id IN (SELECT id FROM public.teach_back_sessions WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid())));
CREATE POLICY "Access via session_id" ON public.gap_findings FOR ALL USING (session_id IN (SELECT id FROM public.teach_back_sessions WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid())));
CREATE POLICY "Access via session_id" ON public.socratic_questions FOR ALL USING (session_id IN (SELECT id FROM public.teach_back_sessions WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid())));

-- Concept scoped tables
CREATE POLICY "Access via concept_node_id" ON public.mastery_records FOR ALL USING (concept_node_id IN (SELECT id FROM public.concept_nodes WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid())));
