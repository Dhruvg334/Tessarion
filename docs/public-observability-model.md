# Tessarion Observability & Audit Model

## Overview
Tessarion implements a strict, lightweight observability model focused on reliability, security, and user transparency. We do not use third-party analytics trackers, nor do we perform invasive behavioral logging. 

## 1. Operational Events
We log core lifecycle events necessary for debugging and workspace history.
Events are stored in the `operational_events` table and are strictly scoped by `workspace_id` and `user_id`.

**Logged Events:**
- `source_added`, `source_chunked`
- `teach_back_started`, `teach_back_submitted`, `teach_back_feedback_generated`
- `mastery_updated`
- `review_scheduled`, `review_completed`, `review_skipped`
- `tutoring_started`, `tutoring_turn_submitted`, `tutoring_completed`, `tutoring_abandoned`

## 2. Privacy & Redaction
All events are sanitized before insertion:
- Sensitive keys (`token`, `password`, `secret`, `key`, `authorization`) are completely redacted.
- Payload metadata is size-capped. If a payload exceeds 5000 characters, it is replaced with a truncation marker.
- We **never** log full source text, full student explanations, or raw AI provider responses in our event stream.

## 3. Transparency
Users can view a read-only stream of their own workspace events via the **Activity Log** panel in the Workspace UI. This ensures complete transparency into how the system interprets their actions and schedules their reviews.

## 4. Retention
Event retention is tied to the lifecycle of the Workspace. If a Workspace is deleted, its operational events are cascade-deleted immediately. Future iterations may introduce a TTL (e.g. 30 days) via `pg_cron` for active workspaces to manage database size.
