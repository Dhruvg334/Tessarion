export interface ChunkResult {
  content: string;
  chunkIndex: number;
  charStart: number;
  charEnd: number;
  tokenCount: number;
  sectionHint?: string;
}

export function chunkText(text: string, options: { maxTokens?: number, overlapTokens?: number } = {}): ChunkResult[] {
  if (!text || text.trim() === '') return [];
  const maxTokens = options.maxTokens || 600;
  
  const paragraphs = text.split(/\n\n+/);
  const chunks: ChunkResult[] = [];
  let currentContent = '';
  let currentStart = 0;
  let chunkIndex = 0;
  let currentHint = '';

  for (const p of paragraphs) {
    // Detect headings
    const headingMatch = p.match(/^(#{1,6})\s+(.+)$/m);
    if (headingMatch) {
      currentHint = headingMatch[2].trim();
    }

    const approxTokens = p.length / 4;
    
    if (currentContent && (currentContent.length / 4) + approxTokens > maxTokens) {
      chunks.push({
        content: currentContent.trim(),
        chunkIndex: chunkIndex++,
        charStart: currentStart,
        charEnd: currentStart + currentContent.length,
        tokenCount: Math.floor(currentContent.length / 4),
        sectionHint: currentHint || undefined
      });
      currentContent = '';
      currentStart += currentContent.length + 2;
    }
    
    currentContent += (currentContent ? '\n\n' : '') + p;
  }
  
  if (currentContent.trim()) {
    chunks.push({
      content: currentContent.trim(),
      chunkIndex: chunkIndex++,
      charStart: currentStart,
      charEnd: currentStart + currentContent.length,
      tokenCount: Math.floor(currentContent.length / 4),
      sectionHint: currentHint || undefined
    });
  }
  
  return chunks;
}
