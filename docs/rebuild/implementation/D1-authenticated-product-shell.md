# Rebuild D1 — Authenticated Product Shell

## Scope

D1 establishes a coherent authenticated navigation architecture without changing the learning-domain services. The notebook now has one persistent navigation rail, one main work surface, and an optional context rail.

## Implemented

- Workspace rail for Study Board, Sources, Knowledge Graph, Teach-back, Reviews, and Activity.
- Secondary routes for source creation and settings.
- Responsive horizontal navigation on smaller screens.
- A compact notebook summary strip within the main work surface.
- Optional right context rail for system readiness and graph preview.
- Shared shell use on the source-entry, settings, and legacy session routes.
- Legacy audit route redirected to the canonical Activity panel.
- Source-entry page rebuilt with bounded guidance, clearer status messages, and consistent actions.
- Settings and old session pages changed from misleading placeholders to truthful current-state screens.

## Navigation contract

The notebook root remains `/workspace/[id]`. Learning areas are selected with the `panel` query parameter so existing links and service behavior remain compatible. Dedicated routes are retained only for operations that need their own page, such as source entry and settings.

## Responsive behavior

Desktop uses three possible columns: notebook navigation, work surface, and context. At medium widths, context moves below the work surface. On mobile, notebook navigation becomes a horizontally scrollable tab row and the entire product becomes single-column.

## Deferred

- Dedicated source-inspector route.
- Dedicated evidence and trace inspectors.
- Full settings lifecycle operations.
- Keyboard command palette.
- Persistent shell state across route groups.
