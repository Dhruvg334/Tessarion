# Tessarion Review Scheduling

Tessarion schedules reviews deterministically based on mastery state to prioritize learning effectively.

## Scheduling Triggers

Reviews are automatically created or updated whenever a concept's mastery state changes, usually following a teach-back session. The scheduling logic evaluates the concept's mastery and sets an appropriate follow-up.

## Active Review Constraint

Tessarion enforces a strict constraint: **Only one active review item is permitted per concept per user workspace.**
An active review is any schedule item with a status of `queued`, `due`, or `overdue`.

## Stale Update Behavior

When a concept's mastery state changes (for example, a student corrects a misconception and reaches `understood`):
- If an active review already exists, it is **updated (superseded)** to reflect the new priority, reason, and schedule rather than duplicated.
- If the new state indicates that not enough evidence exists yet (`unassessed`, `insufficient_evidence`), any existing active review is **suspended**.

## Priority and Urgency

Recommendations use a text-based priority queue without numeric scoring or gamification:
- **Critical (1 day):** Misconceptions that require immediate correction.
- **High (1 day):** "Needs review" where a student forgot or struggled significantly.
- **Medium (2-3 days):** "Weak connections" or "Partial" understanding requiring reinforcement before it fades.
- **Low (7 days):** "Understood" concepts ready for spaced reinforcement.

## Reinforcement Capping

To prevent a student's review queue from being flooded with concepts they already know well, Tessarion enforces an **understood reinforcement cap**. A maximum of **3** active "understood" reviews are permitted per workspace at any given time. If the cap is reached, new "understood" reviews will not be scheduled until existing ones are completed or skipped.
