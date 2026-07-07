-- supabase/migrations/20260707000000_extend_mastery_model.sql

-- 1. Create mastery_signals table for historical ledger
CREATE TABLE public.mastery_signals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  concept_id uuid REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source_session_id uuid REFERENCES public.teach_back_sessions(id) ON DELETE CASCADE,
  source_explanation_id text, -- string so we can use deterministic source_event_key if explanation_id is missing
  signal_type text NOT NULL,
  strength numeric,
  confidence_score numeric,
  evidence text,
  source_chunk_ids uuid[] DEFAULT '{}'::uuid[],
  gap_finding_ids uuid[] DEFAULT '{}'::uuid[],
  created_at timestamptz DEFAULT NOW()
);

-- Idempotency constraint
ALTER TABLE public.mastery_signals ADD CONSTRAINT uk_mastery_signals_idempotency 
UNIQUE (workspace_id, concept_id, source_session_id, source_explanation_id, signal_type);

-- Indices
CREATE INDEX idx_mastery_signals_concept_id ON public.mastery_signals(concept_id);
CREATE INDEX idx_mastery_signals_session_id ON public.mastery_signals(source_session_id);

-- RLS
ALTER TABLE public.mastery_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via workspace_id" ON public.mastery_signals 
FOR ALL USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));

-- 2. Modify mastery_records table

-- Add missing columns
ALTER TABLE public.mastery_records 
  ADD COLUMN confidence_score numeric,
  ADD COLUMN evidence_count integer DEFAULT 0,
  ADD COLUMN attempts_count integer DEFAULT 0,
  ADD COLUMN last_assessed_at timestamptz,
  ADD COLUMN strongest_gaps text[] DEFAULT '{}'::text[],
  ADD COLUMN recommendation_label text,
  ADD COLUMN explanation text;

-- Drop existing mastery_level check constraint
DO $$ 
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
  WHERE tc.table_name = 'mastery_records' AND ccu.column_name = 'mastery_level' AND tc.constraint_type = 'CHECK'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.mastery_records DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Map existing values if any
UPDATE public.mastery_records SET mastery_level = 'unassessed' WHERE mastery_level = 'untested';
UPDATE public.mastery_records SET mastery_level = 'emerging' WHERE mastery_level = 'weak';
UPDATE public.mastery_records SET mastery_level = 'partial' WHERE mastery_level = 'developing';
UPDATE public.mastery_records SET mastery_level = 'understood' WHERE mastery_level IN ('strong', 'mastered');

-- Add new constraint
ALTER TABLE public.mastery_records 
  ADD CONSTRAINT mastery_records_mastery_level_check 
  CHECK (mastery_level IN ('unassessed', 'insufficient_evidence', 'emerging', 'partial', 'understood', 'weak_connection', 'misconception', 'needs_review'));
