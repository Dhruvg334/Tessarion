# Data Ownership and Storage Matrix

This authoritative matrix guarantees data consistency by strictly defining the canonical owner and derivation paths for every system entity.

| Entity | Canonical Owner | Derived Copies | Sync Direction | Identifiers | Retention | Deletion | Versioning | Consistency | Recovery Source | Migration Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Users / Workspaces** | Supabase Postgres | None | N/A | `id` (UUID) | Permanent | Cascades to all data | N/A | Strong | PG Backups | Preserve existing |
| **Documents (Metadata)** | Supabase Postgres | None | N/A | `id` (UUID) | Workspace lifespan | Cascades to Chunks/Graph | N/A | Strong | PG Backups | Preserve existing |
| **Documents (Blobs)** | Supabase Storage | None | N/A | `path` | Workspace lifespan | Triggered by PG delete | N/A | Eventual | Storage Backups| Preserve existing |
| **Chunks** | Supabase Postgres | Qdrant (Vectors) | PG → Qdrant | `id` (UUID) | Document lifespan | Triggered by Doc delete | N/A | Strong | PG Backups | Replace naive chunker |
| **Concepts** | Supabase Postgres | Neo4j (Nodes) | PG → Neo4j | `id` (UUID) | Workspace lifespan | Triggered by Workspace | `extractionVersion` | Eventual | PG Backups | Migrate to LangGraph extraction |
| **Graph Relationships** | Supabase Postgres | Neo4j (Edges) | PG → Neo4j | `id` (UUID) | Workspace lifespan | Cascades with Concepts | `extractionVersion` | Eventual | PG Backups | New PG tables → Neo4j |
| **Dense/Sparse Vectors** | Qdrant | None | Qdrant is source | `uuidv5(chunkId)`| Chunk lifespan | Triggered by Sync | `embeddingVersion`| Strong (internal) | Re-embed from PG| Replace index |
| **Learner Explanations** | Supabase Postgres | Traces | PG → Traces | `id` (UUID) | Permanent (audit) | Cascades on User delete | N/A | Strong | PG Backups | Preserve |
| **Gaps & Findings** | Supabase Postgres | Neo4j (Edges) | PG → Neo4j | `id` (UUID) | Permanent | Cascades on User delete | N/A | Eventual | PG Backups | New schema |
| **Mastery Signals** | Supabase Postgres | None | N/A | `id` (UUID) | Permanent | Cascades on User delete | N/A | Strong | PG Backups | Preserve |
| **Mastery State** | Supabase Postgres | Qdrant (Semantic)| PG → Qdrant | `id` (UUID) | Permanent | Cascades on User delete | Timestamped | Eventual | Compute from Signals| Preserve |
| **Reviews** | Supabase Postgres | None | N/A | `id` (UUID) | Until completed | Soft delete on complete| N/A | Strong | PG Backups | Preserve |
| **Tutoring Sessions** | Supabase Postgres | Neo4j (Edges) | PG → Neo4j | `id` (UUID) | Permanent | Cascades on User delete | N/A | Eventual | PG Backups | Refactor state |
| **Workflow Checkpoints**| LangGraph PG Store | None | N/A | `threadId` | Ephemeral (7 days)| Cron job sweep | N/A | Strong | N/A (Ephemeral)| New tables |
| **Prompt Versions** | Codebase (Git) | Traces | Git → Traces | `id`:`version` | Permanent | Never delete old versions | SemVer | Strong | Git Repo | Move inline strings to registry |
| **Operational Events** | Trace Backend | PG (Summaries) | Trace → PG | `traceId` | 30 Days | Expiration policy | N/A | Eventual | N/A | Refactor UI to use Postgres summaries |
