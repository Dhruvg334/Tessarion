# Rebuild D2 — Sources and Knowledge Graph Experience

## Scope

D2 turns the evidence library and concept graph into practical learning surfaces inside the authenticated notebook shell.

## Sources

The source library now exposes processing state, chunk counts, completed pipeline steps, processed dates, retrieval indexing, concept extraction, and bounded processing errors. Actions remain tied to the existing authenticated API routes and do not create a duplicate processing workflow.

## Knowledge graph

The graph now provides state filters, a compact legend, evidence-linked relationship rendering, selected-concept inspection, and a direct transition into teach-back. Graph styling uses the cream and charcoal design tokens without relying on saturated mastery colours or decorative metrics.

## Reliability boundaries

- Postgres remains canonical for documents, concepts, relationships, and learner records.
- Retrieval and graph projections remain rebuildable derived systems.
- Source actions return bounded messages and do not expose provider or database errors.
- The graph can be inspected without starting a teach-back session.
