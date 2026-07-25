# Memory and Learner Model

Tessarion maintains strict boundaries on what constitutes "memory" to prevent context bloat and hallucination drift. 

## Memory Types & Handling

### 1. Working Memory
- **Definition:** The active state of a currently executing LangGraph workflow.
- **Write/Read Criteria:** Written on every node transition. Read upon workflow resumption.
- **Retention:** Ephemeral. Kept only until workflow completion or terminal failure.
- **Deletion:** Dropped from checkpoint store 7 days after completion (for debugging).
- **Size Limits:** Max 5MB per thread.

### 2. Session Memory
- **Definition:** The multi-turn chat history of a specific teach-back or tutoring interaction.
- **Write/Read Criteria:** Written after each user input and LLM output. Read sequentially to form the context window.
- **Retention:** Permanent in Postgres for audit purposes.
- **Deletion:** Cascades on Workspace or User deletion.
- **Size Limits:** Max 20 turns. Excess turns are summarized.

### 3. Semantic Learning Memory
- **Definition:** Highly compressed insights about a learner's persistent misunderstandings or successful analogies.
- **Write/Read Criteria:** Written (summarized) at the end of a tutoring session if a significant gap was closed. Read during subsequent tutoring sessions on related concepts via Qdrant similarity search.
- **Summarization:** Uses a strict LLM summarization prompt reducing multi-turn chats into 1-2 sentence insights.
- **Conflict Handling:** Newer memories overwrite older ones if the semantic similarity is >0.90 on the same concept.
- **Stale-Memory Handling:** If a concept is deleted, related semantic memories are purged.

### 4. Relational Memory
- **Definition:** The Neo4j graph of prerequisites and conceptual connections.
- **Write/Read Criteria:** Written during ingestion/extraction. Read during diagnosis to fetch prerequisites.
- **Correction:** Can be explicitly overridden by a human user if the extraction LLM made a mistake.
- **Provenance:** Every relational edge must store the `sourceChunkId` that justified it.

### 5. Learner Model (Canonical)
- **Definition:** Numeric mastery states (`0.0 - 1.0`), review schedules, and raw mastery signals.
- **Write/Read Criteria:** Written deterministically by Domain Services after a diagnosis. Read for routing and UI presentation.
- **Conflict Handling:** Transactions enforce chronological insertion of mastery signals.
- **Retention:** Permanent.

### 6. Audit Memory
- **Definition:** Trace logs detailing AI tool use, prompt hashes, and latencies.
- **Retention:** 30 days in tracing backend (e.g., Phoenix).

## General Policies

- **Privacy:** Semantic memory and session memory contain user-generated text. It must be strictly scoped to `userId` and `workspaceId` via RLS.
- **Evaluation Metrics:** "Memory Usefulness" (measured offline by checking if including semantic memory improved gap detection speed) and "Memory Contradiction Rate" (does a new memory conflict with a stored mastery state).
