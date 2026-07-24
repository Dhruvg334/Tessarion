CREATE TABLE public.operational_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  entity_type text,
  entity_id uuid,
  request_id text,
  trace_id text,
  safe_message text NOT NULL CHECK (char_length(safe_message) <= 2000),
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_operational_events_workspace_user_created ON public.operational_events(workspace_id, user_id, created_at);
CREATE INDEX idx_operational_events_event_type ON public.operational_events(event_type);
CREATE INDEX idx_operational_events_severity ON public.operational_events(severity);
CREATE INDEX idx_operational_events_trace_id ON public.operational_events(trace_id);
CREATE INDEX idx_operational_events_request_id ON public.operational_events(request_id);

-- RLS
ALTER TABLE public.operational_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own operational events"
  ON public.operational_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Inserts are restricted to service_role to ensure safe logging
-- No INSERT, UPDATE, or DELETE policies for authenticated users on operational_events

-- Grants
GRANT SELECT ON public.operational_events TO authenticated;
GRANT ALL ON public.operational_events TO service_role;
