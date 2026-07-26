export type DocsSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  note?: string;
};

export type DocsPage = {
  slug: string;
  title: string;
  summary: string;
  group: 'Foundations' | 'Learning system' | 'Operations';
  status: 'Implemented' | 'Foundation implemented' | 'Planned integration';
  sections: DocsSection[];
};

export const docsPages: DocsPage[] = [
  {
    slug: 'architecture',
    title: 'System architecture',
    summary: 'How presentation, domain services, workflows, tools, retrieval, graph projections, persistence, evaluation, and tracing are separated.',
    group: 'Foundations', status: 'Foundation implemented',
    sections: [
      { heading: 'Responsibility boundaries', paragraphs: ['Next.js owns public pages, authenticated product routes, and API boundaries. Postgres owns canonical users, workspaces, sources, learner records, and transactional identifiers. Retrieval indexes, graph projections, checkpoints, and traces are derived systems with recovery paths back to canonical records.'], bullets: ['Presentation never writes learner state directly.', 'Generated output is validated before persistence.', 'Workflows coordinate state; deterministic services calculate bounded outcomes.', 'Derived stores can be rebuilt without changing canonical identity.'] },
      { heading: 'Execution path', steps: ['A route authenticates the user and resolves workspace scope.', 'A domain service validates input and loads canonical records.', 'A workflow selects bounded tools and records state transitions.', 'Retrieval returns evidence IDs rather than untraceable prose.', 'Validation produces a safe decision or explicit insufficiency.', 'Persistence records the outcome and emits operational events.'] },
      { heading: 'Why these boundaries exist', paragraphs: ['The architecture prevents one provider call, index outage, or graph inconsistency from becoming the source of truth. Each layer has a limited authority and an observable failure mode.'], note: 'Implementation status: workflow, tool, checkpoint, retrieval, graph, and trace contracts exist. External infrastructure adapters remain replaceable.' },
    ],
  },
  {
    slug: 'source-pipeline', title: 'Source pipeline', summary: 'From uploaded material to canonical chunks, evidence references, and derived indexes.', group: 'Foundations', status: 'Implemented',
    sections: [
      { heading: 'Input and validation', paragraphs: ['Documents enter through authenticated workspace routes. Titles, content length, and workspace ownership are validated before storage. The source document is canonical; every later concept, diagnosis, and citation must retain a route back to it.'] },
      { heading: 'Chunking', steps: ['Normalize text without changing meaning.', 'Preserve heading and section context.', 'Split at semantic boundaries with bounded overlap.', 'Store chunks with document, workspace, order, and section metadata.', 'Generate content hashes so unchanged chunks are not reprocessed.'] },
      { heading: 'Index projection', paragraphs: ['Embedding and sparse-vector generation create derived retrieval points. Indexing failures do not invalidate ingestion; failed projections can be retried from canonical chunks.'], bullets: ['Postgres: canonical text and IDs', 'Vector store: dense and sparse projections', 'Graph store: evidence-linked relational projection', 'Object storage: original uploaded files when applicable'] },
    ],
  },
  {
    slug: 'hybrid-rag', title: 'Hybrid retrieval', summary: 'Dense, sparse, metadata, graph, fusion, reranking, and evidence sufficiency in one bounded retrieval path.', group: 'Foundations', status: 'Foundation implemented',
    sections: [
      { heading: 'Retrieval route', steps: ['Classify the query intent.', 'Apply workspace and optional document filters.', 'Run dense semantic retrieval.', 'Run sparse lexical retrieval.', 'Fuse ranked candidates.', 'Expand only approved graph relationships within depth and node limits.', 'Rerank and check evidence diversity.', 'Return bounded context or an insufficient-evidence result.'] },
      { heading: 'Why hybrid retrieval', paragraphs: ['Dense search handles paraphrase and conceptual similarity. Sparse search preserves exact terminology, identifiers, and uncommon phrases. Graph traversal answers dependency questions that similarity alone cannot resolve. None is trusted without workspace filters and source provenance.'] },
      { heading: 'Evaluation', bullets: ['Recall@K for expected evidence', 'MRR and nDCG for ranking quality', 'Context precision for irrelevant evidence', 'Workspace isolation correctness', 'Fusion gain over individual retrievers', 'Insufficiency accuracy when evidence is absent'] },
    ],
  },
  {
    slug: 'knowledge-graph', title: 'Knowledge graph', summary: 'Canonical concept records, derived graph projection, evidence-bearing relationships, and bounded traversal.', group: 'Foundations', status: 'Foundation implemented',
    sections: [
      { heading: 'Ownership', paragraphs: ['Postgres owns canonical concept and relationship identifiers. The graph database is a derived traversal projection. This avoids dual ownership while allowing efficient prerequisite, dependency, contrast, and misconception queries.'] },
      { heading: 'Relationship requirements', bullets: ['Both endpoints belong to the same workspace.', 'Every relationship uses an allow-listed type.', 'Evidence references point to canonical source chunks.', 'Confidence and extraction version are retained.', 'Traversal is capped by depth, node count, relationship type, and timeout.'] },
      { heading: 'Failure recovery', paragraphs: ['A stale or unavailable graph projection falls back to canonical relationship records. Projection rebuilds are idempotent and scoped by workspace or document version.'] },
    ],
  },
  {
    slug: 'agent-orchestration', title: 'Workflow orchestration', summary: 'Where stateful workflows are justified, how tools are bounded, and where deterministic services remain preferable.', group: 'Learning system', status: 'Foundation implemented',
    sections: [
      { heading: 'What qualifies as a workflow', paragraphs: ['A task becomes a stateful workflow only when it needs conditional routing, retries, interruption, checkpoint recovery, multiple tools, or multi-turn learner input. One-shot extraction and deterministic calculations remain ordinary functions.'] },
      { heading: 'Core workflows', bullets: ['Concept Intelligence: extract, resolve, validate, and prepare projections.', 'Learning Diagnosis: retrieve evidence, identify gaps, calculate learner state, and select the next action.', 'Socratic Tutor: select one pedagogical move, pause for learner input, evaluate the response, and resume or complete.'] },
      { heading: 'Runtime guarantees', bullets: ['Thread-scoped checkpoints', 'Monotonic sequence numbers', 'Bounded node and tool retries', 'Idempotency keys for writes', 'Explicit terminal and waiting states', 'Deterministic fallback when generation is unavailable'] },
    ],
  },
  {
    slug: 'teach-back', title: 'Teach-back diagnosis', summary: 'How a learner explanation becomes evidence-linked feedback, gaps, mastery signals, and a next action.', group: 'Learning system', status: 'Implemented',
    sections: [
      { heading: 'Diagnosis sequence', steps: ['Load the selected concept and prior learner state.', 'Retrieve source evidence and relevant concept dependencies.', 'Validate that enough evidence exists to judge the explanation.', 'Detect missing concepts, shallow coverage, misconceptions, unsupported claims, and prerequisite gaps.', 'Validate every finding against a chunk or canonical concept reference.', 'Calculate mastery and review recommendations deterministically.', 'Persist the explanation, findings, signals, and workflow trace.'] },
      { heading: 'Evidence rule', paragraphs: ['A positive or negative learning signal must reference source chunks or a canonical concept whose definition is itself grounded. If the evidence is inadequate, the outcome is insufficient evidence rather than a fabricated judgement.'] },
      { heading: 'What the learner sees', bullets: ['What was covered well', 'What is missing or incorrect', 'The evidence behind each finding', 'One focused follow-up', 'The next review or tutoring action'] },
    ],
  },
  {
    slug: 'mastery-model', title: 'Mastery and review', summary: 'A deterministic learner-state model built from evidence-bearing signals rather than opaque percentages.', group: 'Learning system', status: 'Implemented',
    sections: [
      { heading: 'Mastery states', paragraphs: ['The learner model uses named states such as insufficient evidence, emerging, partial, needs review, misconception, and understood. The state is recalculated from the evidence ledger; it is not a free-form model judgement.'] },
      { heading: 'Review scheduling', bullets: ['Severe gaps override prior positive evidence.', 'Understood concepts receive a conservative review cap.', 'Repeated identical inputs remain idempotent.', 'Skipped and completed reviews retain traceability.', 'Only one active schedule is maintained per concept.'] },
      { heading: 'Why no confidence theatre', paragraphs: ['The interface avoids presenting arbitrary five-decimal scores as truth. It shows the state, supporting evidence, recent signals, and the action implied by the scheduling rules.'] },
    ],
  },
  {
    slug: 'socratic-tutoring', title: 'Socratic tutoring', summary: 'A bounded multi-turn recovery workflow that asks one useful question and returns the learner to teach-back.', group: 'Learning system', status: 'Implemented',
    sections: [
      { heading: 'Tutor policy', bullets: ['One question per turn', 'No full answer during early recovery', 'Questions grounded in the selected evidence', 'Escalation when the learner remains stuck', 'Explicit completion decision', 'Tutoring completion does not automatically mark mastery'] },
      { heading: 'Interruption and resume', paragraphs: ['The workflow stores a checkpoint before waiting for the learner. A later response resumes the same thread with the prior gap, evidence, move, and turn history intact.'] },
      { heading: 'Return path', paragraphs: ['A successful tutoring session ends by asking the learner to explain the concept again. The subsequent teach-back—not the tutor conversation—produces the next mastery evidence.'] },
    ],
  },
  {
    slug: 'evaluation', title: 'Evaluation', summary: 'Versioned datasets, deterministic metrics, workflow regression checks, and controlled improvement.', group: 'Operations', status: 'Implemented',
    sections: [
      { heading: 'Dataset families', bullets: ['Retrieval and ranking', 'Concept and relationship extraction', 'Graph traversal', 'Teach-back and gap detection', 'Mastery and review', 'Tutoring policy', 'Workflow routing and checkpoints', 'Tool selection and safety'] },
      { heading: 'Metrics', paragraphs: ['The project reports retrieval metrics, classification accuracy, precision/recall/F1, route accuracy, policy compliance, trace completeness, deterministic repeatability, and failure recovery. Thresholds are tied to versioned fixtures rather than manually selected output examples.'] },
      { heading: 'Controlled improvement', steps: ['Capture a sanitized failure.', 'Classify the failure type.', 'Add or update a reviewed evaluation case.', 'Make a bounded code, prompt, or policy change.', 'Run the complete regression suite.', 'Promote only after the new case passes without unacceptable regressions.'], note: 'The system does not rewrite and deploy its own policies.' },
    ],
  },
  {
    slug: 'observability', title: 'Observability and debugging', summary: 'Safe operational events and trace spans across workflows, tools, retrieval, validation, and persistence.', group: 'Operations', status: 'Foundation implemented',
    sections: [
      { heading: 'Trace hierarchy', bullets: ['Request', 'Workflow', 'Node', 'Model call', 'Tool call', 'Retrieval query', 'Graph query', 'Validation', 'Persistence', 'Final decision'] },
      { heading: 'Recorded safely', paragraphs: ['Traces retain IDs, versions, bounded counts, selected evidence references, latency, retry count, validation outcomes, and safe failure categories. They do not record credentials, raw provider errors, full source documents, or hidden reasoning.'] },
      { heading: 'Operational use', bullets: ['Diagnose where a workflow stopped', 'Compare prompt and workflow versions', 'Inspect evidence selected by retrieval', 'Measure retries and latency', 'Identify projection or persistence failures'] },
    ],
  },
  {
    slug: 'security', title: 'Security boundaries', summary: 'Authentication, RLS, workspace isolation, resource limits, safe errors, tool authorization, and derived-store filters.', group: 'Operations', status: 'Implemented',
    sections: [
      { heading: 'Primary controls', bullets: ['Authenticated server boundaries', 'Row-level security', 'Workspace-scoped service queries', 'Payload and text limits', 'Rate limits on expensive routes', 'Safe normalized errors', 'Read/write tool permissions', 'Workspace filters in vector and graph queries'] },
      { heading: 'Service-role boundary', paragraphs: ['The service-role client is server-only and reserved for controlled operations that require bypassing RLS, such as system event insertion or derived projection work. User-facing reads still verify ownership.'] },
      { heading: 'Failure behaviour', paragraphs: ['When dependencies are unavailable, public pages remain static, authenticated routes return recoverable errors, and derived indexing failures do not corrupt canonical ingestion.'] },
    ],
  },
  {
    slug: 'current-status', title: 'Current implementation status', summary: 'A direct separation between working foundations, active integrations, and later product work.', group: 'Operations', status: 'Implemented',
    sections: [
      { heading: 'Implemented', bullets: ['Supabase authentication, canonical schema, and RLS', 'Source ingestion and chunking', 'Teach-back, mastery, review, and tutoring domain services', 'Typed prompt, tool, workflow, checkpoint, and trace contracts', 'Deterministic hybrid retrieval and graph projection foundations', 'Versioned evaluation runners and CI quality gates'] },
      { heading: 'Foundation implemented; production adapter incomplete', bullets: ['External vector-store deployment', 'External graph-store deployment', 'Framework-specific workflow adapter', 'MCP transport server', 'External trace collector'] },
      { heading: 'Next product work', bullets: ['Complete documentation experience', 'Guided deterministic demo', 'Authenticated workspace redesign', 'Evidence and trace inspectors', 'Performance, accessibility, end-to-end, and deployment verification'] },
    ],
  },
];

export const docsPageBySlug = new Map(docsPages.map((page) => [page.slug, page]));
