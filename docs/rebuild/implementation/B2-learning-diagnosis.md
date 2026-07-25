# Rebuild B2 — Learning Diagnosis Workflow Core

## Status

Implemented as an offline, deterministic workflow core. The state, node boundaries, branching, safe failures, step traces, mastery calculation, review calculation, and next-action routing are executable without external providers or databases.

The production LangGraph adapter is intentionally deferred until the dependency and checkpoint-store consolidation step. This avoids changing `package.json` without a synchronized lockfile and keeps intermediate CI installable.

## Flow

`validate_input → validate_evidence → detect_gaps → generate_feedback → calculate_mastery → calculate_review → select_next_action`

Terminal branches:

- `completed`
- `insufficient_evidence`
- `failed`

## Deterministic guarantees

- No external model is required.
- No database is required by the workflow core.
- Source evidence is checked before diagnosis.
- Mastery uses the existing deterministic calculator.
- Review timing uses a fixed clock in the offline workflow to keep regression output stable.
- Every executed node emits a safe step-trace record.
- A hard step limit prevents accidental cycles.

## Integration boundary

A later production adapter will load canonical learner and source state through authorized tools, invoke this workflow through LangGraph state nodes, persist checkpoints, and write validated outcomes transactionally. The current core remains the deterministic fallback and evaluation target.

## Evaluation

Run:

```cmd
npm run eval:diagnosis
```

The suite checks:

- terminal-route accuracy
- mastery-state accuracy
- next-action accuracy
- repeatability across identical runs
