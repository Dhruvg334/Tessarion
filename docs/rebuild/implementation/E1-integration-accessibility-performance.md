# Rebuild E1 — Integration, Accessibility, and Route Reliability

## Scope

This stage establishes shared quality gates before deployment work begins. It does not change learning decisions or persistence semantics.

## Implemented

- Keyboard skip navigation across public and authenticated shells.
- Stable `main` landmarks for route focus management.
- Workspace route-level loading and recoverable error boundaries.
- Reduced-motion safeguards for transitions, animation, and smooth scrolling.
- Static integration checks for required public, documentation, demo, icon, license, and workspace-state files.
- Regression tests ensuring the public shell stays independent from Supabase authentication.
- CI execution of the integration quality gate.

## Performance boundary

Public shells remain server-rendered and do not import Supabase. Workspace optional projections continue to degrade independently through `Promise.allSettled`, avoiding a total page failure when one derived subsystem is unavailable.

## Deferred to E2+

- Browser-driven end-to-end testing.
- production route timing and bundle budgets;
- accessibility automation with a browser engine;
- Qdrant, Neo4j, MCP transport, and trace collector deployment verification;
- Vercel and Render deployment configuration.
