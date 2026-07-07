# Tessarion Mastery Model

Tessarion calculates concept mastery purely from evidence gathered during teach-back sessions. It does not hallucinate percentages or guess understanding without proof.

## State Progression
Mastery flows through a defined set of states based on gathered evidence.
The allowed states are:
- `unassessed`: No evidence has been collected yet.
- `insufficient_evidence`: Teach-back was too brief or shallow to form a reliable assessment.
- `emerging`: Some understanding exists, but multiple key concepts are missing.
- `partial`: Good start, but missing some depth or specific details.
- `understood`: Clear and accurate understanding demonstrated without severe gaps.
- `weak_connection`: Lacking prerequisite understanding necessary to ground the concept.
- `misconception`: Critical misunderstanding detected.
- `needs_review`: Misconceptions or weak connections require focused review.

## Deterministic Calculation
The mastery calculation (`lib/mastery/calculate-mastery.ts`) is completely deterministic. It analyzes the specific gaps and correct coverages extracted from the user's teach-back. No LLM is used to "guess" a score, ensuring consistent, reproducible results.

## Historical Signals (mastery_signals)
Every teach-back explanation generates immutable `mastery_signals`. This is an append-only ledger of learning events. Each signal records:
- The exact explanation ID
- Whether it was a positive coverage or a specific gap (e.g., misconception, missing prerequisite)
- Strength and confidence

This ledger allows future features like spaced repetition scheduling to analyze learning trends over time, while current states are cached in `mastery_records`.
