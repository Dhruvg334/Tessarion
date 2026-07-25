# Migration Sequence

## Phase B2: Learning Diagnosis Workflow
- **Dependencies:** B1 (Prompt Registry & Tools).
- **Files Modified:** 
  - `lib/tutoring/decide-next-move.ts` (Removed)
  - `lib/product/next-action.ts` (Removed)
  - `lib/workflows/diagnosis/*` (Created)
- **Migration Method:** Replace the zero-shot procedural function with a LangGraph state machine. Old API routes are updated to invoke the LangGraph checkpoint runner.
- **Schema Impact:** Adds `langgraph_checkpoints` tables to Postgres.
- **Infrastructure Added:** None (LangGraph runs natively in Next.js Edge/Node).
- **Tests:** `eval/mastery/*` matrix is run against the new workflow.
- **Acceptance Criteria:** Diagnosis API returns mastery signals that are 100% grounded in evidence chunks. Trace is emitted to OTEL.
- **Rollback:** Revert API route to point to the legacy `lib/tutoring/decide-next-move.ts` function.
- **Completion Artifact:** PR with passing CI evaluation metrics.

## Phase B3: Hybrid Retrieval
- **Dependencies:** B1.
- **Files Modified:** 
  - `lib/rag/retrieval.ts` (Removed)
  - `lib/rag/qdrant-client.ts` (Created)
- **Migration Method:** Abstract embedding generation behind Provider Registry. Write Inngest job to sync existing Postgres chunks to Qdrant. Switch API retrieval calls to Qdrant.
- **Schema Impact:** None to Postgres. New Qdrant collections initialized.
- **Infrastructure Added:** Qdrant Cloud Cluster.
- **Tests:** `eval/rag/recall-cases.json` run against Qdrant.
- **Acceptance Criteria:** Recall accuracy meets >90% threshold.
- **Rollback:** Revert `lib/rag/retrieval.ts` to use old pgvector query.
- **Completion Artifact:** PR with Qdrant collection initialization script and passing evaluations.

## Phase B4: Graph Persistence
- **Dependencies:** B2, B3.
- **Files Modified:** `lib/services/graph.ts`.
- **Migration Method:** Write Inngest job to sync Postgres concepts/relationships to Neo4j. Update `traverse_concept_graph` tool to query Neo4j instead of recursive SQL.
- **Schema Impact:** Neo4j constraints applied.
- **Infrastructure Added:** Neo4j Aura Instance.
- **Tests:** `eval/graph/traversals.json`.
- **Acceptance Criteria:** Multi-hop queries resolve in <2000ms.
- **Rollback:** Disable Inngest sync job; revert tool to use SQL.
- **Completion Artifact:** PR with Neo4j driver integration.

## Phase C1: Design Tokens
- **Dependencies:** None.
- **Files Modified:** `app/globals.css`, `tailwind.config.js`.
- **Migration Method:** Sweep global CSS and replace hex codes with defined CSS variables (e.g., `--color-canvas`, `--color-paper`).
- **Schema Impact:** None.
- **Tests:** Visual review.
- **Acceptance Criteria:** No pure black/white surfaces exist.
- **Rollback:** `git revert`.
- **Completion Artifact:** PR.
