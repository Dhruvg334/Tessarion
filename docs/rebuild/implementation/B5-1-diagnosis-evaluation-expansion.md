# Rebuild B5.1 — Diagnosis Evaluation Expansion

The first diagnosis regression set contained six cases. That was enough to exercise the initial workflow route, but not enough to support reliable regression claims.

The expanded set contains eighteen deterministic cases across:

- grounded first-attempt coverage
- shallow explanations
- missing core concepts
- prerequisite handling
- unsupported absolute claims
- contradiction-based misconception signals
- mixed gaps
- definition-only grounding
- missing source evidence
- multiple-prerequisite boundaries

The evaluator now checks:

- terminal route
- mastery state
- next action
- exact gap-type set
- deterministic repeatability

A case fails the command if any expected dimension differs. The dataset remains a development/regression fixture, not a substitute for a larger human-labelled benchmark. Later Rebuild B work must add domain-diverse, adversarial, and human-reviewed cases before reporting production-quality diagnosis metrics.
