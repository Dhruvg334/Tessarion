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

## Source Grounding

Positive mastery signals **must** be source-grounded. A covered-well evidence item is only counted toward mastery improvement if it includes:
- `sourceChunkIds` (one or more references to actual source material chunks), OR
- `relatedConceptId` (a verified concept in the same workspace)

Ungrounded praise (e.g., "Good explanation!" with no source evidence) is ignored for mastery calculation. This prevents unverified positive feedback from inflating mastery states.

## Deterministic Calculation

The mastery calculation (`lib/mastery/calculate-mastery.ts`) is completely deterministic. It analyzes the specific gaps and correct coverages extracted from the user's teach-back. No LLM is used to "guess" a score, ensuring consistent, reproducible results.

## Evidence Traceability

Every mastery signal references:
- The **real** `source_explanation_id` — the actual persisted `student_explanations.id`
- **Real** `gap_finding_ids` — actual persisted `gap_findings.id` values from the database
- `source_chunk_ids` linking back to the original source material

No fake or index-based IDs are used. Every mastery state change is traceable back to the exact teach-back explanation and gap findings that caused it.

## Historical Signals (mastery_signals)

Every teach-back explanation generates immutable `mastery_signals`. This is an append-only ledger of learning events. Each signal records:
- The exact explanation ID
- Whether it was a positive coverage or a specific gap (e.g., misconception, missing prerequisite)
- Strength and confidence
- Source chunk references for grounding

A uniqueness constraint `(workspace_id, concept_id, source_session_id, source_explanation_id, signal_type)` prevents duplicate signals from the same session.

This ledger allows future features like spaced repetition scheduling to analyze learning trends over time, while current states are cached in `mastery_records`.

## Mastery Persistence Safety

If mastery persistence fails after teach-back feedback has been saved successfully:
- The teach-back result returns with a warning
- The agent trace records the failure explicitly
- The mastery state is NOT marked as updated
- The user sees a `partial_success` status

## Review Scheduling

Review scheduling is **not yet implemented**. It will be built in Phase 8 on top of the mastery signal ledger and state machine established here.

## Evaluation

The `eval:mastery` harness includes 14 deterministic test cases and calculates:
- Mastery State Accuracy
- Severe Gap Escalation Accuracy
- Insufficient Evidence Accuracy
- Idempotency Pass Rate
- Recommendation Label Accuracy
- Run Success Rate
