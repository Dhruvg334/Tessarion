/* eslint-disable @typescript-eslint/no-explicit-any */
 
import fs from 'fs';
import path from 'path';
import { computeRecallAtK, computeMRR, computeNDCGAtK, computeContextPrecision } from '../../lib/rag/evaluation';
import { localProvider } from '../../lib/ai/providers/local';
import { reciprocalRankFusion } from '../../lib/rag/retrieval';
import { assertLocalEvalMode } from '../../lib/config/ci-guards';

assertLocalEvalMode();

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/rag-eval-cases.json'), 'utf8'));
const chunks = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/chunks.json'), 'utf8'));

console.log('--- Real Local RAG Evaluation ---');

function BM25Score(query: string, text: string) {
  const qTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const tTerms = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  let score = 0;
  for (const q of qTerms) {
    if (tTerms.includes(q)) score += 1;
  }
  return score;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

async function runEval() {
  const metrics: any = { sparse: {}, pseudoDense: {}, hybridUnweighted: {}, hybridCalibrated: {}, localRerank: {} };
  const modes = ['sparse', 'pseudoDense', 'hybridUnweighted', 'hybridCalibrated', 'localRerank'] as const;
  
  for (const mode of modes) {
    metrics[mode] = { r3: 0, r5: 0, mrr5: 0, ndcg5: 0, cp5: 0 };
  }

  // Pre-embed chunks
  const chunkEmbeddings = new Map<string, number[]>();
  for (const c of chunks) {
    chunkEmbeddings.set(c.id, await localProvider.embedDocument(c.content));
  }

  for (const testCase of cases) {
    const qEmbed = await localProvider.embedQuery(testCase.query);

    const sparseResults = chunks.map((c: any) => ({ ...c, score: BM25Score(testCase.query, c.content) }))
      .sort((a: any, b: any) => b.score - a.score);
      
    const denseResults = chunks.map((c: any) => ({ ...c, score: cosineSimilarity(qEmbed, chunkEmbeddings.get(c.id)!) }))
      .sort((a: any, b: any) => b.score - a.score);

    const hybridInputSparse = sparseResults.map((c: any) => ({ id: c.id, content: c.content, confidence: 1 }));
    const hybridInputDense = denseResults.map((c: any) => ({ id: c.id, content: c.content, confidence: 1, similarity: c.score }));
    
    const hybridUnweighted = reciprocalRankFusion(hybridInputDense, hybridInputSparse, 60);
    const hybridCalibrated = reciprocalRankFusion(hybridInputDense, hybridInputSparse, 60, {
      sparseWeight: 1.0,
      denseWeight: 0.3, // Sparse is better so favor sparse
      fallbackToSparseWhenDenseWeak: true,
      minDenseConfidence: 0.1
    });

    const rerankRaw = await localProvider.rerank(testCase.query, hybridCalibrated as any);
    const rerankResults = rerankRaw.candidates.map((c: any) => c.chunk);

    const extracted: any = {
      sparse: sparseResults.map((c: any) => c.id),
      pseudoDense: denseResults.map((c: any) => c.id),
      hybridUnweighted: hybridUnweighted.map((c: any) => c.id),
      hybridCalibrated: hybridCalibrated.map((c: any) => c.id),
      localRerank: rerankResults.map((c: any) => c.id)
    };

    for (const mode of modes) {
      metrics[mode].r3 += computeRecallAtK(testCase.expectedChunkIds, extracted[mode], 3);
      metrics[mode].r5 += computeRecallAtK(testCase.expectedChunkIds, extracted[mode], 5);
      metrics[mode].mrr5 += computeMRR(testCase.expectedChunkIds, extracted[mode], 5);
      metrics[mode].ndcg5 += computeNDCGAtK(testCase.expectedChunkIds, extracted[mode], 5);
      metrics[mode].cp5 += computeContextPrecision(testCase.expectedChunkIds, extracted[mode], 5);
    }
  }

  const tableData: any = {};
  for (const mode of modes) {
    tableData[mode] = {
      'Recall@3': metrics[mode].r3 / cases.length,
      'Recall@5': metrics[mode].r5 / cases.length,
      'MRR@5': metrics[mode].mrr5 / cases.length,
      'nDCG@5': metrics[mode].ndcg5 / cases.length,
      'Context Precision@5': metrics[mode].cp5 / cases.length
    };
  }
  console.table(tableData);

  const sparseR5 = tableData.sparse['Recall@5'];
  const hybridCalR5 = tableData.hybridCalibrated['Recall@5'];
  const hybridCalMRR5 = tableData.hybridCalibrated['MRR@5'];
  const hybridCalNDCG5 = tableData.hybridCalibrated['nDCG@5'];
  const rerankNDCG5 = tableData.localRerank['nDCG@5'];

  const resultsMd = `# Evaluation Results
Chunks: ${chunks.length}
Queries: ${cases.length}

` + JSON.stringify(tableData, null, 2);
  fs.writeFileSync(path.join(__dirname, 'latest-results.md'), resultsMd);

  console.log('\nThreshold checks:');
  let failed = false;
  
  if (sparseR5 < 0.75) { console.error(`Fail: sparse Recall@5 (${sparseR5}) < 0.75`); failed = true; }
  if (hybridCalR5 < 0.80) { console.error(`Fail: hybridCalibrated Recall@5 (${hybridCalR5}) < 0.80`); failed = true; }
  if (hybridCalMRR5 < 0.60) { console.error(`Fail: hybridCalibrated MRR@5 (${hybridCalMRR5}) < 0.60`); failed = true; }
  if (hybridCalNDCG5 < 0.60) { console.error(`Fail: hybridCalibrated nDCG@5 (${hybridCalNDCG5}) < 0.60`); failed = true; }
  if (rerankNDCG5 < hybridCalNDCG5 - 0.03) { console.error(`Fail: rerank nDCG@5 (${rerankNDCG5}) < hybridCalibrated nDCG@5 - 0.03 (${hybridCalNDCG5 - 0.03})`); failed = true; }
  
  // localRerank must change ranking order for at least one query
  const rerankChangedOrder = tableData.localRerank['nDCG@5'] !== tableData.hybridCalibrated['nDCG@5'] || tableData.localRerank['MRR@5'] !== tableData.hybridCalibrated['MRR@5'];
  if (!rerankChangedOrder) { 
    console.error(`Fail: localRerank did not change nDCG or MRR at all. It must alter ranking order.`);
    failed = true;
  }

  if (failed) {
    console.error('Thresholds not met!');
    process.exit(1);
  } else {
    console.log('All CI thresholds passed!');
  }
}

runEval().catch(err => {
  console.error(err);
  process.exit(1);
});
