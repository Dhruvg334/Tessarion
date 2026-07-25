# Open Decisions

## 1. LangGraph Checkpointer Storage

- **Question:** Should we use Postgres (Supabase) directly for LangGraph checkpoints, or a dedicated Redis/KV store?
- **Options:** 
  1. `pg` (Postgres / Supabase)
  2. Vercel KV / Redis
- **Recommendation:** Postgres (Supabase).
- **Rationale:** Minimizes infrastructure sprawl. Supabase is already the canonical store, and LangGraph officially supports `@langchain/langgraph-checkpoint-postgres`.
- **Official Evidence:** LangGraph Documentation (Jul 2026) recommends PostgreSQL for durable persistence in production.
- **Operational Cost:** Negligible (uses existing DB).
- **Risk:** High write-throughput during dense tutoring could tax the database pool.
- **Owner:** Core Architect
- **Deadline:** Before Phase B6.
- **Blocked Phase:** Phase B6 (Memory & Checkpoints).

## 2. Qdrant Topology

- **Question:** Use Qdrant Cloud or self-hosted Qdrant container?
- **Options:** 
  1. Qdrant Cloud (SaaS)
  2. Docker (Self-hosted)
- **Recommendation:** Qdrant Cloud for production, Docker for local dev.
- **Rationale:** Reduces DevOps burden for open-source adopters while maintaining ease of local testing via `docker-compose`.
- **Official Evidence:** Qdrant Docs (Jul 2026) confirm 100% API parity between local Docker and Cloud.
- **Operational Cost:** $0 (Free Tier available on Cloud).
- **Risk:** Cloud reliance requires users to manage external API keys.
- **Owner:** Infra Lead
- **Deadline:** Before Phase B3.
- **Blocked Phase:** Phase B3 (Hybrid Retrieval).

## 3. Documentation Shell

- **Question:** Adopt Fumadocs or build a custom docs shell?
- **Options:** 
  1. Fumadocs
  2. Custom Next.js MDX
- **Recommendation:** Fumadocs.
- **Rationale:** Fumadocs provides excellent search and TOC out of the box. Its theming API is robust enough to strip out generic SaaS gradients and enforce our strict `Canvas`/`Primary Charcoal` design system.
- **Official Evidence:** Fumadocs v13 API reference shows full CSS variable overriding.
- **Operational Cost:** $0.
- **Risk:** Vendor lock-in to a specific UI framework for docs.
- **Owner:** Frontend Lead
- **Deadline:** Before Phase C3.
- **Blocked Phase:** Phase C3 (Documentation).

## 4. Tracing Backend

- **Question:** Phoenix, LangSmith, or raw OpenTelemetry?
- **Options:** 
  1. Arize Phoenix
  2. LangSmith
  3. Jaeger/OTEL
- **Recommendation:** Arize Phoenix.
- **Rationale:** Phoenix supports a local-first, self-hosted deployment matching the open-source mission, while natively supporting LlamaIndex/LangChain trace evals without the strict lock-in of LangSmith.
- **Official Evidence:** Phoenix Docs (Jul 2026) confirm full OTEL ingest compatibility.
- **Operational Cost:** $0 (Local/Self-hosted).
- **Risk:** Phoenix UI is less mature than LangSmith for large team collaboration.
- **Owner:** AI Lead
- **Deadline:** Before Phase B7.
- **Blocked Phase:** Phase B7 (Evaluation).

## 5. Embedding Provider

- **Question:** Stick with Gemini embeddings or allow configuration?
- **Options:** 
  1. Gemini `text-embedding-004` (Default)
  2. Configurable via Registry
- **Recommendation:** Abstract behind Provider Registry, default to Gemini.
- **Rationale:** Prevents hard lock-in to Google if users prefer Voyage or OpenAI.
- **Official Evidence:** Vercel AI SDK Core (Jul 2026) provides a unified `embed` interface.
- **Operational Cost:** Varies by provider.
- **Risk:** Different providers have different vector dimensions (e.g., 768 vs 1536), requiring dynamic Qdrant collection sizing.
- **Owner:** AI Lead
- **Deadline:** Before Phase B3.
- **Blocked Phase:** Phase B3 (Hybrid Retrieval).
