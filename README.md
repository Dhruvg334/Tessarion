# Tessarion

Tessarion is an AI-powered deep learning workspace where students learn by teaching.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Zustand, TanStack Query, Cytoscape.js, Radix UI, Tailwind/CSS modules.
- **Backend:** Next.js Route Handlers, Inngest (durable workflows).
- **Database:** Supabase (PostgreSQL, pgvector, Auth, Storage).
- **AI:** Google Gemini via Vercel AI SDK.

## Setup Instructions

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Copy `.env.example` to `.env.local` and fill in the required values.
   *Note: Secrets and private docs are never committed to this repository.*
4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Development Commands
- `npm run dev`: Start local server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
- `npm run typecheck`: Run TypeScript compilation check.
