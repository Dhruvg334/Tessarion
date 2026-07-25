# Rebuild B1 — Core Contracts

## Status

Implemented in the rebuild working tree. Full rebuild-wide integration testing is deferred until the end of Rebuild B, while B1 receives local static validation before handoff.

## Scope delivered

- Versioned prompt definition and registry contracts.
- A production grounding-validation prompt with Zod input/output schemas.
- Workflow identity, status, error, and node contracts for future LangGraph graphs.
- An internal typed tool registry with scoped execution, validation, timeout handling, and safe errors.
- Initial read-only tools for evidence retrieval, graph traversal, mastery inspection, and review-queue inspection.
- A vendor-neutral trace-span contract that records prompt versions and hashes without storing hidden reasoning.
- A versioned evaluation-dataset schema and an approved foundation dataset.
- A deterministic foundation evaluation runner.

## Architectural boundaries

The tool registry is the internal execution boundary. MCP will later adapt approved tools rather than replacing internal calls. LangGraph will later consume the workflow and tool contracts. OpenTelemetry/Phoenix integration will adapt the trace model instead of defining a second trace schema.

## Research basis

- LangGraph checkpoints persist graph state at node boundaries and support resumable, human-interruptible workflows.
- The official MCP TypeScript SDK separates tools, resources, and prompts and supports stdio and Streamable HTTP transports.
- Promptfoo supports dataset-driven test cases and deterministic/custom assertions; its integration is planned for the evaluation expansion phase.
- Phoenix accepts OpenTelemetry/OpenInference traces and supports evaluations over traces and datasets.

See `docs/rebuild/18-research-references.md` for primary-source references.
