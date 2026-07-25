# Acceptance Criteria

To ensure Tessarion meets its rigid architectural and product goals, the following objective gates must be passed.

## Architecture & Agent Orchestration
- **No Unvalidated Writes:** No LangGraph workflow writes AI model output to the canonical Postgres database without passing a deterministic validation node.
- **Workflow Isolation:** Cognitive logic resides entirely within LangGraph. Background async tasks (document parsing) reside entirely within Inngest.
- **Human-in-the-Loop:** At least one workflow (Socratic Tutor) successfully pauses execution, waits for human input, and resumes via a LangGraph checkpoint.

## Tools, Retrieval, and Graph
- **Workspace Authorization:** Every write tool enforces a strict `workspaceId` authorization check before execution.
- **Bounded Traversal:** Neo4j graph traversal tools strictly enforce maximum depth (3) and node count limits (50).
- **Qdrant Filtering:** Every Qdrant semantic/sparse query includes a hard `workspaceId` filter.
- **Evidence Linking:** Every persisted mastery decision references specific chunk IDs or explicitly flags an insufficiency of evidence.

## Memory and Prompts
- **Stale Memory Purge:** Deleting a document successfully cascades and deletes associated semantic memories in Qdrant and Neo4j nodes.
- **Traceable Prompts:** Every OpenTelemetry workflow trace explicitly logs the `promptId` and `version` used.
- **Regression Pass:** No production prompt is promoted to a new version without passing the offline deterministic evaluation suite.

## Evaluation and Observability
- **Socratic Compliance:** The tutor evaluation suite measures and flags violations of the "one-question rule" and premature answer generation. Zero regressions allowed.
- **Invalid Tool-Call Rate:** Production telemetry alerts if invalid tool-calls exceed 1%.
- **OTEL Completeness:** A trace is automatically flagged as invalid if an LLM span lacks `app.workspace.id`.

## Frontend, Accessibility, and Security
- **Graceful Degradation:** Public marketing and documentation pages render completely without requiring Supabase database access.
- **Navigational Integrity:** Site navigation (navbar/footer) appears exactly once per page.
- **Accessibility & Motion:** The application fully supports `prefers-reduced-motion` CSS queries, immediately resolving all Framer Motion animations to `duration: 0`.
- **Visual Strictness:** No pure white (`#FFFFFF`) or pure black (`#000000`) dominant surfaces exist. Colors strictly adhere to the defined notebook tokens.
- **State Robustness:** All critical product routes have dedicated loading (`Suspense`), error (`error.tsx`), and empty states. No page has unexplained massive whitespace.

## Developer Experience
- **Documentation Completeness:** All 19 required documentation subpages exist and are populated with actual technical content.
- **Local Infra Parity:** Local development is fully supported via Docker Compose for Neo4j, Qdrant, and Phoenix, matching production topology.
