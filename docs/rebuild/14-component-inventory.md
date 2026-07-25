# Component Inventory & Contracts

## Product Components (Authenticated)

### `TeachBackComposer`
- **Responsibility:** Captures user explanation and submits to diagnosis workflow.
- **Server/Client:** `'use client'`
- **Props:** `{ conceptId: string, onSubmit: (text: string) => Promise<void> }`
- **State:** `text` (string), `isSubmitting` (boolean), `error` (string | null).
- **Dependencies:** None.
- **Accessibility:** `<textarea>` must have `aria-label="Teach back explanation"`. `aria-invalid` tied to error state.
- **Visual Rules:** Simple border, focus ring using `Primary Charcoal`. No dropshadow.
- **Tests:** Vitest/React Testing Library checking form submission and disabled states.

### `DiagnosisPanel`
- **Responsibility:** Renders the outcome of a teach-back session (Mastery level, specific gaps).
- **Server/Client:** Server Component (fetches finalized state from Postgres).
- **Props:** `{ sessionId: string }`
- **State:** N/A
- **Dependencies:** None.
- **Accessibility:** Semantic `<ul>` for gaps.
- **Visual Rules:** Uses `Muted Pencil` for borders.

### `TutorThread`
- **Responsibility:** Renders the multi-turn Socratic chat.
- **Server/Client:** `'use client'`
- **Props:** `{ initialMessages: Message[], sessionId: string }`
- **State:** Utilizes `useChat` from Vercel AI SDK.
- **Dependencies:** `ai/react`
- **Accessibility:** `aria-live="polite"` region for new incoming streaming messages.
- **Visual Rules:** Messages formatted as indented paragraphs. No colorful chat bubbles.
- **Tests:** Mocked stream responses in Vitest.

### `ConceptGraphCanvas`
- **Responsibility:** Visualizes Neo4j nodes and edges.
- **Server/Client:** `'use client'`
- **Props:** `{ initialNodes: Node[], initialEdges: Edge[] }`
- **State:** Pan/Zoom coordinates, selected node ID.
- **Dependencies:** `reactflow` (or similar lightweight canvas).
- **Accessibility:** Must include a visually-hidden accessible list alternative.
- **Visual Rules:** Nodes use `Paper` background, `Primary Charcoal` text, `Rule Line` borders.

## Foundation Components

### `Button`
- **Responsibility:** Standardized click actions.
- **Server/Client:** Agnostic.
- **Props:** Standard HTMLButtonProps + `variant?: 'primary' | 'secondary' | 'ghost'`.
- **State:** N/A.
- **Dependencies:** None.
- **Accessibility:** Native `<button>`.
- **Visual Rules:** No pill shapes (border-radius max 4px). Hover state relies on background dimming.
- **Tests:** Visual regression tests.
