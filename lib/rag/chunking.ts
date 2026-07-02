/**
 * Tessarion - Deterministic Text Chunking Utility
 */

export interface ChunkResult {
  content: string;
  chunkIndex: number;
  charStart: number;
  charEnd: number;
  tokenCount: number;
  sectionHint: string;
}

export interface ChunkingOptions {
  maxTokens?: number;
  overlapTokens?: number;
}

/**
 * Extremely basic token estimation (approx 4 chars per token for English).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Splits text into chunks deterministically based on paragraph/sentence boundaries.
 */
export function chunkText(text: string, options?: ChunkingOptions): ChunkResult[] {
  const maxTokens = options?.maxTokens || 600;
  const overlapTokens = options?.overlapTokens || 100;
  
  if (!text.trim()) return [];

  // Very naive split by double newline first (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);
  
  const chunks: ChunkResult[] = [];
  let currentContent = '';
  let currentCharStart = 0;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;

    const potentialContent = currentContent ? `${currentContent}\n\n${p}` : p;
    const tokens = estimateTokens(potentialContent);

    if (tokens > maxTokens && currentContent) {
      // Push current
      chunks.push({
        content: currentContent,
        chunkIndex,
        charStart: currentCharStart,
        charEnd: currentCharStart + currentContent.length,
        tokenCount: estimateTokens(currentContent),
        sectionHint: 'Text section',
      });
      chunkIndex++;
      
      // Calculate overlap (naive: take last N characters based on overlap tokens)
      const overlapChars = overlapTokens * 4;
      const overlapText = currentContent.length > overlapChars 
        ? currentContent.slice(-overlapChars) 
        : currentContent;

      currentCharStart = currentCharStart + currentContent.length - overlapText.length + 2; // +2 for newlines
      currentContent = `${overlapText}\n\n${p}`;
    } else {
      currentContent = potentialContent;
    }
  }

  if (currentContent) {
    chunks.push({
      content: currentContent,
      chunkIndex,
      charStart: currentCharStart,
      charEnd: currentCharStart + currentContent.length,
      tokenCount: estimateTokens(currentContent),
      sectionHint: 'Text section',
    });
  }

  return chunks;
}
