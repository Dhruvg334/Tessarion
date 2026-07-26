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
  group: 'System' | 'Learning' | 'Quality';
  status: 'Implemented' | 'Foundation implemented' | 'Deployment-ready';
  sections: DocsSection[];
};

const architectureDiagram: DocsDiagramSpec = {
  title: 'System responsibility map',
  description: 'Canonical records stay in Postgres. Retrieval, graph, checkpoints, and traces are derived or operational layers with bounded authority.',
  nodes: [
    { id: 'ui', label: 'Next.js product', group: 'primary' },
    { id: 'services', label: 'Domain services', group: 'workflow' },
    { id: 'workflows', label: 'Stateful workflows', group: 'workflow' },
    { id: 'postgres', label: 'Supabase / Postgres', group: 'primary' },
    { id: 'qdrant', label: 'Qdrant index', group: 'derived' },
    { id: 'neo4j', label: 'Neo4j projection', group: 'derived' },
    { id: 'traces', label: 'Operational traces', group: 'derived' },
  ],
  edges: [
    { source: 'ui', target: 'services', label: 'authenticated request' },
    { source: 'services', target: 'workflows', label: 'bounded orchestration' },
    { source: 'services', target: 'postgres', label: 'canonical writes' },
    { source: 'workflows', target: 'qdrant', label: 'retrieval' },
    { source: 'workflows', target: 'neo4j', label: 'graph context' },
    { source: 'workflows', target: 'traces', label: 'safe spans' },
    { source: 'postgres', target: 'qdrant', label: 'rebuildable projection' },
    { source: 'postgres', target: 'neo4j', label: 'rebuildable projection' },
  ],
};

const learningLoopDiagram: DocsDiagramSpec = {
  title: 'Evidence-linked learning loop',
  description: 'A learner action creates evidence. The system chooses the next action from that evidence rather than from a generic score.',
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
    { source: 'diagnosis', target: 'tutor', label: 'misconception / missing link' },
    { source: 'diagnosis', target: 'review', label: 'reinforcement' },
    { source: 'tutor', target: 'retry', label: 'repair completed' },
    { source: 'review', target: 'retry', label: 'review completed' },
    { source: 'retry', target: 'diagnosis' },
  ],
};

const retrievalDiagram: DocsDiagramSpec = {
  title: 'Hybrid retrieval and graph augmentation',
  description: 'Dense and sparse candidates are fused, graph-supported evidence is added within strict bounds, and the final context is validated for sufficiency.',
  nodes: [
    { id: 'query', label: 'Learner query', group: 'primary' },
    { id: 'dense', label: 'Dense search', group: 'derived' },
    { id: 'sparse', label: 'Sparse search', group: 'derived' },
    { id: 'fusion', label: 'Rank fusion', group: 'workflow' },
    { id: 'graph', label: 'Bounded graph expansion', group: 'derived' },
    { id: 'rerank', label: 'Deterministic rerank', group: 'workflow' },
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

const evaluationDiagram: DocsDiagramSpec = {
  title: 'Controlled improvement cycle',
  description: 'Failures become reviewed regression cases. Changes are promoted only after the complete frozen suite passes.',
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
    { source: 'compare', target: 'change', label: 'regression found' },
  ],
};

export const docsPages: DocsPage[] = [
  {
    slug: 'overview',
    title: 'Product and system overview',
    summary: 'The learning problem, the complete learner loop, system responsibilities, and the boundaries Tessarion enforces.',
    group: 'System',
    status: 'Implemented',
    sections: [
      {
        heading: 'What Tessarion does',
        paragraphs: [
          'Tessarion turns source material into an evidence-linked model of what a learner is trying to understand. The learner explains a concept in their own words; the system compares that explanation with source evidence, concept dependencies, prior learning signals, and tutoring history before recommending what should happen next.',
          'The product is not a generic chat surface. Each important action has a defined input, a bounded workflow, a validation boundary, and a traceable result. When evidence is not strong enough, the system records insufficiency rather than manufacturing confidence.',
        ],
        diagram: learningLoopDiagram,
      },
      {
        heading: 'The learner loop',
        steps: [
          'Add a source document or paste structured study material.',
          'Create evidence-preserving chunks and extract candidate concepts.',
          'Choose a concept and explain it without looking at the source.',
          'Detect missing ideas, misconceptions, unsupported claims, or weak prerequisite links.',
          'Route the learner to another teach-back, guided tutoring, or review.',
          'Record new evidence and repeat until the concept can be explained with stronger grounding.',
        ],
      },
      {
        heading: 'System boundaries',
        bullets: [
          'Postgres owns canonical user, workspace, source, concept, mastery, review, and tutoring records.',
          'Vector and graph systems are derived projections that can be rebuilt from canonical data.',
          'Model output is validated before it can update learner state.',
          'Tutoring guides recovery but does not directly mark a concept as understood.',
          'Public pages and the public demo do not require an authenticated Supabase session.',
        ],
      },
    ],
  },
  {
    slug: 'architecture',
    title: 'Architecture and infrastructure',
    summary: 'How Next.js, Supabase, workflows, tools, hybrid retrieval, graph projection, checkpoints, and observability fit together.',
    group: 'System',
    status: 'Deployment-ready',
    sections: [
      {
        heading: 'Responsibility map',
        paragraphs: [
          'The presentation layer owns navigation, input collection, loading states, and evidence display. Domain services own authorization, validation, and transactional rules. Stateful workflows coordinate tasks that need branching, interruption, retry, or memory. They do not replace deterministic services.',
        ],
        diagram: architectureDiagram,
      },
      {
        heading: 'Canonical and derived data',
        bullets: [
          'Supabase/Postgres: authentication, canonical records, RLS, checkpoints, operational events, and source storage metadata.',
          'Qdrant: dense and sparse retrieval points derived from source chunks and semantic memory.',
          'Neo4j: a derived projection for prerequisites, dependencies, contrasts, and misconception paths.',
          'Trace collector: safe operational spans containing IDs, versions, timings, retries, and validation outcomes.',
        ],
        note: 'A failure in a derived store must degrade retrieval or graph features without corrupting canonical learner data.',
      },
      {
        heading: 'Workflow and tool execution',
        paragraphs: [
          'Typed tools enforce Zod input/output contracts, workspace scope, timeout, idempotency, and audit policy. Checkpointed workflows persist transitions so an interrupted tutor or diagnosis run can resume from a known state instead of replaying uncontrolled work.',
        ],
        steps: [
          'Authenticate and resolve workspace ownership.',
          'Load canonical context and select an allowed workflow.',
          'Execute only tools permitted for the active workflow node.',
          'Validate generated or retrieved output.',
          'Persist the bounded result and emit safe operational events.',
        ],
      },
    ],
  },
  {
    slug: 'learning-system',
    title: 'Retrieval, diagnosis, tutoring, and review',
    summary: 'The full learning engine in one place: evidence selection, graph reasoning, teach-back diagnosis, tutoring policy, mastery, and review.',
    group: 'Learning',
    status: 'Foundation implemented',
    sections: [
      {
        heading: 'Hybrid retrieval',
        paragraphs: [
          'Dense retrieval finds conceptual similarity; sparse retrieval preserves exact terms, identifiers, and uncommon phrases. Their ranked candidates are fused, filtered by workspace and document scope, optionally expanded through evidence-bearing graph paths, reranked, and checked for sufficiency.',
        ],
        diagram: retrievalDiagram,
        bullets: [
          'Every candidate retains a source chunk ID and canonical document route.',
          'Graph traversal is bounded by relationship allow-list, workspace, maximum depth, maximum nodes, and timeout.',
          'The workflow can return insufficient evidence instead of forcing a diagnosis.',
        ],
      },
      {
        heading: 'Teach-back diagnosis',
        steps: [
          'Load the concept, source evidence, prior mastery, and relevant graph context.',
          'Detect grounded coverage, missing concepts, misconceptions, unsupported claims, and shallow explanations.',
          'Validate that every non-unsupported gap has a source chunk or concept reference.',
          'Calculate mastery and review recommendations with deterministic services.',
          'Select the next action and persist only validated evidence.',
        ],
      },
      {
        heading: 'Socratic tutoring',
        paragraphs: [
          'The tutor chooses one pedagogical move at a time: clarification, contrast, evidence request, prerequisite recall, or final reconstruction. It asks one bounded question, records the learner response, and either continues, escalates, or returns the learner to teach-back.',
          'A completed tutoring session is not treated as proof of mastery. The learner must explain the concept again so the system can evaluate fresh evidence.',
        ],
      },
      {
        heading: 'Mastery and review',
        bullets: [
          'Mastery states are evidence summaries, not percentages presented as certainty.',
          'Severe misconceptions override positive coverage until corrected.',
          'Review priority reflects the diagnosed reason, severity, prior attempts, and evidence quality.',
          'Completing or skipping a review records an action; mastery changes only after new learning evidence.',
        ],
      },
    ],
  },
  {
    slug: 'quality-and-operations',
    title: 'Evaluation, observability, and failure recovery',
    summary: 'How the system is measured, debugged, and improved without autonomous policy changes or hidden operational state.',
    group: 'Quality',
    status: 'Implemented',
    sections: [
      {
        heading: 'Evaluation system',
        paragraphs: [
          'Versioned datasets cover retrieval, concept extraction, graph traversal, diagnosis, mastery, review, tutoring policy, tool selection, workflow routing, checkpoints, resilience, security, and integration boundaries. Deterministic suites run in CI; model-based evaluation can be added without replacing the frozen regression baseline.',
        ],
        diagram: evaluationDiagram,
        bullets: [
          'Retrieval: Recall@K, MRR, nDCG, context precision, scope correctness, and insufficiency accuracy.',
          'Diagnosis: route, gap type, mastery state, next action, grounding, and repeatability.',
          'Tutoring: one-question rule, premature-answer rate, policy compliance, completion routing, and source grounding.',
          'Runtime: checkpoint completeness, interruption/resume, retry correctness, idempotency, and bounded failure.',
        ],
      },
      {
        heading: 'Observability',
        paragraphs: [
          'Operational events and trace spans record workflow versions, node transitions, prompt versions, tool calls, evidence IDs, retry counts, latency, validation outcomes, and safe failure categories. The interface exposes activity and trace timelines without revealing credentials, raw provider errors, full source documents, or hidden reasoning.',
        ],
      },
      {
        heading: 'Failure recovery',
        bullets: [
          'Public pages remain available when Supabase or derived infrastructure is unavailable.',
          'A missing vector or graph projection can be rebuilt from Postgres.',
          'Checkpointed workflows can resume from the latest valid state.',
          'Optional workspace panels fail independently rather than hiding the entire notebook.',
          'API routes return bounded errors and preserve recoverable user input where possible.',
        ],
      },
    ],
  },
  {
    slug: 'security-and-status',
    title: 'Security, deployment, and current status',
    summary: 'Authentication, RLS, tool permissions, deployment topology, implemented capabilities, and honest limitations.',
    group: 'Quality',
    status: 'Deployment-ready',
    sections: [
      {
        heading: 'Security controls',
        bullets: [
          'Supabase authentication and row-level security protect canonical records.',
          'Every private service query is scoped by user and workspace.',
          'Text, title, batch, turn, and retrieval limits protect expensive routes.',
          'Write tools require explicit authorization and idempotency policy.',
          'Vector and graph queries always include workspace filters.',
          'Service-role credentials remain server-only.',
        ],
      },
      {
        heading: 'Deployment topology',
        paragraphs: [
          'The Next.js application deploys to Vercel. Supabase hosts authentication and canonical Postgres data. Qdrant Cloud provides the derived hybrid retrieval index. Neo4j AuraDB provides the derived graph projection. Inngest coordinates durable background work through the deployed Next.js endpoint. Phoenix or another OTLP-compatible collector receives safe traces.',
        ],
      },
      {
        heading: 'Implemented now',
        bullets: [
          'Public site, consolidated documentation, public demo, authentication, dashboard, and notebook workspace.',
          'Source ingestion, chunking, concept and relationship foundations, teach-back, mastery, review, tutoring, evidence, and activity views.',
          'Typed prompts, tools, workflows, checkpoints, MCP protocol core, hybrid retrieval, graph projection, and trace export contracts.',
          'Versioned evaluation suites, integration gates, performance gates, and deployment health endpoints.',
        ],
      },
      {
        heading: 'Current limitations and future work',
        bullets: [
          'External Qdrant, Neo4j, Inngest, and trace collector integrations require production credentials and connectivity validation.',
          'Understanding detection is evidence-bounded and cannot replace teacher judgment.',
          'Evaluation coverage must continue growing with reviewed failures and domain-diverse source material.',
          'Long-running indexing may later move from Vercel functions to a dedicated worker when duration or memory limits require it.',
        ],
      },
    ],
  },
];

export const docsLegacyRedirects: Record<string, string> = {
  'source-pipeline': 'learning-system',
  'hybrid-rag': 'learning-system',
  'knowledge-graph': 'learning-system',
  'agent-orchestration': 'architecture',
  'teach-back': 'learning-system',
  'mastery-model': 'learning-system',
  'socratic-tutoring': 'learning-system',
  evaluation: 'quality-and-operations',
  observability: 'quality-and-operations',
  security: 'security-and-status',
  'current-status': 'security-and-status',
};

export const docsPageBySlug = new Map(docsPages.map((page) => [page.slug, page]));
