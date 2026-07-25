# Rebuild B4 — Knowledge Graph Projection and Graph Retrieval

## Status

Implemented as a derived graph layer. Supabase/Postgres remains canonical for concept nodes, concept edges, source evidence, learner records, and authorization. Neo4j is a rebuildable projection optimized for bounded traversal.

## Implemented contracts

- Canonical concept and relationship records are converted into a versioned `WorkspaceGraphProjection`.
- Projection rejects cross-workspace edges, missing endpoints, self-edges, unsupported relationship types, and relationships without source-chunk evidence.
- Local deterministic store supports incoming, outgoing, and bidirectional traversal.
- Traversal hard limits are depth 3 and 50 nodes.
- Graph paths retain edge IDs, relationship types, confidence-derived scores, and source-chunk provenance.
- Hybrid retrieval candidates can receive a small deterministic boost only when their chunk IDs are supported by returned graph paths.
- Neo4j Query API adapter supports workspace projection replacement, deletion, and bounded traversal without making Neo4j canonical.

## Data boundary

```text
Supabase concept_nodes + concept_edges
  → validation and projection versioning
  → local deterministic graph or Neo4j projection
  → bounded graph traversal
  → evidence chunk IDs
  → hybrid retrieval augmentation
```

A graph projection failure does not invalidate canonical Postgres data. The projection can be deleted and rebuilt from Postgres.

## Safety rules

- Every traversal is scoped by `workspaceId`.
- Relationships without evidence are excluded.
- Relationship labels are selected from an internal allow-list and are never interpolated from arbitrary user input.
- Depth and node count are bounded before query construction.
- Neo4j errors are normalized to safe application errors.
- No raw graph database response is exposed to users.

## Evaluation

`npm run eval:graph-v2` measures:

- expected concept recall
- source-evidence recall
- workspace-scope correctness
- depth-bound correctness
- deterministic repeatability

The evaluation uses an offline local graph projection and requires no Neo4j instance.

## Deferred

- Inngest-backed projection synchronization and reconciliation
- projection status records in Postgres
- production Neo4j credentials and deployment topology
- graph-seed mapping from hybrid retrieval results
- misconception and learner-memory projection
- trace spans for graph queries
