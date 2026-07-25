# Rebuild B7 — Integration and Quality Gate

B7 closes the backend rebuild foundation with persistent workflow checkpoints, a vendor-neutral trace export boundary, and a repository-wide dataset inventory.

## Implemented

- `SupabaseWorkflowCheckpointStore` backed by `workflow_checkpoints`.
- RLS-protected checkpoint migration with service-role writes and owner-scoped reads.
- OTLP-compatible HTTP trace exporter for safe structured spans.
- In-memory exporter for deterministic tests.
- Rebuild B dataset inventory and minimum-case quality gate.
- CI coverage for runtime and rebuild quality-gate scripts.

## Boundaries

Postgres remains canonical for workflow history. The trace exporter sends only validated `SafeTraceSpan` records and never raw learner text, source documents, credentials, or hidden reasoning. External graph, vector, and trace systems remain derived infrastructure.

The official LangGraph and MCP SDK adapters remain dependency-gated. Existing workflow and tool contracts are intentionally independent so those adapters can be added without changing domain behavior.
