# Hybrid RAG and Graph Retrieval

Tessarion uses a multi-stage retrieval pipeline combining Qdrant (Hybrid RAG) and Neo4j (Graph Traversal).

## 1. Qdrant Contract

Qdrant serves as the derived index for all semantic and sparse searches.

### Structure & Operations
- **Collections:** `workspace_chunks` (document evidence), `semantic_memory` (learner history).
- **Point IDs:** Must be a deterministic UUID: `uuidv5(documentId + chunkIndex)`.
- **Named Vectors:** 
  - `dense`: Primary embedding vector (e.g., 768 dimensions for Gemini).
  - `sparse`: SPLADE/BM25 sparse vector representation.
- **Payload Schema:**
  ```json
  {
    "workspaceId": "string (uuid)",
    "documentId": "string (uuid)",
    "conceptIds": ["string (uuid)"],
    "chunkIndex": "number",
    "embeddingVersion": "string",
    "content": "string"
  }
  ```
- **Filters:** All queries *must* include a hard `workspaceId` filter at the root of the query payload.
- **Indexing:** Payload indexes on `workspaceId`, `documentId`, and `conceptIds`.
- **Upserts:** Idempotent. Re-ingesting a document overwrites existing point IDs.
- **Deletion:** Cascade deletes triggered by Supabase document deletion events.
- **Reindexing / Embedding Versions:** Payloads track `embeddingVersion`. During model upgrades, a new collection is created, populated, and aliases are swapped.
- **Fusion Strategy:** Reciprocal Rank Fusion (RRF) is used to merge dense and sparse candidate lists natively in Qdrant 1.10+.
- **Candidate Limits:** Top-K = 20 before reranking.
- **Reranking:** Cross-encoder reranking is omitted initially for latency. If enabled, it operates on the Top-K=20 candidates, returning the Top-K=5.
- **Fallback:** If dense inference fails, fallback to strict sparse keyword search.

## 2. Neo4j Contract

Neo4j is the derived projection for traversing conceptual dependencies and identifying prerequisites. Postgres remains the canonical owner of these relationships.

### Constraints & Identity
- **Canonical IDs:** Neo4j Node IDs must exactly match their Supabase Postgres UUIDs.
- **Constraints:** Unique constraint on `(Node:id)`.
- **Provenance & Evidence:** Every relationship must include a `sourceChunkId` property. Relationships without evidence are invalid.
- **Validity & Versioning:** Nodes carry a `lastSyncedAt` timestamp.

### Node Properties
- `Workspace` `{ id: uuid }`
- `Concept` `{ id: uuid, workspaceId: uuid, name: string, definition: string, lastSyncedAt: timestamp }`
- `Chunk` `{ id: uuid, documentId: uuid, workspaceId: uuid }`
- `Misconception` `{ id: uuid, workspaceId: uuid, description: string }`
- `MasteryState` `{ id: uuid, userId: uuid, conceptId: uuid, level: float }`

### Relationship Properties
- `[:PREREQUISITE_OF { sourceChunkId: uuid, confidence: float, version: string }]`
- `[:EVIDENCED_BY { confidence: float }]`
- `[:EXPLAINS { sessionId: uuid }]`
- `[:CONFUSED_WITH { sourceChunkId: uuid }]`

### Traversal Query Contracts
- **Limits:** Maximum traversal depth is **3 hops**. Maximum nodes returned per query is **50**.
- **Timeouts:** Graph queries must timeout after **2000ms**.
- **Workspace Boundary:** Traversals must start from a node matching the active `workspaceId` and relationship traversals must include `WHERE target.workspaceId = $workspaceId`.

### Sync & Deletion Behavior
- **Sync Behavior:** Asynchronous sync from Postgres via Inngest. Upserts use `MERGE` clauses.
- **Stale Projection Recovery:** A nightly cron job diffs Neo4j node counts against Postgres. Orphaned nodes are purged.
- **Deletion Behavior:** Deleting a Concept in Postgres triggers an Inngest job that executes a `DETACH DELETE` in Neo4j.
