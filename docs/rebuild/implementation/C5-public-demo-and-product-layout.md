# C5 — Public Demo and Product Layout

## Scope

This pass improves the authenticated dashboard and notebook shell, adds a public deterministic demo notebook, expands the landing-page narrative, and makes model/runtime readiness visible without exposing secrets.

## Public demo

`/demo/notebook` is available without authentication. It uses a fixed Computer Memory Hierarchy source and exposes the same conceptual stages as the application:

1. source evidence;
2. concept structure;
3. contrasting teach-back responses;
4. gap and misconception diagnosis;
5. Socratic recovery;
6. review routing;
7. safe execution trace.

The demo is deterministic and writes no account data. It does not claim to be a live provider invocation.

## System readiness

The dashboard and study board now distinguish:

- configured generation provider;
- local deterministic embeddings;
- local deterministic reranking;
- checkpointed workflow runtime;
- checkpoint storage readiness.

This is a configuration/readiness view, not a synthetic success metric. Actual learning runs remain visible through Activity and trace records.

## Layout changes

- Dashboard notebooks use a compact card grid with direct learning-surface links.
- Notebook summary facts share the navigation toolbar instead of occupying a separate full-width band.
- The Study Board uses a primary work column and a smaller contextual rail.
- Graph preview height is bounded on the Study Board.
- The next-action panel no longer uses inline presentation styles.
- Duplicate Teach-Back headings were removed.
