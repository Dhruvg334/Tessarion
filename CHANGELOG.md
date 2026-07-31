# Changelog

All notable changes to Tessarion are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use semantic versioning.

## [1.0.0] — 2026-07-31

### Added

- Evidence-linked source ingestion and workspace-scoped retrieval.
- Concept extraction, canonical relationship storage, and Neo4j graph projection.
- Teach-back diagnosis with grounded gap classification and next-action routing.
- Stateful Socratic tutoring with bounded questions, checkpoints, and return-to-teach-back flow.
- Evidence-based mastery signals, review scheduling, activity history, and trace inspection.
- Public deterministic demo notebook requiring no account or provider key.
- Supabase authentication, row-level security, profile management, and workspace isolation.
- Qdrant hybrid retrieval, Neo4j AuraDB projection, Inngest durable jobs, and Arize AX tracing.
- Dataset-driven evaluation suites, CI quality gates, deployment checks, and infrastructure validation.
- Production documentation covering architecture, security, operations, and release validation.

### Security

- Server-only secrets remain outside client bundles.
- Private data access is scoped by authenticated user and workspace.
- Derived vector and graph records require workspace identifiers.
- Operational traces use bounded safe metadata and exclude credentials, passwords, cookies, and hidden reasoning.
- MCP and detailed infrastructure-health endpoints support explicit token protection.

[1.0.0]: https://github.com/Dhruvg334/Tessarion/releases/tag/v1.0.0
