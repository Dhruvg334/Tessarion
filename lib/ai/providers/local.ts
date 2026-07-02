import { EmbeddingProvider, RerankProvider } from './types';

// Deterministic hash of string to a bag-of-words/n-gram vector
function pseudoRandomEmbed(text: string): number[] {
  const vec = new Array(768).fill(0);
  // Extract words and trigrams
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Fill vector based on trigram hashes
  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.substring(i, i + 3);
    let hash = 0;
    for (let j = 0; j < 3; j++) {
      hash = ((hash << 5) - hash) + trigram.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 768;
    vec[index] += 1;
  }
  
  // Normalize vector (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < 768; i++) sumSq += vec[i] * vec[i];
  const mag = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < 768; i++) vec[i] = vec[i] / mag;
  
  return vec;
}

export const localProvider: EmbeddingProvider & RerankProvider = {
  id: 'local',
  displayName: 'Local Deterministic (CI/Dev Only)',
  isConfigured: () => true,
  embedDocument: async (text) => pseudoRandomEmbed(text),
  embedQuery: async (text) => pseudoRandomEmbed(text),
  embedDocuments: async (texts) => texts.map(pseudoRandomEmbed),
  rerank: async (query, candidates) => {
    const qEmbed = pseudoRandomEmbed(query);
    const cosineSimilarity = (a: number[], b: number[]) => {
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
      }
      return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
    };

    return {
      candidates: candidates.map(c => {
        let score = (c.rrfScore || 0.0) * 100;
        
        // Dense similarity bonus
        const cEmbed = pseudoRandomEmbed(c.content);
        const sim = cosineSimilarity(qEmbed, cEmbed);
        score += sim * 0.5;

        // Small phrase tiebreaker
        if (c.content.toLowerCase().includes(query.toLowerCase())) {
          score += 0.1;
        }

        return { chunk: c, score };
      }).sort((a, b) => b.score - a.score)
    };
  }
};
