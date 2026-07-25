const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is', 'it',
  'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which', 'with',
]);

export function tokenizeForSparseSearch(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function stableTokenIndex(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface SparseVector {
  indices: number[];
  values: number[];
}

export function createSparseVector(text: string): SparseVector {
  const frequencies = new Map<number, number>();
  for (const token of tokenizeForSparseSearch(text)) {
    const index = stableTokenIndex(token);
    frequencies.set(index, (frequencies.get(index) ?? 0) + 1);
  }

  const entries = [...frequencies.entries()].sort(([left], [right]) => left - right);
  const maxFrequency = Math.max(1, ...entries.map(([, value]) => value));

  return {
    indices: entries.map(([index]) => index),
    values: entries.map(([, value]) => 1 + Math.log(value) / Math.log(maxFrequency + 1)),
  };
}

export function lexicalScore(query: string, content: string): { score: number; matchedTerms: string[] } {
  const queryTerms = [...new Set(tokenizeForSparseSearch(query))];
  const contentTerms = tokenizeForSparseSearch(content);
  const counts = new Map<string, number>();
  for (const term of contentTerms) counts.set(term, (counts.get(term) ?? 0) + 1);

  const matchedTerms = queryTerms.filter((term) => counts.has(term));
  if (queryTerms.length === 0 || matchedTerms.length === 0) return { score: 0, matchedTerms: [] };

  const coverage = matchedTerms.length / queryTerms.length;
  const frequency = matchedTerms.reduce((sum, term) => sum + Math.min(counts.get(term) ?? 0, 3), 0)
    / (queryTerms.length * 3);
  const exactPhrase = content.toLowerCase().includes(query.trim().toLowerCase()) ? 0.2 : 0;

  return {
    score: Math.min(1, coverage * 0.7 + frequency * 0.3 + exactPhrase),
    matchedTerms,
  };
}
