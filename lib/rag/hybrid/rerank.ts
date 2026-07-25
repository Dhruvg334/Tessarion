import { lexicalScore } from './sparse';
import type { CandidateReranker, HybridCandidate } from './types';

export class DeterministicHybridReranker implements CandidateReranker {
  async rerank(query: string, candidates: HybridCandidate[]): Promise<HybridCandidate[]> {
    return candidates
      .map((candidate) => {
        const lexical = lexicalScore(query, candidate.content);
        const dense = candidate.denseScore ?? 0;
        const sparse = candidate.sparseScore ?? 0;
        const agreementBonus = candidate.denseRank !== undefined && candidate.sparseRank !== undefined ? 0.08 : 0;
        const sectionBonus = candidate.sectionHint && lexical.matchedTerms.some((term) =>
          candidate.sectionHint?.toLowerCase().includes(term)) ? 0.05 : 0;

        return {
          ...candidate,
          matchedTerms: lexical.matchedTerms,
          rerankScore: candidate.fusionScore * 10 + dense * 0.35 + sparse * 0.35
            + lexical.score * 0.3 + agreementBonus + sectionBonus,
        };
      })
      .sort((left, right) => (right.rerankScore ?? 0) - (left.rerankScore ?? 0));
  }
}
