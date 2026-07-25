# Current System Audit

This audit reflects the baseline repository before the implementation of Rebuild A. All file paths have been verified against the existing repository structure.

**Important Note:** The repository currently **does not yet contain** production LangGraph, MCP, Qdrant, Neo4j, or Phoenix integrations.

| Subsystem | Current Implementation | Current Files | Strengths | Limitations | Migration Risk | Migration Strategy | Target Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase Authentication** | `@supabase/ssr` with email/password. Middleware protects routes. | `app/(auth)/login/page.tsx`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts` | Secure, integrated with Next.js edge routers. | No MFA or advanced identity integration yet. | Low | Extend in place. | B1 |
| **Supabase Database & RLS** | Postgres tables with row-level security. | `supabase/migrations/*`, `types/database.ts` | Solid foundation for canonical data. | RLS policies need strict review before exposing new tables. | Medium | Preserve schema, add new tables for workflow checkpoints. | B4 |
| **Source Ingestion** | Basic Next.js API routes handling text upload. | `app/api/workspaces/[id]/upload/route.ts` | Simple and direct. | Fails on large files due to Vercel timeouts. | High | Refactor to Inngest for async background processing. | B1 |
| **Chunking** | Naive character/word splitting. | `lib/rag/chunking.ts` | Fast and deterministic. | Destroys semantic meaning and table layouts. | Medium | Replace with semantic chunker. | B3 |
| **Embeddings** | Gemini `text-embedding` model via AI SDK. | `lib/services/embeddings.ts` | Functional integration. | Lacks versioning; tightly coupled to one provider. | Medium | Abstract behind provider registry. | B3 |
| **Retrieval** | Simple pgvector or in-memory similarity. | `lib/rag/retrieval.ts` | Easy to test. | Misses keyword matches; no graph traversal. | High | Replace entirely with Qdrant hybrid retrieval. | B3 |
| **Concept Extraction** | Vercel AI SDK `generateObject`. | `lib/ai/tasks/local-concept-extraction.ts` | Leverages structured output. | Hallucinates edges; lacks verification step. | High | Replace with multi-step LangGraph workflow. | B2 |
| **Concept Graph** | Supabase relational tables. | `lib/services/graph.ts` | Enforces referential integrity. | N-hop traversals are slow in SQL. | Medium | Maintain PG as canonical; sync to Neo4j for traversal. | B4 |
| **Teach-Back** | Form submission + zero-shot diagnosis. | `components/teach-back/teach-back-panel.tsx`, `app/api/workspaces/[id]/teach-back/route.ts` | Immediate feedback. | Stateless; loses history; diagnosis often lacks specific grounding. | High | Reroute to LangGraph Diagnosis Workflow. | B2 |
| **Gap Detection** | Zero-shot prompting over current explanation. | `lib/product/next-action.ts` | Fast. | Doesn't utilize past semantic memory or graph prerequisites. | High | Incorporate hybrid RAG into LangGraph node. | B2 |
| **Mastery** | Computed numeric signal (0-1). | `lib/mastery/calculate-mastery.ts` | Deterministic and auditable. | Primitive signal weighting. | Low | Preserve as domain service. | B6 |
| **Review Scheduling** | Spaced repetition algorithm. | `lib/review/calculate-review.ts` | Deterministic. | Doesn't dynamically adapt to graph difficulty. | Low | Preserve as domain service. | B6 |
| **Tutoring** | Simple request-response loop. | `components/tutoring/tutoring-panel.tsx`, `lib/tutoring/decide-next-move.ts`, `lib/tutoring/generate-tutor-message.ts` | Strict socratic guardrails. | Context window gets polluted; lacks durable state. | High | Replace with LangGraph Socratic Tutor Workflow. | B2 |
| **Inngest** | Basic event bindings for file processing. | `inngest/client.ts`, `inngest/functions/process-source-document.ts` | Durable async base exists. | Underutilized for graph syncing and indexing. | Low | Extend with new job definitions. | B1 |
| **Provider Registry** | Custom abstraction over AI SDK. | `lib/ai/providers/registry.ts` | Useful for unit testing mocks. | Lacks automatic fallback logic. | Low | Extend to support Voyage/OpenAI. | B1 |
| **Evaluations** | Local Vitest runners for AI tasks. | `eval/*`, `lib/rag/evaluation.test.ts` | Prevents regressions. | Coverage is currently limited. | Low | Extend to full Evaluation Matrix. | B7 |
| **Operational Events** | Basic logging UI and service. | `components/workspace/activity-log.tsx`, `lib/services/observability.ts` | Tangible audit trail. | Mixes domain events with raw telemetry. | Medium | Refactor domain events to Postgres; telemetry to OTEL. | B7 |
| **Public Frontend** | Static routes. | `app/about/page.tsx`, `app/demo/page.tsx` | Clean layout shell. | Hardcoded content. | Low | Extend in place. | C2 |
| **Workspace Frontend** | Server Components with client shells. | `app/workspace/[id]/study/page.tsx` | Stable routing. | Ad-hoc design tokens. | Medium | Refactor CSS tokens and component layouts. | D1 |
| **Error Architecture** | Basic React Error Boundaries. | `app/error.tsx`, `components/shell/error-state.tsx` | Catches top-level crashes. | Poor recovery from specific API failures. | Medium | Implement granular `error.tsx` at route segments. | D1 |
