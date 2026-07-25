# Rebuild C1–C2: Public Design Foundation

## Scope

This stage replaces the previous sparse marketing shell with a denser editorial system and rebuilds the landing and About pages. It does not change authenticated product logic or backend services.

## Visual system

The public system now uses:

- a pale cream canvas and layered warm paper surfaces;
- charcoal primary text and graphite secondary text;
- warm rule lines rather than cool grey or navy borders;
- compact navigation with a fixed maximum header height;
- explicit content-width and spacing tokens;
- evidence panels, graph relationships, workflow rails, and trace metadata as visual motifs;
- responsive layouts and a reduced-motion override.

Pure white and pure black are no longer dominant public surfaces.

## Landing page

The landing page now contains:

1. a two-column hero with a real product-system visualization;
2. a concise explanation of the evidence-linked learning loop;
3. a five-stage learning process;
4. an architecture-responsibility rail;
5. engineering principles and current-state boundaries;
6. direct routes into the workspace, system documentation, About page, and demo.

No adoption statistics, testimonials, fabricated outputs, or decorative analytics are used.

## About page

The About page now documents:

- the learning problem that motivated Tessarion;
- Dhruv Gupta and the engineering context behind the project;
- the distinction between stateful workflows and deterministic services;
- canonical and derived data ownership;
- implemented product capabilities;
- current limitations and safety boundaries.

A local section navigation keeps the longer page usable without creating excessive vertical whitespace.

## Performance decisions

- Public pages remain server components.
- No animation library is required by these pages.
- The product preview is CSS and SVG only.
- Public pages do not fetch Supabase session or workspace data.
- Shared styles are CSS classes rather than large repeated inline-style objects.

## Deferred

- `/docs/*` documentation routes and navigation;
- the guided deterministic demo;
- authenticated workspace shell and product screens;
- framework package adapters for LangGraph and MCP.
