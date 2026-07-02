import { RetrievedChunk, RagContext, CitationReference } from './types';

export function buildRagContext(chunks: RetrievedChunk[], maxTokens = 3000): RagContext {
  let totalTokens = 0;
  let text = '';
  const citations: CitationReference[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (totalTokens + chunk.tokenCount > maxTokens) break;
    
    totalTokens += chunk.tokenCount;
    citations.push({
      id: `[${i + 1}]`,
      chunkId: chunk.id,
      documentId: chunk.sourceDocumentId,
      index: i + 1
    });

    const hint = chunk.sectionHint ? ` (Section: ${chunk.sectionHint})` : '';
    text += `Source [${i + 1}]${hint}:\n${chunk.content}\n\n`;
  }

  return { text: text.trim(), citations, totalTokens };
}

export function formatCitationsForPrompt(citations: CitationReference[]): string {
  return citations.map(c => `[${c.index}] -> ${c.documentId}`).join('\n');
}
