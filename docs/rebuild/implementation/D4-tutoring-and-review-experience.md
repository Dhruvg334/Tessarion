# Rebuild D4 — Tutoring and Review Experience

## Scope

D4 rebuilds the two recovery surfaces that follow diagnosis: the Socratic tutor and the review queue. The change does not alter mastery logic, review scheduling, tutor policy, or persistence. It improves how learners inspect the reason for a review, continue a bounded tutoring session, recover from API failures, and return to teach-back.

## Tutor experience

The Tutor panel now exposes a session library and a focused session workspace. Active and completed sessions remain visible with their diagnosed focus, turn usage, current status, and a direct continuation path.

A session presents one turn at a time with explicit labels for learner responses, guiding questions, hints, corrections, source checks, reflections, and completion checks. Evidence references are shown as counts rather than raw identifiers. The composer reports word count, preserves learner text after a failed request, and surfaces API errors in the interface.

Ending tutoring does not change mastery. Completed or closed sessions direct the learner back to the knowledge graph for another teach-back attempt.

## Review experience

The review queue now provides:

- priority-first ordering;
- all, urgent, and tutor-ready filters;
- clear reason and recommended-route sections;
- visible queue totals;
- bounded action errors instead of browser alerts;
- optimistic removal after a successful completion or skip action;
- guided tutoring only for high and critical items.

Marking a review as completed records the review action. It does not claim that the concept is understood.

## Navigation

Tutor is now a first-class notebook destination alongside Sources, Knowledge graph, Teach-back, Reviews, and Activity. Existing session links continue to use the `tutoring` query parameter, while `panel=tutor` keeps the navigation state explicit.

## Reliability boundaries

- All writes continue through authenticated workspace-scoped API routes.
- Student text is restored after a failed tutoring request.
- Session and review errors are rendered as recoverable states.
- No raw provider, database, or stack-trace information is exposed.
- No client component calculates mastery or changes review priority.
