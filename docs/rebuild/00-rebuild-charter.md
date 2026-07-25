# Rebuild Charter

## Product Mission
Tessarion is an open-source learning intelligence system that converts source material into an evidence-linked knowledge model, evaluates understanding through teach-back, and coordinates retrieval, graph reasoning, learner memory, review, and Socratic tutoring through traceable workflows. Our mission is to facilitate deep learning through active recall rather than passive consumption.

## Primary Users
- Serious, self-directed learners who want to master complex topics.
- Educators or students who need a system that enforces active learning (teach-back) over shortcut answers.
- Developers looking for a reference open-source architecture for agentic educational tools.

## Core Learner Problem
Passive reading creates an illusion of competence. True mastery requires identifying exact conceptual gaps and actively reconstructing knowledge from foundational evidence. Most AI tools bypass this by simply generating answers for the student.

## Product Principles
- **Teach-back first:** The system forces the user to explain concepts.
- **Evidence-backed:** The system must root its diagnosis and tutoring in the user's provided source materials.
- **Socratic recovery:** When a student struggles, the system guides them through targeted questioning, never giving the answer away immediately.

## Engineering Principles
- **Traceability:** Every important learning decision must be traceable to evidence.
- **Validation:** AI output must be validated before persistence.
- **Version Control:** Production prompts must be versioned.
- **Infrastructure Justification:** Infrastructure complexity must have a concrete product justification.
- **Deterministic Safeties:** Do not use an agent where a deterministic function is safer. Do not call every model call an agent.

## UX Principles
- **Monochrome & Serious:** The design uses warm cream, white, and black notebook aesthetics.
- **Information Hierarchy:** Focus on readability and clear navigation.
- **Reduced Motion:** Animations should not delay content paint or overwhelm the user.

## Non-Goals
- Tessarion is **not** a generic chatbot.
- Tessarion is **not** a note-taking app with AI.
- Tessarion is **not** a quiz generator.
- Tessarion is **not** a replacement for human teachers.
- Tessarion is **not** an autonomous system that perfectly understands students.
- Tessarion is **not** a fake personalized-learning dashboard.

## Current-State Honesty Policy
Tessarion must never claim capabilities that are not currently implemented. Future planned capabilities (e.g., LangGraph orchestration, Neo4j, Qdrant) must be explicitly marked as target architecture, not existing functionality.

## Architecture Decision Policy
All major architectural decisions must be documented with clear rationale, alternatives considered, and failure modes evaluated. 

## Evidence and Traceability Policy
Every diagnosis, mastery signal, and tutoring response must be explicitly linked to semantic chunks or graph relationships derived from the original source material.

## Open-Source Positioning
Tessarion is designed as an open-source reference for evidence-based AI learning systems. It prioritizes self-hostability, transparency, and deterministic evaluation over proprietary lock-in.

## Definition of "Agentic" for Tessarion
An agentic workflow in Tessarion is a bounded, stateful, and observable orchestration of models and tools that can evaluate its own intermediate outputs, pause for human feedback, and cleanly recover from failures. 

## Definition of "Self-Improvement" for Tessarion
Self-improvement is not autonomous rewriting of prompts by AI. It is the structured process of gathering failure traces, running them against deterministic evaluation suites, producing candidate fixes, and relying on human promotion for deployment.

## Definition of "Memory" for Tessarion
Memory is the strictly bounded, versioned, and retrievable record of a learner's mastery state, prior explanations, and systemic learning paths. It is not raw conversational history, nor is it unstructured chain-of-thought data.
