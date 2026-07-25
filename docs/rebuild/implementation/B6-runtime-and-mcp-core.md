# Rebuild B6 — Runtime, Checkpoint, and MCP Core

## Implemented

- Retry-aware tool execution with idempotency protection and bounded exponential backoff.
- Framework-neutral checkpointed workflow runner with immutable transition history, pause states, resume points, and hard step limits.
- Transport-neutral MCP request handler derived from the authorized internal tool registry.
- Deterministic runtime evaluation covering checkpoint completeness across twelve workflow lengths.

## Boundary

The internal tool registry remains the source of truth. MCP is an adapter and cannot expose tools marked `none`. The request handler intentionally implements the protocol core without adding a package dependency; the official SDK transport will be added only with a synchronized lockfile and end-of-Rebuild-B integration verification.

The checkpointed runner is the deterministic contract beneath the later LangGraph adapter. It does not pretend to provide LangGraph persistence, interrupts, or distributed execution by itself.
