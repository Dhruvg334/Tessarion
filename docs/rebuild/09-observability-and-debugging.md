# Observability and Debugging

Tessarion implements comprehensive OpenTelemetry (OTEL) tracing to ensure cognitive workflows are auditable and debuggable.

## 1. Span Schemas and Propagation

Traces propagate context automatically through the Next.js Edge, Node.js background workers, and LangGraph executors using W3C Trace Context headers.

### Span Attributes Contract
Every AI-related span must adhere to the semantic conventions:
- `trace.id` / `span.id`: Standard OTEL identifiers.
- `app.workspace.id`: Bounded UUID of the workspace.
- `app.workflow.name` & `app.workflow.version`: e.g., `socratic-tutor`, `v1.2.0`.
- `app.prompt.id` & `app.prompt.version`: Pinpoints exact instruction set.
- `llm.provider`, `llm.model`, `llm.usage.prompt_tokens`, `llm.usage.completion_tokens`.
- `retrieval.strategy`, `retrieval.candidate_count`, `retrieval.selected_chunk_ids`.
- `graph.path_length`, `graph.relationship_types`.

## 2. Sampling and Retention

- **Production Sampling:** 100% of failed workflows, 10% of successful workflows (adjustable via Env).
- **Local Development:** 100% sampling. Exported to a local OTEL collector or Phoenix container.
- **Retention:** Traces are kept for 30 days in the telemetry backend. Critical failure traces used for evaluation are promoted to permanent JSON fixtures in the repository `eval/` datasets.

## 3. Redaction and Privacy

- **Redacted (Never Exported):** Passwords, API Keys, Authorization headers.
- **Scrubbed:** Learner PII must be scrubbed before a trace is promoted to the `eval/` datasets. 
- **Trace Completeness Criteria:** A trace is invalid (and raises a telemetry error) if it includes an LLM call without an `app.workspace.id` or `app.prompt.version`.

## 4. Failure Behavior

If the telemetry backend (e.g., Phoenix) is unreachable, the application **must not crash**. OTEL exporters are configured with `timeoutMillis: 1000` and silently drop spans if the backend is down to protect the core learner experience.

## 5. Tracing Backend Comparison (Based on Official Docs)

| Feature | Phoenix (Arize) | LangSmith | Vanilla OpenTelemetry |
| :--- | :--- | :--- | :--- |
| **Documentation Source** | docs.arize.com/phoenix (Jul 2026) | docs.smith.langchain.com (Jul 2026) | opentelemetry.io/docs (Jul 2026) |
| **Native LangGraph Support**| Yes via `LlamaIndex` / OTEL | Yes (First-party) | Requires custom instrumentation |
| **Self-Hosting Cost** | Open Source (Free) | Enterprise Only | Open Source (Free) |
| **Local Development** | Excellent (Local container) | Dependent on Cloud | Complex (Jaeger setup) |
| **Evaluation Integration** | Built-in trace evals | Built-in | None out-of-the-box |
| **Lock-in Risk** | Low (uses standard OTEL) | High (Proprietary format) | Zero |

**Recommendation:** Arize Phoenix is the primary target due to its strong local-first UX and native OTEL support, perfectly matching the open-source ethos of Tessarion while providing LangSmith-level LLM visibility.
