# Agent Orchestration Specification

Tessarion utilizes **LangGraph.js** to manage complex, multi-step cognitive workflows. Each graph must strictly define its state, inputs, outputs, error handling, and limits.

---

## 1. Concept Intelligence Graph

**Purpose:** Extracts, canonicalizes, and persists concepts and relationships from source text.

- **Entry Point:** `loadSource`
- **Terminal States:** `publishGraphVersion` (Success), `failSafely` (Terminal Error).
- **Persistence Boundary:** Checkpointed at every state transition. Final output written to Postgres via `persistTransactionalModel`.
- **Idempotency Key:** `hash(documentId + extractionVersion)`
- **Retry Policy:** 3 retries with exponential backoff on provider timeouts. 1 retry on malformed JSON outputs.
- **Tool Permissions:** Allow `search_source_material`, `retrieve_evidence_chunks`. Disallow all write tools.
- **Interruption Points:** None (fully background async).
- **Recoverable Errors:** LLM hallucinates edges (caught by `validateGraph`, triggers reroute to `extractCandidates` with a strict penalty prompt).
- **Terminal Errors:** Document missing from storage, unrecoverable prompt rejection.
- **Emitted Events:** `concept_extraction.completed`, `concept_extraction.failed`.
- **Evaluation Metrics:** Grounding Rate (percentage of concepts backed by chunks), Graph Validity (acyclic, no isolated nodes).
- **Latency & Cost Budgets:** Max 120 seconds. Max $0.05 per document chunk.
- **Deterministic Fallback:** If concept extraction fails entirely, fallback to pure dense retrieval (no graph context available for this document).
- **Migration:** Replaces `lib/ai/tasks/local-concept-extraction.ts`.

### Nodes & Transition Conditions
1. `loadSource` → `extractCandidates`
2. `extractCandidates` → `resolveEntities` (if JSON parses) | `failSafely` (if 3 retries fail)
3. `resolveEntities` → `classifyRelationships`
4. `classifyRelationships` → `validateEvidence`
5. `validateEvidence` → `validateGraph` (if 100% grounded) | `extractCandidates` (if <100% grounded)
6. `validateGraph` → `persistTransactionalModel`
7. `persistTransactionalModel` → `enqueueVectorIndexing` & `enqueueGraphSync`
8. `enqueueGraphSync` → `publishGraphVersion`

---

## 2. Learning Diagnosis Graph

**Purpose:** Evaluates a learner's teach-back explanation to identify mastery and specific knowledge gaps.

- **Entry Point:** `loadContext`
- **Terminal States:** `persistOutcome` (Success), `requestClarification` (Ambiguous Input).
- **Persistence Boundary:** Intermediate state ephemeral. Final mastery/gaps written to Postgres.
- **Idempotency Key:** `hash(explanationId)`
- **Retry Policy:** 2 retries on LLM parsing errors.
- **Tool Permissions:** Allow `retrieve_hybrid_context`, `traverse_concept_graph`.
- **Interruption Points:** None.
- **Recoverable Errors:** Insufficient retrieval context (triggers fallback search strategy).
- **Terminal Errors:** Learner input is complete gibberish or harmful (triggers `requestClarification`).
- **Emitted Events:** `diagnosis.completed`.
- **Evaluation Metrics:** Mastery Accuracy (vs baseline labels), Grounding Rate.
- **Latency & Cost Budgets:** Max 5 seconds. Max $0.005 per diagnosis.
- **Deterministic Fallback:** Zero-shot keyword matching if LLM provider is down (highly degraded).
- **Migration:** Replaces `lib/tutoring/decide-next-move.ts` and `lib/product/next-action.ts`.

### Nodes & Transition Conditions
1. `loadContext` → `retrieveEvidence`
2. `retrieveEvidence` → `retrieveGraphContext`
3. `retrieveGraphContext` → `analyzeExplanation`
4. `analyzeExplanation` → `validateGrounding`
5. `validateGrounding` → `detectGaps` (if grounded) | `analyzeExplanation` (if hallucinated)
6. `detectGaps` → `assessUncertainty`
7. `assessUncertainty` → `calculateMastery` (if confident) | `requestClarification` (if uncertain)
8. `calculateMastery` → `calculateReview` → `persistOutcome`

---

## 3. Socratic Tutor Graph

**Purpose:** Guides a learner through their misconceptions interactively.

- **Entry Point:** `loadMemory`
- **Terminal States:** `complete` (Gap resolved), `escalate` (Direct answer given).
- **Persistence Boundary:** Checkpointed to Postgres to allow multi-turn interruptions.
- **Idempotency Key:** `tutoringSessionId + turnCounter`
- **Retry Policy:** 1 retry on policy validation failure.
- **Tool Permissions:** Allow `retrieve_target_evidence`, `get_learner_mastery`.
- **Interruption Points:** `waitForLearner` (Waits for human reply).
- **Recoverable Errors:** Model generates multiple questions (caught by `validateQuestion`, regenerates).
- **Terminal Errors:** Max turns reached.
- **Emitted Events:** `tutoring.turn_completed`, `tutoring.session_resolved`.
- **Evaluation Metrics:** Socratic Policy Compliance (One-question rule), Premature Answer Rate.
- **Latency & Cost Budgets:** Max 3 seconds per turn (streaming).
- **Deterministic Fallback:** Fixed generic prompts ("Can you elaborate on that part?").
- **Migration:** Replaces `components/tutoring/tutoring-panel.tsx` internal loop.

### Nodes & Transition Conditions
1. `loadMemory` → `selectActiveGap`
2. `selectActiveGap` → `retrieveTargetEvidence`
3. `retrieveTargetEvidence` → `selectPedagogicalMove`
4. `selectPedagogicalMove` → `generateQuestion`
5. `generateQuestion` → `validateQuestion`
6. `validateQuestion` → `waitForLearner` (if valid) | `generateQuestion` (if invalid policy)
7. `waitForLearner` → (Human Input) → `evaluateResponse`
8. `evaluateResponse` → `complete` (if correct) | `escalate` (if stuck > 3 turns) | `continue` (loop)
