# Rebuild B5 — Concept and Socratic workflow cores

B5 introduces two provider-independent workflow cores. The concept workflow validates source material, extracts and resolves concepts, classifies evidence-backed relationships, rejects ungrounded output, and produces a projection-ready result. The tutor workflow loads bounded session memory, selects a pedagogical move, validates the one-question rule, and returns an explicit interruption checkpoint when learner input is required.

The state and node contracts are deliberately isolated from persistence and transport. A later adapter will compile these nodes into a stateful orchestration runtime with durable checkpoints. Until then, the same policy can be evaluated locally without network services.

## Safety boundaries

- No output is projection-ready without source identifiers and evidence text.
- Tutor output may contain at most one question.
- Tutor sessions stop at a fixed maximum turn count.
- Waiting for learner input is represented as a checkpoint, not a retry loop.
- Neither workflow writes directly to canonical storage.
