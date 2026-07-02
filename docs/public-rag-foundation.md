# Tessarion RAG Foundation

## Features Built
- Context-aware chunking (Markdown heading detection)
- Gemini Embedding model (text-embedding-004)
- PostgreSQL pgvector dense retrieval
- PostgreSQL full-text sparse retrieval
- Hybrid retrieval (RRF) with Calibrated Weights
- Context compression and Local reranking (dense-similarity + phrase-matching)
- Local Offline RAG Evaluation harness (`npm run eval:rag`)

## Calibration Notes
- RRF is currently calibrated to favor sparse retrieval as the primary signal, using dense retrieval for semantic bridging.
- Local Rerank applies a secondary dense similarity pass combined with phrase matching to fine-tune the final candidate order.
- CI pipeline strictly enforces thresholds for Recall@5, MRR@5, and nDCG@5 across all modes.

No secrets leaked. Safe fallbacks for missing envs.
