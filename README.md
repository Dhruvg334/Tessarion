# Tessarion

Tessarion is an agent-driven learning platform designed to help users build a mastery of subjects through source-grounded concept extraction, teach-back sessions, and Socratic tutoring.

## Core Learning Loop

1. **Source Ingestion:** Users upload or paste raw text documents. The system parses and chunks this content.
2. **Concept Extraction:** An agent reads the chunks and extracts a semantic knowledge graph of core concepts and prerequisites.
3. **Teach-Back:** The learner selects a concept and explains it in their own words. The system evaluates the explanation strictly against the source material.
4. **Mastery & Review:** Successful explanations generate evidence of understanding, triggering a spaced-repetition review schedule.
5. **Tutoring:** If the learner has misconceptions, a guided, multi-turn Socratic tutoring session helps them discover the right answer without spoon-feeding facts.

## Architecture & Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Database:** Supabase (PostgreSQL, pgvector)
- **AI/LLM Provider:** Google Gemini via Vercel AI SDK
- **Styling:** CSS Modules / Vanilla CSS (strictly neutral palette: ink, paper, canvas)

## Agentic Workflow

Tessarion uses specialized agents for different tasks to ensure reliability and strict source-grounding:
- **Concept Graph Builder:** Extracts nodes and edges from text.
- **Teach-Back Evaluator:** Detects gaps, misconceptions, and missing prerequisites in student explanations.
- **Socratic Tutor:** Decides the pedagogical "next move" (hint, question, summarize) based on the conversation history and concept state, then formulates a response grounded in the source text.

## Evaluation Harnesses

Tessarion includes offline evaluation scripts to measure agent performance against deterministic baselines. These scripts do not call external APIs by default in CI environments:

- \
pm run eval:rag\: Tests vector retrieval accuracy.
- \
pm run eval:concepts\: Tests concept extraction coverage and graph validity.
- \
pm run eval:teachback\: Tests evaluation strictness on known good/bad explanations.
- \
pm run eval:mastery\: Verifies the deterministic ledger of mastery signals.
- \
pm run eval:review\: Tests spaced repetition scheduling logic.
- \
pm run eval:tutoring\: Validates the multi-turn tutor state machine and grounding.

## Local Setup

1. **Install dependencies:**
   \\\ash
   npm install
   \\\

2. **Database (Docker required):**
   \\\ash
   npx supabase start
   \\\

3. **Environment Variables:**
   Copy \.env.example\ to \.env.local\ and fill in the required keys.
   - \NEXT_PUBLIC_SUPABASE_URL\
   - \NEXT_PUBLIC_SUPABASE_ANON_KEY\
   - \SUPABASE_SERVICE_ROLE_KEY\
   - \GOOGLE_GENERATIVE_AI_API_KEY\

4. **Run Development Server:**
   \\\ash
   npm run dev
   \\\

## Available Scripts

- \
pm run dev\: Starts the Next.js development server.
- \
pm run build\: Builds the production application.
- \
pm run lint\: Runs ESLint.
- \
pm run typecheck\: Runs TypeScript compiler checks.
- \
pm run test:run\: Runs unit tests via Vitest.

## Current Status

Tessarion is actively developed. The core learning loop (Ingestion -> Graph -> Teach-Back -> Mastery -> Review -> Tutoring) is fully integrated.
