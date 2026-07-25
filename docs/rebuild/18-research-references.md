# Research References

This document records the official documentation sources and framework versions consulted to inform the Rebuild A architecture contracts.

## Core Frameworks

1. **Next.js (App Router)**
   - **Version/Date:** v15.x / Accessed Jul 2026
   - **Source:** [nextjs.org/docs](https://nextjs.org/docs)
   - **Key Validations:** Server Components data fetching boundary; `error.tsx` granularity.

2. **Supabase (Postgres)**
   - **Version/Date:** `@supabase/ssr` v0.5.x / Accessed Jul 2026
   - **Source:** [supabase.com/docs](https://supabase.com/docs)
   - **Key Validations:** Canonical ownership policies, Edge-compatible auth refresh.

3. **Inngest**
   - **Version/Date:** v3.x / Accessed Jul 2026
   - **Source:** [inngest.com/docs](https://inngest.com/docs)
   - **Key Validations:** Idempotency keys, multi-step job durability, Vercel timeout bypassing.

## Cognitive & Retrieval Infrastructure

4. **LangGraph.js**
   - **Version/Date:** `@langchain/langgraph` / Accessed Jul 2026
   - **Source:** [langchain-ai.github.io/langgraphjs](https://langchain-ai.github.io/langgraphjs)
   - **Key Validations:** Postgres checkpointer (`@langchain/langgraph-checkpoint-postgres`), state transitions, human-in-the-loop interruption.

5. **Model Context Protocol (MCP)**
   - **Version/Date:** v1.0 / Accessed Jul 2026
   - **Source:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
   - **Key Validations:** URI schema exposure (`workspace://`), Read-only tool scopes.

6. **Qdrant**
   - **Version/Date:** v1.10+ / Accessed Jul 2026
   - **Source:** [qdrant.tech/documentation](https://qdrant.tech/documentation)
   - **Key Validations:** Reciprocal Rank Fusion (RRF), native sparse vector indexing (BM25 payload constraints).

7. **Neo4j**
   - **Version/Date:** v5.x / Accessed Jul 2026
   - **Source:** [neo4j.com/docs](https://neo4j.com/docs)
   - **Key Validations:** `MERGE` query idempotency, traversal depth limitations.

## Telemetry & Evaluation

8. **OpenTelemetry (Node.js/Edge)**
   - **Version/Date:** `@opentelemetry/api` / Accessed Jul 2026
   - **Source:** [opentelemetry.io/docs](https://opentelemetry.io/docs)
   - **Key Validations:** Semantic conventions for GenAI systems, TraceContext propagation.

9. **Arize Phoenix**
   - **Version/Date:** Phoenix OSS / Accessed Jul 2026
   - **Source:** [docs.arize.com/phoenix](https://docs.arize.com/phoenix)
   - **Key Validations:** Self-hosted OTEL ingest compatibility, trace-based evals.

10. **Vercel AI SDK**
    - **Version/Date:** `ai` package / Accessed Jul 2026
    - **Source:** [sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
    - **Key Validations:** `embed` abstraction, `generateObject` Zod integrations.

## Rebuild B1 implementation references

- LangGraph JavaScript persistence and checkpoints: https://docs.langchain.com/oss/javascript/langgraph/persistence
- LangGraph graph API: https://docs.langchain.com/oss/javascript/langgraph/graph-api
- Official MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP TypeScript server guide: https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
- Promptfoo test cases and datasets: https://www.promptfoo.dev/docs/configuration/test-cases/
- Promptfoo assertions and metrics: https://www.promptfoo.dev/docs/configuration/expected-outputs/
- Phoenix TypeScript SDK: https://arize.com/docs/phoenix/sdk-api-reference/typescript/overview
- Phoenix Vercel AI SDK tracing: https://arize.com/docs/phoenix/integrations/typescript/vercel/vercel-ai-sdk-tracing-js
