# Socratic Tutoring

Tessarion's tutoring layer is guided practice for concepts that are weak, incomplete, or misunderstood. It is deliberately not a free-form chat feature.

## Role in the learning loop

Tutoring helps a learner prepare for another teach-back attempt. It does not directly mark a concept as understood, create mastery signals, or complete a review by itself. Mastery still comes from evidence produced during teach-back.

## How the tutor chooses a move

A deterministic policy selects the next tutoring move from the session focus, prior turns, source context, and turn count. The allowed moves include contrast questions, evidence questions, prerequisite questions, small hints, correction prompts, and final teach-back requests.

Provider generation can rephrase the selected move, but the policy owns the pedagogical decision. If generated wording violates the one-question rule, gives a full answer too early, or becomes too long, Tessarion falls back to deterministic wording.

## Source grounding

Tutoring context is loaded from existing schema-backed evidence:

- `concept_nodes.source_chunk_ids`
- `gap_findings.source_chunk_ids`
- `mastery_signals.source_chunk_ids`

Tutor turns persist the relevant source chunk IDs, gap finding IDs, and mastery signal IDs. If no source evidence exists, the tutor states that honestly and asks for source material instead of fabricating context.

## Session boundaries

Tutoring sessions have a max-turn cap. When the cap is reached, the tutor stops the loop, summarizes the unresolved issue briefly, and recommends another teach-back or review.

## UI principles

The tutoring interface is kept calm and notebook-like. It shows one tutor question at a time, avoids chat gimmicks, and keeps the focus on the student's reasoning.
