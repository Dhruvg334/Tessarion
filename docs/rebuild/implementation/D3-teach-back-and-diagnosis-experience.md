# Rebuild D3 — Teach-Back and Diagnosis Experience

## Scope

D3 rebuilds the learner-facing teach-back flow without changing the existing persistence, diagnosis, mastery, review, or tutoring contracts.

## Implemented experience

- A two-column explanation composer with source context and response-quality guidance.
- Character and word counts bound to the existing security limit.
- Explicit progress states for session creation, explanation persistence, and evidence evaluation.
- Safe API error parsing instead of generic failures or console-only errors.
- A structured diagnosis report separating grounded coverage, gaps, unsupported claims, evidence references, and execution status.
- Clear mastery-state reasoning rather than a standalone status badge.
- A Socratic follow-up card that explains which unresolved point it targets.
- A bounded handoff into guided tutoring with visible startup failures.
- Retry and return actions that preserve a recoverable learner flow.

## Reliability boundaries

- No mastery or review state is changed in the client.
- The client submits through the authenticated teach-back routes and renders their validated result.
- Provider errors and database internals are not shown to the learner.
- A failed tutor handoff does not discard the completed diagnosis report.
- The existing 5,000-character teach-back limit remains enforced on both client and server.

## Deferred

- Streaming node-by-node workflow progress.
- Direct evidence-chunk inspection from the diagnosis drawer.
- Teach-back attempt history and comparison.
- Persistent draft recovery.
