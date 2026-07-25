# B5.2 Evidence Contract Correction and B6 Foundation

## Diagnosis evidence correction

The diagnosis workflow accepts either source chunks or a canonical concept definition as evidence. The feedback validator previously accepted only source-chunk references for non-unsupported gaps, which made definition-only diagnosis fail after gap detection.

The corrected contract requires every normal gap to provide:

- non-empty `sourceEvidence`, and
- at least one traceable reference: `sourceChunkIds` or `relatedConceptId`.

The local detector now attaches the canonical concept identifier whenever a concept definition is used without a source chunk. No synthetic chunk identifier is created.

## Checkpoint foundation

`lib/workflows/checkpoints` introduces a framework-neutral checkpoint contract and an in-memory implementation for deterministic tests. Checkpoints are thread-scoped, sequence-ordered, JSON-serializable, immutable after storage, and carry workflow, workspace, user, and trace identity.

The in-memory store is not a production persistence backend. It establishes the state contract that a LangGraph checkpointer and later Postgres implementation must satisfy.

## MCP exposure foundation

`lib/mcp/manifest.ts` derives an MCP-facing manifest from the internal tool registry. Internal tools remain the execution authority; the MCP layer only exposes tools explicitly marked `read_only` or `approved_write`. This prevents protocol exposure from becoming a second, inconsistent tool registry.

The official SDK transport and server adapter remain deferred until the dependency-backed B6 integration.
