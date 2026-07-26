create table if not exists public.workflow_checkpoints (
  checkpoint_id uuid primary key,
  thread_id text not null,
  workflow_name text not null,
  workflow_version text not null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  trace_id uuid not null,
  status text not null check (status in ('running','waiting_for_input','completed','failed')),
  sequence integer not null check (sequence >= 0),
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object'),
  created_at timestamptz not null default now(),
  unique(thread_id, sequence)
);

create index if not exists workflow_checkpoints_thread_sequence_idx on public.workflow_checkpoints(thread_id, sequence desc);
create index if not exists workflow_checkpoints_workspace_created_idx on public.workflow_checkpoints(workspace_id, created_at desc);

alter table public.workflow_checkpoints enable row level security;

create policy "Users can read own workflow checkpoints"
on public.workflow_checkpoints for select to authenticated
using (
  user_id = auth.uid() and exists (
    select 1 from public.workspaces as w
    where w.id = workflow_checkpoints.workspace_id
      and w.user_id = auth.uid()
  )
);

revoke all on public.workflow_checkpoints from anon, authenticated;
grant select on public.workflow_checkpoints to authenticated;
grant all on public.workflow_checkpoints to service_role;
