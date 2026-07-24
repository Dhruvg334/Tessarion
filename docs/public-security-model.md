# Tessarion Security Model

Tessarion is designed with security and data privacy as core tenets. This document outlines our approach to securing user data and maintaining system integrity.

## Authentication & Authorization
Tessarion uses Supabase Auth for identity management. All protected routes require a valid session token.

### Row-Level Security (RLS)
The database employs strict PostgreSQL Row-Level Security. Data access is enforced at the database layer:
- Users can only read and write data within workspaces they own.
- API requests without a valid session token cannot bypass RLS.
- Database functions running under the `service_role` execute with caution and explicitly scope actions by user ID and workspace ID when modifying data.

## Resource Limits & Rate Limiting
To prevent abuse and ensure fair usage, Tessarion enforces strict limits on API requests:
- **Rate Limiting**: High-risk routes (e.g., teach-back submissions, tutoring turns) are rate-limited per user.
- **Payload Limits**: 
  - Source text uploads: max 50,000 characters
  - Teach-back explanations: max 5,000 characters
  - Tutoring responses: max 2,000 characters
  - Search queries: max 1,000 characters
  - Titles/Labels: max 200 characters

## AI Provider Security
- **Data Masking**: Raw AI provider errors are masked in API responses to prevent leakage of internal system states.
- **Fail-safes**: If AI providers are misconfigured or unavailable, the system degrades gracefully with clear user-facing errors rather than crashing.

## Input Validation
All API boundaries employ strict runtime validation using Zod schemas. Invalid payloads are rejected with structured 400 responses before any business logic executes.

## Data Retention
- Source materials and mastery records are scoped by workspace and hard-deleted when a workspace is deleted.
- Soft deletes (`archived_at`) are used for workspaces to allow recovery, but data within them remains isolated via RLS.

## Observability
For details on how Tessarion logs operational events securely and transparently, refer to the [Observability Model](public-observability-model.md).
