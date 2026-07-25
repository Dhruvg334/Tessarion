import fs from 'node:fs';
import path from 'node:path';
import { assertLocalEvalMode } from '@/lib/config/ci-guards';
import { localProvider } from '@/lib/ai/providers/local';
import { computeContextPrecision, computeMRR, computeNDCGAtK, computeRecallAtK } from '@/lib/rag/evaluation';
import { LocalDenseRetriever, LocalSparseRetriever } from '@/lib/rag/hybrid/local-retrievers';
import { retrieveHybridContext } from '@/lib/rag/hybrid/pipeline';
import { DeterministicHybridReranker } from '@/lib/rag/hybrid/rerank';
import type { RetrievalIntent } from '@/lib/rag/hybrid/types';
import type { RetrievedChunk } from '@/lib/rag/types';

assertLocalEvalMode();

interface EvalCase { id: string; query: string; expectedChunkIds: string[]; intent: RetrievalIntent }
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/cases.json'), 'utf8')) as EvalCase[];
const chunks = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/chunks.json'), 'utf8')) as RetrievedChunk[];

async function main(): Promise<void> {
  const denseRetriever = new LocalDenseRetriever(chunks, localProvider);
  const sparseRetriever = new LocalSparseRetriever(chunks);
  const reranker = new DeterministicHybridReranker();
  let recall3 = 0; let recall5 = 0; let mrr5 = 0; let ndcg5 = 0; let precision5 = 0; let scopePasses = 0;

  for (const testCase of cases) {
    const result = await retrieveHybridContext(
      { workspaceId: 'eval', query: testCase.query, intent: testCase.intent, limit: 5 },
      { denseRetriever, sparseRetriever, reranker },
      { finalLimit: 5 },
    );
    const ids = result.candidates.map((candidate) => candidate.id);
    recall3 += computeRecallAtK(testCase.expectedChunkIds, ids, 3);
    recall5 += computeRecallAtK(testCase.expectedChunkIds, ids, 5);
    mrr5 += computeMRR(testCase.expectedChunkIds, ids, 5);
    ndcg5 += computeNDCGAtK(testCase.expectedChunkIds, ids, 5);
    precision5 += computeContextPrecision(testCase.expectedChunkIds, ids, 5);
    if (result.candidates.every((candidate) => candidate.workspaceId === 'eval')) scopePasses += 1;
  }

  const metrics = {
    recallAt3: recall3 / cases.length,
    recallAt5: recall5 / cases.length,
    mrrAt5: mrr5 / cases.length,
    ndcgAt5: ndcg5 / cases.length,
    contextPrecisionAt5: precision5 / cases.length,
    workspaceScopeRate: scopePasses / cases.length,
  };
  console.table(metrics);

  const failures = [
    metrics.recallAt5 < 0.8 && `Recall@5 ${metrics.recallAt5.toFixed(3)} < 0.800`,
    metrics.mrrAt5 < 0.65 && `MRR@5 ${metrics.mrrAt5.toFixed(3)} < 0.650`,
    metrics.ndcgAt5 < 0.65 && `nDCG@5 ${metrics.ndcgAt5.toFixed(3)} < 0.650`,
    metrics.workspaceScopeRate !== 1 && 'Workspace scope rate must equal 1.000',
  ].filter(Boolean);
  if (failures.length) throw new Error(failures.join('; '));
  console.log('Retrieval V2 evaluation passed.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Retrieval evaluation failed.');
  process.exit(1);
});
