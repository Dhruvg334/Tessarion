-- Create review_schedules table
DROP TABLE IF EXISTS public.review_schedules CASCADE;
CREATE TABLE public.review_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, -- references auth.users implicitly
    concept_node_id uuid NOT NULL REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
    mastery_record_id uuid REFERENCES public.mastery_records(id) ON DELETE SET NULL,
    status text NOT NULL CHECK (status IN ('not_ready', 'queued', 'due', 'overdue', 'completed', 'skipped', 'suspended')),
    priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    reason_type text NOT NULL CHECK (reason_type IN ('misconception', 'needs_review', 'weak_connection', 'shallow_explanation', 'missing_prerequisite', 'insufficient_evidence', 'scheduled_reinforcement', 'new_concept', 'repeated_failure', 'improvement_check')),
    reason text NOT NULL,
    scheduled_for timestamptz,
    completed_at timestamptz,
    skipped_at timestamptz,
    attempts_count integer DEFAULT 0,
    source_mastery_signal_ids uuid[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Partial Unique Index to enforce idempotency of active reviews per concept
CREATE UNIQUE INDEX unique_active_review_per_concept
ON public.review_schedules (workspace_id, user_id, concept_node_id)
WHERE status IN ('queued', 'due', 'overdue');

-- Add useful indexes
CREATE INDEX idx_review_schedules_workspace_user_status ON public.review_schedules(workspace_id, user_id, status);
CREATE INDEX idx_review_schedules_concept_node_id ON public.review_schedules(concept_node_id);
CREATE INDEX idx_review_schedules_scheduled_for ON public.review_schedules(scheduled_for);
CREATE INDEX idx_review_schedules_priority ON public.review_schedules(priority);

-- Add RLS
ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own review schedules"
    ON public.review_schedules FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own review schedules"
    ON public.review_schedules FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own review schedules"
    ON public.review_schedules FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own review schedules"
    ON public.review_schedules FOR DELETE
    USING (user_id = auth.uid());

-- Trigger to auto-update updated_at
CREATE TRIGGER update_review_schedules_updated_at
BEFORE UPDATE ON public.review_schedules
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();


-- Explicit grants for tables created after the base grants migration.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_schedules TO authenticated;
GRANT ALL ON public.review_schedules TO service_role;
