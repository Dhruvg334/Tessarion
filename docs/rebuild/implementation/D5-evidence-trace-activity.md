# D5 — Evidence, Trace, Activity, and Product-State Transparency

D5 adds a user-visible evidence and execution layer to the authenticated notebook.

## Implemented

- Workspace-scoped source-chunk inspection through `/api/workspaces/[id]/evidence`.
- Evidence inspectors inside diagnosis gaps and tutor turns.
- Activity grouped into safe operational runs rather than a flat event dump.
- Trace inspection from `trace_id`-linked operational events.
- Explicit missing, redacted, and unavailable states.
- Lint cleanup across the review queue, graph adapters, concept workflow, middleware, and runtime evaluation.

## Security boundary

The evidence API verifies the authenticated workspace owner and returns at most twelve requested chunks. Trace views expose safe operational messages and identifiers only. They do not expose credentials, provider payloads, full learner responses, hidden reasoning, or raw database errors.

## Remaining work

OpenTelemetry span persistence and a dedicated external trace backend remain integration tasks for Rebuild E. Operational events are the current user-facing trace source.
