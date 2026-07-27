import type { DocsDiagramSpec } from '@/components/docs/docs-diagram';

export type DocsSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  note?: string;
  diagram?: DocsDiagramSpec;
};

export type DocsPage = {
  slug: string;
  title: string;
  summary: string;
  group: 'System' | 'Learning' | 'Quality' | 'Status';
  status: 'Implemented' | 'Foundation implemented' | 'Deployment-ready' | 'Planned';
  sections: DocsSection[];
};

const architectureDiagram: DocsDiagramSpec = {
  title: 'System responsibility map',
  description: 'Postgres owns canonical learner data. Retrieval, graph, checkpoints, and traces have narrower responsibilities.',
  nodes: [
    { id: 'ui', label: 'Next.js product', group: 'primary' },
    { id: 'services', label: 'Domain services', group: 'workflow' },
    { id: 'workflows', label: 'Stateful workflows', group: 'workflow' },
    { id: 'postgres', label: 'Supabase / Postgres', group: 'primary' },
    { id: 'qdrant', label: 'Qdrant retrieval', group: 'derived' },
    { id: 'neo4j', label: 'Neo4j projection', group: 'derived' },
    { id: 'traces', label: 'Operational traces', group: 'derived' },
  ],
  edges: [
    { source: 'ui', target: 'services', label: 'authenticated request' },
    { source: 'services', target: 'workflows', label: 'orchestration' },
    { source: 'services', target: 'postgres', label: 'canonical writes' },
    { source: 'workflows', target: 'qdrant', label: 'retrieval' },
    { source: 'workflows', target: 'neo4j', label: 'graph context' },
    { source: 'workflows', target: 'traces', label: 'safe spans' },
    { source: 'postgres', target: 'qdrant', label: 'rebuildable index' },
    { source: 'postgres', target: 'neo4j', label: 'rebuildable graph' },
  ],
};

const learningLoopDiagram: DocsDiagramSpec = {
  title: 'Evidence-linked learning loop',
  description: 'A learner explanation creates evidence. The system chooses the next action from that evidence.',
  nodes: [
    { id: 'source', label: 'Source material', group: 'evidence' },
    { id: 'concepts', label: 'Concept model', group: 'derived' },
    { id: 'teachback', label: 'Teach-back', group: 'workflow' },
    { id: 'diagnosis', label: 'Gap diagnosis', group: 'workflow' },
    { id: 'tutor', label: 'Socratic tutor', group: 'workflow' },
    { id: 'review', label: 'Review queue', group: 'primary' },
    { id: 'retry', label: 'New teach-back', group: 'workflow' },
  ],
  edges: [
    { source: 'source', target: 'concepts' },
    { source: 'concepts', target: 'teachback' },
    { source: 'teachback', target: 'diagnosis' },
    { source: 'diagnosis', target: 'tutor', label: 'repair' },
    { source: 'diagnosis', target: 'review', label: 'reinforce' },
    { source: 'tutor', target: 'retry' },
    { source: 'review', target: 'retry' },
    { source: 'retry', target: 'diagnosis' },
  ],
};

const retrievalDiagram: DocsDiagramSpec = {
  title: 'Hybrid retrieval and graph augmentation',
  description: 'Dense and sparse candidates are fused, graph context is bounded, and the final evidence bundle is validated.',
  nodes: [
    { id: 'query', label: 'Learner query', group: 'primary' },
    { id: 'dense', label: 'Dense search', group: 'derived' },
    { id: 'sparse', label: 'Sparse search', group: 'derived' },
    { id: 'fusion', label: 'Rank fusion', group: 'workflow' },
    { id: 'graph', label: 'Graph expansion', group: 'derived' },
    { id: 'rerank', label: 'Rerank', group: 'workflow' },
    { id: 'evidence', label: 'Evidence bundle', group: 'evidence' },
  ],
  edges: [
    { source: 'query', target: 'dense' },
    { source: 'query', target: 'sparse' },
    { source: 'dense', target: 'fusion' },
    { source: 'sparse', target: 'fusion' },
    { source: 'fusion', target: 'graph' },
    { source: 'graph', target: 'rerank' },
    { source: 'rerank', target: 'evidence' },
  ],
};

const agenticDiagram: DocsDiagramSpec = {
  title: 'Agentic workflow boundary',
  description: 'Stateful workflows coordinate retrieval, tools, validation, persistence, and interruption. Deterministic services retain authority over scoring and writes.',
  nodes: [
    { id: 'state', label: 'Typed workflow state', group: 'primary' },
    { id: 'router', label: 'Conditional router', group: 'workflow' },
    { id: 'tools', label: 'Authorized tools', group: 'workflow' },
    { id: 'memory', label: 'Checkpoint memory', group: 'derived' },
    { id: 'validator', label: 'Validation node', group: 'evidence' },
    { id: 'services', label: 'Deterministic services', group: 'primary' },
    { id: 'trace', label: 'Trace and events', group: 'derived' },
  ],
  edges: [
    { source: 'state', target: 'router' },
    { source: 'router', target: 'tools' },
    { source: 'tools', target: 'validator' },
    { source: 'validator', target: 'services' },
    { source: 'services', target: 'state', label: 'bounded result' },
    { source: 'state', target: 'memory', label: 'checkpoint' },
    { source: 'router', target: 'trace', label: 'node span' },
  ],
};

const evaluationDiagram: DocsDiagramSpec = {
  title: 'Controlled improvement cycle',
  description: 'Reviewed failures become regression cases. Changes are promoted only after the frozen suite passes.',
  nodes: [
    { id: 'failure', label: 'Sanitized failure', group: 'evidence' },
    { id: 'case', label: 'Reviewed dataset case', group: 'primary' },
    { id: 'change', label: 'Bounded change', group: 'workflow' },
    { id: 'suite', label: 'Regression suite', group: 'workflow' },
    { id: 'compare', label: 'Baseline comparison', group: 'derived' },
    { id: 'promote', label: 'Human promotion', group: 'primary' },
  ],
  edges: [
    { source: 'failure', target: 'case' },
    { source: 'case', target: 'change' },
    { source: 'change', target: 'suite' },
    { source: 'suite', target: 'compare' },
    { source: 'compare', target: 'promote' },
  ],
};

export const docsPages: DocsPage[] = [
  {
    slug: 'overview',
    title: 'Product overview',
    summary: 'What Tessarion does, how the learner loop works, and where its boundaries are.',
    group: 'System',
    status: 'Implemented',
    sections: [
      {
        heading: 'What Tessarion does',
        paragraphs: [
          'Tessarion turns source material into an evidence-linked concept model. A learner explains one concept in their own words; the system compares the explanation with source evidence, concept dependencies, prior mastery signals, and tutoring history before selecting the next action.',
          'The product does not reduce understanding to a single score. It records covered ideas, omissions, misconceptions, unsupported claims, evidence references, and the route selected from those findings.',
        ],
        diagram: learningLoopDiagram,
      },
      {
        heading: 'Learner loop',
        steps: [
          'Add a source document or paste focused study material.',
          'Create source-linked chunks and extract concepts and relationships.',
          'Choose a concept and teach it back without copying the source.',
          'Classify coverage, omissions, misconceptions, unsupported claims, and weak prerequisites.',
          'Route to another teach-back, Socratic tutoring, or review.',
          'Record new evidence and repeat.',
        ],
      },
      {
        heading: 'System boundaries',
        bullets: [
          'Postgres owns canonical user, workspace, source, concept, mastery, review, tutoring, and checkpoint records.',
          'Vector and graph systems are derived and rebuildable.',
          'Generated output is validated before it can update learner state.',
          'Tutoring guides recovery but does not mark a concept as understood.',
          'The public demo is deterministic and writes no account data.',
        ],
      },
    ],
  },
  {
    slug: 'architecture',
    title: 'Architecture and infrastructure',
    summary: 'How the product, domain services, persistence, retrieval, graph projection, and traces fit together.',
    group: 'System',
    status: 'Deployment-ready',
    sections: [
      {
        heading: 'Responsibility map',
        paragraphs: ['The presentation layer owns navigation and interaction. Domain services own authorization and transactional rules. Stateful workflows coordinate tasks that require branching, interruption, retry, or memory.'],
        diagram: architectureDiagram,
      },
      {
        heading: 'Canonical and derived data',
        bullets: [
          'Supabase/Postgres: authentication, canonical records, RLS, checkpoints, operational events, and source metadata.',
          'Qdrant: dense and sparse retrieval points derived from source chunks.',
          'Neo4j: derived prerequisite, dependency, contrast, and misconception paths.',
          'OTLP-compatible collector: safe spans containing IDs, versions, timing, retries, and validation outcomes.',
        ],
        note: 'A failure in a derived store must reduce retrieval or graph capability without corrupting canonical learner data.',
      },
      {
        heading: 'Deployment topology',
        paragraphs: ['The Next.js product runs on Vercel. Supabase hosts authentication and canonical data. Qdrant Cloud and Neo4j AuraDB host derived indexes. Inngest coordinates durable background work. Phoenix or another OTLP collector receives safe traces.'],
      },
    ],
  },
  {
    slug: 'agentic-system',
    title: 'Agentic system',
    summary: 'How Tessarion implements stateful orchestration, typed tools, memory, interruption, and controlled improvement.',
    group: 'System',
    status: 'Foundation implemented',
    sections: [
      {
        heading: 'What counts as an agentic workflow',
        paragraphs: [
          'Tessarion uses an agentic workflow only when a task needs state, conditional routing, tool selection, interruption, resume, or multi-step validation. Extraction, scoring, ranking, authorization, and persistence rules remain deterministic services.',
          'Three workflow families are defined: Concept Intelligence, Learning Diagnosis, and Socratic Tutor. Each has typed state, allowed tools, bounded retries, terminal states, checkpoints, and trace events.',
        ],
        diagram: agenticDiagram,
      },
      {
        heading: 'Tools and permissions',
        bullets: [
          'Every tool has Zod input and output schemas.',
          'Workspace and user scope are resolved before execution.',
          'Read and write tools have separate permission and retry policies.',
          'Write tools require idempotency and produce an audit event.',
          'MCP exposure is derived from the internal registry; internal-only tools remain private.',
        ],
      },
      {
        heading: 'Memory and checkpoints',
        bullets: [
          'Working state is stored in workflow checkpoints.',
          'Teach-back and tutor sessions remain canonical in Postgres.',
          'Semantic memory is a derived retrieval projection.',
          'Relational memory is a derived graph projection.',
          'Hidden reasoning is not stored; structured decisions, evidence IDs, and safe summaries are stored.',
        ],
      },
      {
        heading: 'Controlled improvement',
        paragraphs: ['Production workflows do not rewrite their own prompts or policies. A failure is sanitized, added to a reviewed dataset, reproduced offline, compared against a frozen baseline, and promoted only after human review.'],
      },
    ],
  },
  {
    slug: 'learning-system',
    title: 'Retrieval, diagnosis, tutoring, and review',
    summary: 'How evidence is selected and converted into a diagnosis, tutoring route, mastery update, and review decision.',
    group: 'Learning',
    status: 'Foundation implemented',
    sections: [
      {
        heading: 'Hybrid retrieval',
        paragraphs: ['Dense retrieval finds conceptual similarity; sparse retrieval preserves exact terms and identifiers. Candidates are fused, filtered by workspace and document scope, expanded through bounded graph paths, reranked, and checked for sufficiency.'],
        diagram: retrievalDiagram,
        bullets: [
          'Every candidate retains a source chunk ID and canonical document reference.',
          'Graph traversal uses an allow-list, maximum depth, maximum nodes, workspace boundary, and timeout.',
          'The workflow can return insufficient evidence instead of forcing a diagnosis.',
        ],
      },
      {
        heading: 'Teach-back diagnosis',
        steps: [
          'Load the concept, source evidence, prior mastery, and graph context.',
          'Detect grounded coverage, missing concepts, misconceptions, unsupported claims, and shallow explanations.',
          'Require each non-unsupported gap to reference a source chunk or concept.',
          'Calculate mastery and review recommendations with deterministic services.',
          'Persist only validated evidence and select the next action.',
        ],
      },
      {
        heading: 'Socratic tutoring',
        paragraphs: ['The tutor chooses one move at a time: clarification, contrast, evidence request, prerequisite recall, or final reconstruction. It asks one bounded question, evaluates the response, and either continues, escalates, or returns the learner to teach-back.'],
        note: 'Completing tutoring does not prove mastery. A new teach-back is required.',
      },
      {
        heading: 'Mastery and review',
        bullets: [
          'Mastery states summarize evidence; they are not presented as precise certainty percentages.',
          'Severe misconceptions override positive coverage until corrected.',
          'Review priority reflects the diagnosed reason, severity, prior attempts, and evidence quality.',
          'Completing or skipping a review records an action; mastery changes only after new evidence.',
        ],
      },
    ],
  },
  {
    slug: 'quality-and-operations',
    title: 'Evaluation, observability, and recovery',
    summary: 'How the system is measured, debugged, and changed without uncontrolled policy updates.',
    group: 'Quality',
    status: 'Implemented',
    sections: [
      {
        heading: 'Evaluation system',
        paragraphs: ['Versioned datasets cover retrieval, concept extraction, graph traversal, diagnosis, mastery, review, tutoring, tool selection, workflow routing, checkpoints, resilience, security, and integration boundaries.'],
        diagram: evaluationDiagram,
        bullets: [
          'Retrieval: Recall@K, MRR, nDCG, context precision, scope correctness, and insufficiency accuracy.',
          'Diagnosis: route, gap type, mastery state, next action, grounding, and repeatability.',
          'Tutoring: one-question rule, premature-answer rate, policy compliance, and completion routing.',
          'Runtime: checkpoint completeness, interruption/resume, retry correctness, and idempotency.',
        ],
      },
      {
        heading: 'Observability',
        paragraphs: ['Operational events and spans record workflow versions, node transitions, prompt versions, tool calls, evidence IDs, retries, latency, validation outcomes, and safe failure categories. Credentials, raw provider errors, full source documents, and hidden reasoning are excluded.'],
      },
      {
        heading: 'Failure recovery',
        bullets: [
          'Public pages remain available when private infrastructure is unavailable.',
          'Vector and graph projections can be rebuilt from Postgres.',
          'Checkpointed workflows resume from the latest valid state.',
          'Optional notebook panels fail independently.',
          'Recoverable input is preserved after API failure.',
        ],
      },
    ],
  },
  {
    slug: 'security',
    title: 'Security and privacy',
    summary: 'Authentication, RLS, tool permissions, resource limits, and data exposure boundaries.',
    group: 'Quality',
    status: 'Deployment-ready',
    sections: [
      {
        heading: 'Security controls',
        bullets: [
          'Supabase authentication and row-level security protect canonical records.',
          'Private queries are scoped by user and workspace.',
          'Text, title, batch, turn, and retrieval limits protect expensive routes.',
          'Write tools require explicit authorization and idempotency.',
          'Vector and graph queries require workspace filters.',
          'Service-role credentials remain server-only.',
        ],
      },
      {
        heading: 'Data exposure',
        bullets: [
          'Public pages do not require an authenticated Supabase session.',
          'Activity and trace views expose safe events rather than provider payloads or database errors.',
          'The MCP endpoint is disabled unless a server token is configured.',
          'Infrastructure health details are protected by an optional bearer token.',
        ],
      },
    ],
  },
  {
    slug: 'current-status',
    title: 'Current status and planned capabilities',
    summary: 'What is available now, what Tessarion is not, known limitations, and the next product capabilities.',
    group: 'Status',
    status: 'Implemented',
    sections: [
      {
        heading: 'Available now',
        bullets: [
          'Public site, documentation, public demo, authentication, dashboard, and notebook workspace.',
          'Source ingestion, chunking, concept relationships, teach-back, mastery, review, tutoring, evidence, activity, and trace views.',
          'Typed prompts, tools, workflows, checkpoints, hybrid retrieval, graph projection, and OTLP trace export boundaries.',
          'Versioned evaluation suites, CI gates, performance checks, and deployment health routes.',
        ],
      },
      {
        heading: 'What Tessarion is not',
        bullets: [
          'It is not a replacement for a teacher or domain expert.',
          'It does not claim perfect understanding detection.',
          'It does not treat chat completion as mastery.',
          'It does not allow workflows to rewrite and deploy their own policies.',
          'It does not use decorative streaks or fabricated confidence metrics as proof of learning.',
        ],
      },
      {
        heading: 'Known limitations',
        bullets: [
          'Diagnosis quality depends on the quality and scope of the source material.',
          'External retrieval, graph, background-job, and tracing services require configured production credentials.',
          'Evaluation coverage must continue growing across subjects and failure types.',
          'Long-running indexing may require a dedicated worker as workloads grow.',
        ],
      },
      {
        heading: 'Planned capabilities',
        bullets: [
          'Google sign-in.',
          'User-selectable generation providers, beginning with Gemini and Groq.',
          'Flashcards inside the notebook and Anki export.',
          'Structured context books assembled from approved source material.',
          'Online references that can be reviewed and attached to a study source.',
          'A complete Agentic AI demo course showing tools, memory, workflows, evaluation, and traces.',
        ],
      },
    ],
  },
];

export const docsLegacyRedirects: Record<string, string> = {
  'source-pipeline': 'learning-system',
  'hybrid-rag': 'learning-system',
  'knowledge-graph': 'learning-system',
  'agent-orchestration': 'agentic-system',
  'mcp-tools': 'agentic-system',
  'teach-back': 'learning-system',
  'mastery-model': 'learning-system',
  'socratic-tutoring': 'learning-system',
  evaluation: 'quality-and-operations',
  observability: 'quality-and-operations',
  'security-and-status': 'security',
};

export const docsPageBySlug = new Map(docsPages.map((page) => [page.slug, page]));
