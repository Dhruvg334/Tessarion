# Tool and MCP Contracts

Tessarion tools are strictly typed via Zod and enforced by the execution engine. Tools are either executed natively in the Node.js/Edge runtime by LangGraph, or exposed via the Model Context Protocol (MCP) adapter for external inspection.

## 1. Internal Tool Definitions

### `search_source_material`
- **TypeScript Input Schema:** `z.object({ query: z.string(), workspaceId: z.string().uuid(), limit: z.number().max(50).default(10) })`
- **Output Schema:** `z.array(z.object({ chunkId: z.string(), text: z.string(), score: z.number() }))`
- **Type:** Read
- **Authorization:** `workspaceId` must match the current execution context.
- **Idempotency:** Yes
- **Timeout:** 3000ms
- **Retries:** 2
- **Audit Event:** `tool.search_source_material`
- **Safe Error Codes:** `404_NO_RESULTS`, `400_INVALID_QUERY`
- **Sensitive Fields:** `text` (redacted in tracing unless debugging).
- **Agent Permissions:** Available to all agents.

### `retrieve_evidence_chunks`
- **Input Schema:** `z.object({ chunkIds: z.array(z.string().uuid()).max(100), workspaceId: z.string().uuid() })`
- **Output Schema:** `z.array(z.object({ chunkId: z.string(), documentId: z.string(), text: z.string() }))`
- **Type:** Read
- **Authorization:** `workspaceId` context match.
- **Idempotency:** Yes
- **Timeout:** 2000ms
- **Retries:** 2
- **Audit Event:** `tool.retrieve_evidence_chunks`
- **Agent Permissions:** Available to all agents.

### `traverse_concept_graph`
- **Input Schema:** `z.object({ startConceptId: z.string().uuid(), depth: z.number().min(1).max(3), relationshipType: z.string().optional(), workspaceId: z.string().uuid() })`
- **Output Schema:** `z.object({ nodes: z.array(ConceptSchema), edges: z.array(EdgeSchema) })`
- **Type:** Read
- **Authorization:** `workspaceId` context match.
- **Idempotency:** Yes
- **Timeout:** 5000ms
- **Retries:** 1
- **Audit Event:** `tool.traverse_concept_graph`
- **Agent Permissions:** Diagnosis and Extraction agents only.

### `record_mastery_signal`
- **Input Schema:** `z.object({ userId: z.string().uuid(), conceptId: z.string().uuid(), signal: z.number().min(0).max(1), evidenceId: z.string().uuid().optional() })`
- **Output Schema:** `z.object({ success: z.boolean(), newMasteryLevel: z.number() })`
- **Type:** Write
- **Authorization:** System/Service level only. Models cannot impersonate `userId`.
- **Idempotency:** Yes (requires transaction deduplication on timestamp/traceId).
- **Timeout:** 2000ms
- **Retries:** 3
- **Audit Event:** `tool.record_mastery_signal`
- **Agent Permissions:** Diagnosis agent only.

### `schedule_review`
- **Input Schema:** `z.object({ userId: z.string().uuid(), conceptId: z.string().uuid(), currentMastery: z.number() })`
- **Output Schema:** `z.object({ nextReviewDate: z.string().datetime() })`
- **Type:** Write
- **Authorization:** System/Service level.
- **Idempotency:** Yes (upserts target review date).
- **Agent Permissions:** Diagnosis agent only.

---

## 2. MCP Adapter Configuration

The MCP adapter projects these internal capabilities to external developers or IDEs via standard MCP APIs. 

**Exposure Rules:**
- **Exposed Tools:** `search_source_material`, `retrieve_evidence_chunks`, `traverse_concept_graph`.
- **Prohibited Tools:** All Write tools (`record_mastery_signal`, `schedule_review`).
- **Authorization:** MCP requests must carry a valid Developer Token scoped to a specific Workspace.

### Exposed MCP Resources
- `workspace://{workspaceId}/sources` - Lists all documents in a workspace.
- `workspace://{workspaceId}/concepts` - Lists all canonical concepts.
- `workspace://{workspaceId}/graph` - Dumps the workspace Neo4j subgraph.
- `learner://{userId}/mastery` - Lists all mastery states for a user.
- `workflow://{traceId}` - Retrieves a specific trace payload.

### Exposed MCP Prompts
Public consumers may only access template prompts explicitly flagged as `public: true` in the Prompt Registry.
- `prompt://socratic-tutor/system/v1.0` (Publicly verifiable baseline).
- *Internal Gap Detection thresholds and extraction system prompts are explicitly excluded from MCP exposure.*
