# Rebuild B3 — Hybrid Retrieval Foundation

## Implemented

- Framework-neutral hybrid retrieval pipeline with dense and sparse retriever interfaces.
- Reciprocal Rank Fusion with configurable channel weights and deterministic tie-breaking.
- Deterministic reranker for local development and CI.
- Workspace and document filtering in both local and Qdrant retrieval paths.
- Qdrant REST adapter supporting named dense/sparse vectors, point upserts, document deletion and Query API searches.
- Deterministic point identifiers, content hashes and embedding-version payload fields.
- Versioned retrieval evaluation dataset with factual, conceptual, comparison, prerequisite, misconception, review and tutoring queries.

## Storage boundary

Postgres remains canonical for documents and chunks. Qdrant stores a derived retrieval projection. A failed Qdrant write must not invalidate the canonical document transaction; indexing is retryable and rebuildable from Postgres.

## Runtime modes

- **Local deterministic:** in-memory chunks plus the local embedding provider. Used by unit tests and CI.
- **Qdrant:** REST adapter backed by a local Docker container or compatible hosted endpoint. Configuration is injected; no Qdrant dependency is imported into evaluation scripts.

## Retrieval sequence

1. Validate workspace-scoped query.
2. Run dense and sparse candidate retrieval concurrently.
3. Fuse ranked lists with weighted RRF.
4. Rerank fused candidates.
5. Apply final limit and evidence sufficiency threshold.
6. Return diagnostics without exposing private source content in telemetry.

## Deferred

- Production sparse encoder selection.
- Cross-encoder reranker.
- Neo4j graph expansion, implemented in B4.
- Inngest-backed bulk indexing, added after the canonical chunk-loading service is finalized.
