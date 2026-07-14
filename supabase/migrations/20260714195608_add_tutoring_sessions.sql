CREATE TABLE public.tutoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_node_id uuid NOT NULL REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  teach_back_session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE SET NULL,
  review_schedule_id uuid REFERENCES public.review_schedules(id) ON DELETE SET NULL,
  focus_type text NOT NULL,
  focus_summary text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'blocked', 'needs_review')),
  max_turns integer NOT NULL DEFAULT 6 CHECK (max_turns BETWEEN 1 AND 10),
  current_turn_count integer NOT NULL DEFAULT 0 CHECK (current_turn_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.tutoring_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutoring_session_id uuid NOT NULL REFERENCES public.tutoring_sessions(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'tutor', 'system')),
  turn_type text NOT NULL CHECK (turn_type IN ('student_response', 'socratic_question', 'hint', 'correction_prompt', 'source_prompt', 'reflection_prompt', 'summary', 'completion_check')),
  content text NOT NULL CHECK (content <> ''),
  source_chunk_ids uuid[] DEFAULT '{}',
  gap_finding_ids uuid[] DEFAULT '{}',
  mastery_signal_ids uuid[] DEFAULT '{}',
  tutor_move text CHECK (tutor_move IN ('ask_clarifying_question', 'ask_contrast_question', 'ask_evidence_question', 'ask_example_question', 'ask_prerequisite_question', 'provide_small_hint', 'ask_correction', 'request_teach_back_again', 'summarize_progress', 'complete_session')),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tutoring_sessions_workspace_user_status ON public.tutoring_sessions(workspace_id, user_id, status);
CREATE INDEX idx_tutoring_sessions_concept ON public.tutoring_sessions(concept_node_id);
CREATE INDEX idx_tutoring_sessions_teach_back ON public.tutoring_sessions(teach_back_session_id);
CREATE INDEX idx_tutoring_sessions_review ON public.tutoring_sessions(review_schedule_id);

CREATE INDEX idx_tutoring_turns_session ON public.tutoring_turns(tutoring_session_id);
CREATE INDEX idx_tutoring_turns_created ON public.tutoring_turns(created_at);

-- RLS
ALTER TABLE public.tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tutoring sessions"
  ON public.tutoring_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tutoring sessions"
  ON public.tutoring_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tutoring sessions"
  ON public.tutoring_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tutoring sessions"
  ON public.tutoring_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own tutoring turns"
  ON public.tutoring_turns
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tutoring turns"
  ON public.tutoring_turns
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tutoring turns"
  ON public.tutoring_turns
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tutoring turns"
  ON public.tutoring_turns
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutoring_sessions TO authenticated;
GRANT ALL ON public.tutoring_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutoring_turns TO authenticated;
GRANT ALL ON public.tutoring_turns TO service_role;
