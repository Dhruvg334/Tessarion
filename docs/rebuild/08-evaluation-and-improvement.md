# Evaluation and Improvement

Tessarion utilizes a rigid offline evaluation matrix. AI changes (models, prompts, chunking strategies) cannot be deployed without passing this regression suite.

## Evaluation Matrix

| Suite / Metric | Dataset | Threshold | Mode | CI Behavior | Failure Artifact | Promotion Gate | Regression Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Retrieval Routing Accuracy** | `eval/routing/intents.json` (100 user queries) | >95% | Deterministic (exact match of intent category) | Blocking | Markdown diff of misroutes | Must meet threshold | No regressions allowed |
| **Dense Recall (Top-5)** | `eval/rag/recall-cases.json` | >90% | Deterministic (checks if required chunk ID is in results) | Blocking | List of missed chunk IDs | Must meet threshold | No regressions allowed |
| **Sparse Recall (Top-5)** | `eval/rag/sparse-cases.json` | >85% | Deterministic | Informational | List of missed chunk IDs | N/A | Tracked over time |
| **Graph Expansion Relevance** | `eval/graph/traversals.json` | >90% | Model-based (LLM judges if returned nodes are relevant) | Informational | LLM critique log | N/A | Tracked over time |
| **Concept Grounding Rate** | `eval/concepts/extractions.json` (50 texts) | 100% | Deterministic (Every concept must reference a valid chunk ID) | Blocking | Orphaned concepts list | Must meet threshold | Absolute 100% required |
| **Mastery State Accuracy** | `eval/mastery/labels.json` (Human-labeled explanations) | >90% | Deterministic (Calculated signal vs Human Label variance < 0.1) | Blocking | Variance report | Must meet threshold | No regressions allowed |
| **Socratic Compliance (One-Question)** | `eval/tutoring/socratic.json` | 100% | Model-based (LLM parses question count in output) | Blocking | Full transcript of failure | Must meet threshold | Absolute 100% required |
| **Premature Answer Rate** | `eval/tutoring/socratic.json` | <2% | Model-based (LLM judges if answer was given away) | Blocking | Full transcript of failure | Must remain under 2% | No regressions allowed |
| **Tool Selection Accuracy** | `eval/tools/selection.json` | >98% | Deterministic (JSON schema match + correct tool name) | Blocking | Schema error trace | Must meet threshold | No regressions allowed |
| **Invalid Tool-Call Rate** | Historical Production Traces | <1% | Deterministic (Production telemetry monitor) | Prod Monitor | Alert / Trace payload | N/A | Alert if spiked >1% |

## Improvement Lifecycle

Tessarion strictly prohibits agents from modifying their own instructions in production.

1. **Failure Observation:** Production telemetry flags an Invalid Tool-Call, or user feedback is poor.
2. **Trace Review:** Developer inspects the Phoenix OpenTelemetry trace.
3. **Dataset Expansion:** The failing input is scrubbed of PII and added to the relevant `eval/*.json` dataset.
4. **Candidate Fix:** Developer adjusts `systemPrompt` or node logic.
5. **Offline Test:** `npm run test:eval` executes the Evaluation Matrix.
6. **Regression Gate:** CI blocks the PR if any blocking metric falls below threshold or regresses from the `main` branch baseline.
7. **Human Approval:** PR is merged.
