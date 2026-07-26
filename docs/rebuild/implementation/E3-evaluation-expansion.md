# E3 — Evaluation Expansion and Frozen Regression Baseline

## Purpose

E3 strengthens the weakest evaluation areas before infrastructure deployment work. The goal is not to manufacture perfect scores. It is to make regressions visible through versioned, human-reviewed fixtures and deterministic runners.

## Changes

### Foundation dataset

The foundation dataset now contains twelve approved cases spanning workflow routing, tool selection, workspace isolation, evidence grounding, prompt governance, and adversarial source instructions.

`eval:foundation-v2` checks:

- minimum case count;
- human-review approval rate;
- task coverage;
- adversarial-case share;
- critical-case coverage;
- duplicate IDs;
- prohibited-behaviour coverage.

### Graph evaluation

The graph fixture now covers arrays, linked lists, locality, caching, and memory hierarchy. Twelve cases exercise:

- incoming, outgoing, and bidirectional traversal;
- one-hop and multi-hop paths;
- relationship filtering;
- confidence filtering;
- unknown seeds;
- zero-depth traversal;
- evidence provenance;
- forbidden-concept exclusion;
- workspace and depth bounds;
- deterministic repeatability.

### Runtime resilience

`eval:resilience-v2` adds ten deterministic recovery cases:

- transient read retries;
- retry exhaustion;
- no retry for non-idempotent writes;
- single execution for successful writes;
- complete checkpoint history;
- interruption for learner input;
- resume from a checkpoint;
- unknown-step rejection;
- infinite-loop bounding;
- monotonic checkpoint sequences.

### Frozen release baseline

`eval/baselines/rebuild-e3.json` records minimum case counts for ten release suites. `eval:release-v1` fails if a suite disappears or falls below the agreed floor.

The baseline is intentionally conservative. It prevents silent test removal; it does not imply that the datasets cover every subject, failure mode, or model behaviour.

## CI

CI now runs:

```text
npm run eval:foundation-v2
npm run eval:resilience-v2
npm run eval:release-v1
```

The obsolete `middleware.ts` file must be removed because Next.js 16 rejects repositories containing both `middleware.ts` and `proxy.ts`.
