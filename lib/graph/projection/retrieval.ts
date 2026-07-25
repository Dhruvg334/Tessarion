import type { HybridCandidate } from '@/lib/rag/hybrid/types';
import type { GraphProjectionStore, GraphTraversalQuery, GraphTraversalResult } from './types';

export interface GraphAugmentedRetrievalInput {
  candidates: HybridCandidate[];
  graphQuery: GraphTraversalQuery;
}

export interface GraphAugmentedRetrievalResult {
  candidates: HybridCandidate[];
  graph: GraphTraversalResult;
  diagnostics: {
    graphEvidenceChunkCount: number;
    graphBoostedCandidateCount: number;
    graphPathCount: number;
  };
}

export async function augmentRetrievalWithGraph(
  input: GraphAugmentedRetrievalInput,
  graphStore: GraphProjectionStore,
): Promise<GraphAugmentedRetrievalResult> {
  const graph = await graphStore.traverse(input.graphQuery);
  const graphEvidenceChunkIds = new Set(graph.paths.flatMap((path) => path.evidenceChunkIds));
  let graphBoostedCandidateCount = 0;

  const candidates = input.candidates
    .map((candidate) => {
      if (!graphEvidenceChunkIds.has(candidate.id)) return candidate;
      graphBoostedCandidateCount += 1;
      const graphBoost = 0.08;
      return {
        ...candidate,
        rerankScore: Math.min(1, (candidate.rerankScore ?? candidate.fusionScore) + graphBoost),
      };
    })
    .sort((a, b) => (b.rerankScore ?? b.fusionScore) - (a.rerankScore ?? a.fusionScore));

  return {
    candidates,
    graph,
    diagnostics: {
      graphEvidenceChunkCount: graphEvidenceChunkIds.size,
      graphBoostedCandidateCount,
      graphPathCount: graph.paths.length,
    },
  };
}
