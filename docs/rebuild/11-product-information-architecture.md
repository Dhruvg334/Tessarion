# Product Information Architecture

Every route in Tessarion operates under a strict contract defining its responsibilities and UI behaviors.

## Public Routes

### `/` (Landing)
- **Purpose:** Convert visitors by explaining the active-recall philosophy.
- **User Question:** "What is Tessarion and why is it better than a generic chat UI?"
- **Data:** Static marketing copy.
- **Server/Client:** Pure Server Component (Static Generation).
- **States:** No loading/empty/error (static).
- **Navigation:** Standard `SiteShell` (Logo, Docs, About, Login, Signup).
- **Accessibility:** High contrast, ARIA landmarks for hero and feature sections.
- **Mobile:** Stacks vertically.
- **Current Status:** Basic layout exists; needs copy and design token overhaul.

### `/about`
- **Purpose:** Academic background and open-source mission.
- **User Question:** "Who built this and what is their philosophy?"
- **Data:** Static.
- **Server/Client:** Server Component.
- **States:** Static.
- **Current Status:** Exists; needs content expansion.

### `/demo`
- **Purpose:** Interactive deterministic walkthrough of the learning loop.
- **User Question:** "How does this actually work?"
- **Data:** Hardcoded JSON fixtures representing Graph and Diagnosis outputs.
- **Server/Client:** Client Component (interactive stepper).
- **Actions:** 'Next step', 'View underlying trace'.
- **Current Status:** Planned.

### `/docs/*`
- **Purpose:** Deep architectural and usage documentation.
- **Data:** MDX files.
- **Server/Client:** Server Components.
- **Navigation:** Left sidebar TOC, right in-page TOC.
- **Current Status:** Currently flat markdown files. Planned transition to structured system.

## Auth Routes (`/login`, `/signup`)
- **Purpose:** Secure entry.
- **Data:** Form state, Supabase Auth.
- **Server/Client:** Client Components wrapped in Server Layout.
- **Error:** Inline validation and toast notifications.
- **Current Status:** Stable.

## Product Routes (Authenticated)

### `/dashboard`
- **Purpose:** Landing zone for returning learners.
- **User Question:** "What do I need to review today?"
- **Data:** `workspaces` (Postgres), pending `reviews` (Postgres).
- **Server/Client:** Server Component fetching data, passing to Client lists.
- **Loading:** Suspense fallback showing skeleton grid.
- **Empty:** "Create your first workspace."
- **Error:** Local `error.tsx` boundary.
- **Current Status:** Stable routing, UI needs design token update.

### `/workspace/[id]/study`
- **Purpose:** The active study board.
- **Data:** Current Mastery states, recent concepts.
- **Current Status:** Refactoring.

### `/workspace/[id]/sources`
- **Purpose:** Document ingestion.
- **User Question:** "What material is my graph based on?"
- **Data:** `documents` (Postgres).
- **Actions:** Upload PDF/Text, Delete Document.
- **Current Status:** File upload exists; needs Inngest integration for async feedback.

### `/workspace/[id]/graph`
- **Purpose:** Visual concept knowledge graph viewer.
- **User Question:** "How do these concepts relate?"
- **Data:** Subgraph from Neo4j (via API).
- **Server/Client:** Client Component (`reactflow` or similar).
- **Loading:** Spinner over empty canvas.
- **Current Status:** Planned (currently using generic UI).

### `/workspace/[id]/teach-back`
- **Purpose:** Initiate active recall.
- **User Question:** "Let me explain X to see if I understand it."
- **Data:** `concepts` list for selection.
- **Actions:** Submit text explanation.
- **Current Status:** Exists, but relies on stateless backend. Needs LangGraph wiring.

### `/workspace/[id]/tutor/[sessionId]`
- **Purpose:** Active Socratic tutoring thread.
- **User Question:** "Help me fix my misconception without giving me the answer."
- **Data:** `tutoring_session` history, streaming LLM response.
- **Server/Client:** Client Component utilizing `ai/react` streaming.
- **Loading:** Typing indicator.
- **Current Status:** Exists but lacks durable state and strict Socratic evaluation.
