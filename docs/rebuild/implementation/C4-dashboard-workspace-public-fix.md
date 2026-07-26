# C4 — Dashboard, workspace reliability, public narrative, and identity

## Scope

This correction pass addresses four product failures found during authenticated testing:

- the dashboard exposed only notebook creation and a minimal card list;
- valid workspaces could be hidden behind a generic not-found screen when an optional projection failed;
- the landing page sections below the hero lacked information hierarchy and system context;
- the About page did not carry the project narrative with enough structure.

It also adds a reusable Tessarion mark and applies the Apache License, Version 2.0.

## Workspace reliability

The workspace route now treats the canonical workspace lookup separately from optional data layers. Only a failed canonical lookup can render the not-found state. Documents, graph projection, review queue, teach-back history, and tutoring history load independently with `Promise.allSettled` and degrade through a bounded status notice.

This prevents a graph, review, or history error from incorrectly presenting an existing workspace as missing.

## Dashboard

The dashboard now exposes the available learning areas for every notebook:

- Study board
- Sources
- Knowledge graph
- Teach-back
- Reviews
- Activity

Notebook rows provide a primary continuation action and direct links to each area. Creation remains available in a compact side panel.

## Public narrative

The landing page retains the requested centered wordmark-only hero. Sections below it now explain:

- the learning problem;
- the complete learning loop;
- the division between source evidence, workflows, and learner actions;
- the system's engineering standards;
- current implementation boundaries.

The About page is centered around the project origin, product thesis, architecture philosophy, implemented foundations, and explicit limitations.

## Identity and licensing

- `app/icon.svg` is the application icon used by Next.js metadata.
- `public/tessarion-mark.svg` is the reusable project mark.
- `LICENSE` contains the Apache License, Version 2.0.
- `NOTICE` preserves project attribution.
- package metadata declares `Apache-2.0`.
