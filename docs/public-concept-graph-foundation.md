# Phase 5: Concept Graph Intelligence Foundation

This document outlines the foundation for Tessarion's source-grounded concept extraction and knowledge graph layer, implemented during Phase 5.

## Overview

The Concept Graph layer turns flat source chunks into a structured web of knowledge, identifying key concepts and classifying the relationships between them. This structured representation acts as the backbone for advanced features like Socratic tutoring and mastery scoring.

## Core Principles

1.  **Strict Source Grounding**: Every concept and relationship MUST be explicitly grounded in one or more source chunks. Hallucinated concepts are strictly forbidden.
2.  **Traceable Agentic Workflow**: The extraction process operates as a traceable agentic workflow with well-defined states (e.g., `extracting_candidates`, `validating_grounding`, `classifying_relationships`). This ensures observability and reliability.
3.  **Deterministic Fallback**: If an AI provider fails (or is unavailable), the system gracefully falls back to a local, deterministic extraction baseline using regex patterns to identify core topics, definitions, and relationships.

## Agent Orchestration (`lib/agents/concept-graph-builder.ts`)

The `buildConceptGraphAgent` orchestrates the extraction pipeline:

1.  **Candidate Extraction**: Proposes candidate concepts from the provided text chunks.
2.  **Grounding Validation**: Enforces strict constraints on the candidates, ensuring they have robust evidence quotes and bindings to source chunk IDs.
3.  **Relationship Classification**: Analyzes the valid concepts to identify relationships (e.g., causal, prerequisite, contrasts, related) between them based on the source text.
4.  **Graph Validation**: Rejects invalid edges (e.g., self-edges, ungrounded edges) and filters low-confidence relationships.
5.  **Persistence**: Merges and upserts the validated concept nodes and edges into the database (`concept_nodes`, `concept_edges`).
6.  **Run Summarization**: Returns a detailed `AgentRunSummary` and persists the run state and metrics to the `agent_runs` table for auditing.

## Extraction Layer

-   **Pluggable Tasks**: The extraction logic is encapsulated into modular tasks (`concept-extraction.ts`, `relationship-classification.ts`) that support pluggable AI providers.
-   **Local Deterministic Extraction**: The `extractConceptsLocal` function provides a highly robust, Regex-based baseline capable of identifying key terms from markdown syntax (e.g., bolding, headings), definition patterns, and relationship phrases.

## Graph Data Structures

-   **Concept Nodes**: Represent discrete topics, ideas, or entities. Each node maintains references to its supporting `source_chunk_ids`.
-   **Concept Edges**: Represent directional or bi-directional relationships between nodes. Each edge must specify a `relationship_type` (causal, prerequisite, related, contrasts) and provide evidence.

## Metrics & Evaluation

The system calculates graph-level metrics (e.g., density, source grounding rate, average confidence) to assess the quality of the generated knowledge graph.

Automated evaluations enforce strict quality thresholds:
-   **Concept F1**: >= 0.60
-   **Relationship F1**: >= 0.35
-   **Source Grounding Rate**: 1.00
-   **Relationship Evidence Coverage**: 1.00

This rigorous validation guarantees that the generated knowledge graph is accurate, reliable, and firmly rooted in the user's provided materials.
