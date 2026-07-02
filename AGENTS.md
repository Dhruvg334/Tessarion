# Tessarion - Agent Instructions

## Project Overview
- **Name:** Tessarion
- **Summary:** An AI-powered deep learning workspace where students learn by teaching. Includes knowledge graphs, concept-level mastery tracking, and RAG over student-uploaded material.

## Stack Summary
- Next.js 15 (App Router), TypeScript, Supabase (Postgres, Auth, Storage, pgvector), Gemini, Vercel AI SDK, Inngest, Zustand, TanStack Query, Cytoscape.js, Radix UI, Framer Motion.

## Folder Structure
- `/app`: Next.js App Router pages and API routes.
- `/components`: UI, layout, and feature-specific React components.
- `/lib`: Core business logic, Supabase clients, AI tasks, orchestration, validation, errors.
- `/inngest`: Durable background workflows.
- `/stores`: Zustand client state.
- `/types`: Shared TypeScript definitions.
- `/docs/private`: Private planning docs (ignored by Git).
- `/.skills`: Reusable agent skills.

## Coding Standards
- **TypeScript:** Strict mode is mandatory. Avoid `any`. Use Zod for runtime validation.
- **Environment Variables:** Never commit secrets. Server-only secrets stay on the server. Client variables must use `NEXT_PUBLIC_`.
- **Security:** Use Supabase RLS. Service role key is STRICTLY backend-only.
- **Supabase:** Use specific clients (`browser.ts`, `server.ts`, `service-role.ts`) appropriately.
- **Gemini & AI SDK:** Define structured outputs with Zod. Do not use LangChain. Use Flash for volume, Pro for reasoning.
- **Agentic AI Architecture:** Follow the one-true-agent (orchestrator) and many-AI-tasks model.
- **RAG:** Ground answers in source material using pgvector.

## Git Hygiene
- **DO NOT COMMIT:** `.env`, `.env.local`, `docs/private/`, `docs/drafts/`, `.skills/private/`, `.skills/drafts/`, node modules, build output, cache, personal instructions, or prompts.
- **DO COMMIT:** Public-safe source code, config files, `AGENTS.md`, `.env.example`, `README.md`.

## Testing & Reporting
- Code must pass `npm run typecheck` and `npm run lint`.
- Report changes clearly after completing work.
