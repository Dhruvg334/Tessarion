# Target Architecture

Tessarion's architecture cleanly separates presentation, stateless application logic, stateful cognitive workflows, durable background execution, and purpose-built persistence layers.

**Critical Policy - Canonical Ownership:** Supabase (Postgres) is the **absolute canonical source of truth** for all entities, including Concept IDs, Graph relationships, and learner memory. External systems (Neo4j, Qdrant) are strictly derived projections optimized for traversal and semantic retrieval. They must never be treated as the system of record.

---

## 1. System Architecture

This diagram illustrates the separation of concerns between Next.js, LangGraph, Inngest, and the persistence layers.

```mermaid
graph TD
    Client[Browser Client] --> Next[Next.js API & Server Components]
    
    subgraph "Application Layer"
        Next --> Services[Deterministic Domain Services]
        Next --> InngestClient[Inngest Client]
    end

    subgraph "Orchestration Layer"
        Next --> LangGraph[LangGraph Cognitive Workflows]
        LangGraph --> PromptReg[Prompt Registry]
        LangGraph --> Tools[Internal Typed Tools]
        Tools --> Services
    end

    subgraph "Durable Execution Layer"
        InngestQueue[(Inngest Cloud / Dev Server)] --> InngestWorker[Inngest Background Workers]
        InngestWorker --> LangGraph
        InngestWorker --> Services
    end

    subgraph "Persistence Layer"
        Services --> Postgres[(Supabase Postgres - Canonical)]
        Tools --> Postgres
        Tools --> Qdrant[(Qdrant - Derived Vector Index)]
        Tools --> Neo4j[(Neo4j - Derived Graph Index)]
        LangGraph -.-> Checkpoint[(LangGraph Checkpointer PG)]
    end
```

---

## 2. Request Lifecycle (Synchronous API)

Standard REST or Server Action flows that do not require multi-step AI reasoning.

```mermaid
sequenceDiagram
    participant User
    participant Route as Next.js Route Handler
    participant Auth as Middleware/Supabase Auth
    participant Service as Domain Service
    participant DB as Supabase Postgres

    User->>Route: POST /api/workspaces/123/mastery
    Route->>Auth: Validate Session & Workspace
    Auth-->>Route: Authenticated User
    Route->>Service: calculateMastery(data)
    Service->>DB: INSERT mastery_signals
    DB-->>Service: OK
    Service-->>Route: Updated Mastery State
    Route-->>User: 200 OK
```

---

## 3. Ingestion Lifecycle (Asynchronous Background)

How large source documents are processed safely without HTTP timeouts.

```mermaid
sequenceDiagram
    participant User
    participant API as Upload Route
    participant Storage as Supabase Storage
    participant Inngest as Inngest Queue
    participant Worker as Document Worker
    participant Graph as Concept Extraction Workflow
    participant DB as Postgres
    participant Vector as Qdrant

    User->>API: Upload PDF
    API->>Storage: Store Blob
    Storage-->>API: file_path
    API->>Inngest: Enqueue 'document.process' event
    API-->>User: 202 Accepted (Processing)
    
    Inngest->>Worker: Trigger Job
    Worker->>Worker: Chunk Text
    Worker->>DB: Persist Chunks (Canonical)
    Worker->>Vector: Upsert Embeddings (Derived)
    
    Worker->>Graph: Trigger Concept Intelligence Graph
    Graph-->>Worker: Extraction Complete
    Worker->>Inngest: Mark Job Complete
```

---

## 4. Teach-Back Diagnosis Workflow

How LangGraph evaluates a learner's explanation against the source evidence.

```mermaid
sequenceDiagram
    participant User
    participant API as Teach-Back Route
    participant Graph as Learning Diagnosis LangGraph
    participant DB as Postgres
    participant Vector as Qdrant
    participant Neo4j as Neo4j

    User->>API: Submit Explanation
    API->>Graph: Invoke State Machine
    Graph->>Vector: Retrieve Evidence Chunks (Hybrid)
    Graph->>Neo4j: Retrieve Graph Context (Prerequisites)
    Graph->>Graph: Analyze Explanation (LLM)
    Graph->>Graph: Validate Grounding against Chunks
    Graph->>Graph: Detect Gaps & Assess Uncertainty
    Graph->>DB: Persist Mastery Signals (Canonical)
    Graph-->>API: Return Diagnosis & Next Action
    API-->>User: UI Update
```

---

## 5. Socratic Tutoring Workflow

Stateful multi-turn human-in-the-loop workflow.

```mermaid
sequenceDiagram
    participant User
    participant Graph as Socratic Tutor LangGraph
    participant Tool as Retrieval Tool
    participant LLM as AI Provider

    User->>Graph: Send Message
    Graph->>Graph: Load Memory (Checkpoint)
    Graph->>Tool: Retrieve Target Evidence
    Graph->>LLM: Select Pedagogical Move (Hint/Probe)
    Graph->>LLM: Generate Question
    Graph->>Graph: Validate "One-Question Rule"
    Graph->>Graph: Pause Execution (Human in the loop)
    Graph-->>User: Socratic Question
    
    User->>Graph: Learner Reply
    Graph->>Graph: Evaluate Response
    alt Concept Mastered
        Graph->>Graph: Mark Gap Resolved
    else Still Struggling
        Graph->>Graph: Escalate to direct explanation
    end
```

---

## 6. Data Synchronization (Postgres to Projections)

Ensures derived stores never drift from canonical reality.

```mermaid
sequenceDiagram
    participant DB as Postgres (Canonical)
    participant Worker as Sync Worker (Inngest)
    participant Qdrant as Qdrant
    participant Neo4j as Neo4j

    DB->>Worker: Database Webhook / Trigger on Concept Insert
    Worker->>Neo4j: Upsert Node (Merge on ID)
    Worker->>Qdrant: Upsert Payload Metadata
    Worker-->>DB: Acknowledge Sync
    
    DB->>Worker: Trigger on Document Delete
    Worker->>Qdrant: Delete points by Document ID
    Worker->>Neo4j: Delete nodes by Document ID
    Worker-->>DB: Acknowledge
```

---

## 7. Failure Boundaries

Visualizes isolation. If an external service falls, the blast radius is contained.

```mermaid
graph TD
    subgraph UI [User Interface]
        React[React Shell]
        React --> |Fails Gracefully| ErrorBoundary[Error Boundary]
    end

    subgraph API [Next.js API]
        Route[Route Handler]
    end

    subgraph BG [Background]
        InngestWorker[Inngest Worker]
        GraphWorkflow[LangGraph Workflow]
    end
    
    subgraph External
        Qdrant[(Qdrant)]
        Neo4j[(Neo4j)]
        LLM[LLM Provider]
    end

    UI --> API
    API --> BG
    
    BG -.-> |Timeout/HTTP 500| LLM
    BG -.-> |Timeout/HTTP 500| Qdrant
    BG -.-> |Timeout/HTTP 500| Neo4j
    
    %% If LLM fails, LangGraph retries, then fails the job. Inngest retries the job. 
    %% The UI polls or subscribes to the job status and shows an error state, but the App Shell never crashes.
```
