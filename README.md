# Tessarion

Tessarion is a source-grounded learning workspace for building durable understanding from study material. Learners add source content, inspect an extracted concept graph, explain ideas through teach-back, receive evidence-backed feedback, and use guided review or Socratic tutoring to close gaps.

## Core Learning Loop

1. **Add source material** — paste or upload study content into a notebook.
2. **Build the concept graph** — extract concepts, prerequisites, and relationships from the source.
3. **Teach back a concept** — explain the concept in your own words.
4. **Detect gaps** — compare the explanation against source evidence and identify missing ideas, unsupported claims, or misconceptions.
5. **Update mastery evidence** — record traceable mastery signals from teach-back feedback.
6. **Schedule review** — create deterministic review recommendations from mastery state and signal history.
7. **Use Socratic tutoring** — work through misconceptions or weak links one question at a time.
8. **Retry teach-back** — tutoring prepares the learner; teach-back remains the evidence source for mastery.

## Architecture

- **Frontend:** Next.js App Router, React, TypeScript
- **Database:** Supabase PostgreSQL with RLS and pgvector-ready retrieval foundations
- **AI orchestration:** Vercel AI SDK with provider-pluggable task boundaries
- **Evaluation:** Offline deterministic eval harnesses for retrieval, concept extraction, teach-back, mastery, review, and tutoring
- **UI system:** neutral notebook interface using paper, ink, and ruled-line styling

## Learning Systems

### Source-grounded concept graph

Tessarion chunks source material and extracts concepts with source references. The graph is used to help learners inspect the structure of a topic before teaching it back.

### Teach-back evaluator

The teach-back flow asks the learner to explain a concept. Feedback is grounded in available source chunks and records gaps, unsupported claims, and misconceptions.

### Mastery ledger

Mastery is not a simple score. Tessarion stores traceable mastery signals and derives a current state such as `partial`, `understood`, `needs_review`, or `misconception` from evidence.

### Review scheduling

Review items are generated from mastery evidence. The queue is deterministic and idempotent: one active review per concept, with stale items updated or suspended instead of duplicated.

### Socratic tutoring

Tutoring is guided practice, not a shortcut to mastery. The tutoring policy chooses a pedagogical move, then asks one source-grounded question at a time. Completing tutoring prompts the learner to retry teach-back instead of directly marking mastery as understood.

## Evaluation Harnesses

The repository includes local scripts for checking core behavior without external provider calls in CI:

```bash
npm run eval:rag
npm run eval:concepts
npm run eval:teachback
npm run eval:mastery
npm run eval:review
npm run eval:tutoring
```

These scripts measure retrieval quality, concept extraction, feedback strictness, mastery-state behavior, review lifecycle behavior, and tutoring policy behavior against deterministic fixtures and thresholds.

## Local Setup

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
copy .env.example .env.local
```

Required environment variables include:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Start the local database when running Supabase-backed flows:

```bash
npx supabase start
npx supabase db reset
npx supabase status
```

Run the development server:

```bash
npm run dev
```

## Scripts

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm audit --audit-level=moderate
```

## Status

The core product loop is integrated: source ingestion, concept graph, teach-back, mastery evidence, review scheduling, and guided tutoring. Current work focuses on reliability, security hardening, deployment readiness, and final product polish.

- **Observability:** Strict, privacy-focused operational event logging for debugging and workspace transparency. See [Observability Model](docs/public-observability-model.md).
- **Security:** Rate limiting and payload constraints on all high-risk routes. See [Security Model](docs/public-security-model.md).
