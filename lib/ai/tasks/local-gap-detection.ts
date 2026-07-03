import { GapFindingOutput } from '../types';

export interface LocalGapDetectionOptions {
  studentExplanation: string;
  conceptName: string;
  conceptDefinition?: string;
  sourceChunks?: { id: string; content: string }[];
  prerequisiteConcepts?: string[];
}

export async function detectGapsLocal(options: LocalGapDetectionOptions): Promise<GapFindingOutput[]> {
  const { studentExplanation, conceptName, conceptDefinition = '', sourceChunks = [], prerequisiteConcepts = [] } = options;
  const gaps: GapFindingOutput[] = [];
  const text = studentExplanation.toLowerCase();

  // Basic length heuristic
  if (text.length < 20) {
    gaps.push({
      gapType: 'shallow_explanation',
      description: 'The explanation is too brief to demonstrate full understanding.',
      severity: 'moderate',
      sourceEvidence: sourceChunks.length > 0 ? sourceChunks[0].content.substring(0, 100) : '',
      sourceChunkIds: sourceChunks.slice(0, 1).map(c => c.id),
      confidenceScore: 0.8,
      groundingStatus: 'verified',
      extractionMethod: 'local_deterministic'
    });
    return gaps; // Return early if too shallow
  }

  // 1. Missing Concept (check if the core concept itself is never named or described)
  // We'll just check if the name is mentioned
  const nameParts = conceptName.toLowerCase().split(' ');
  const hasName = nameParts.some(part => part.length > 3 && text.includes(part)) || text.includes(conceptName.toLowerCase());
  
  if (!hasName) {
    gaps.push({
      gapType: 'missing_concept',
      description: `The explanation does not explicitly mention or clearly refer to '${conceptName}'.`,
      severity: 'significant',
      sourceEvidence: conceptDefinition.substring(0, 100),
      sourceChunkIds: sourceChunks.slice(0, 1).map(c => c.id), // Pick first chunk as evidence
      confidenceScore: 0.9,
      groundingStatus: 'verified',
      extractionMethod: 'local_deterministic'
    });
  }

  // 2. Missing Prerequisite
  for (const prereq of prerequisiteConcepts) {
    if (!text.includes(prereq.toLowerCase())) {
      gaps.push({
        gapType: 'missing_prerequisite',
        description: `The explanation fails to connect to the prerequisite concept '${prereq}'.`,
        severity: 'moderate',
        sourceEvidence: sourceChunks.length > 0 ? sourceChunks[0].content.substring(0, 100) : '',
        sourceChunkIds: sourceChunks.slice(0, 1).map(c => c.id),
        confidenceScore: 0.7,
        groundingStatus: 'unverified',
        extractionMethod: 'local_deterministic'
      });
      break; // Only report one to avoid spam
    }
  }

  // 3. Shallow Explanation (Definition Keyword Coverage)
  // Extract long words from definition
  if (conceptDefinition) {
    const defWords = conceptDefinition.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 5);
    const uniqueDefWords = Array.from(new Set(defWords));
    if (uniqueDefWords.length > 0) {
      const matched = uniqueDefWords.filter(w => text.includes(w));
      const coverage = matched.length / uniqueDefWords.length;
      
      if (coverage < 0.2 && text.length < 100) {
        gaps.push({
          gapType: 'shallow_explanation',
          description: 'The explanation lacks depth and key terminology.',
          severity: 'moderate',
          sourceEvidence: conceptDefinition,
          sourceChunkIds: sourceChunks.slice(0, 1).map(c => c.id),
          confidenceScore: 0.75,
          groundingStatus: 'verified',
          extractionMethod: 'local_deterministic'
        });
      }
    }
  }

  // 4. Unsupported claim mockup (look for extreme absolute words in student text)
  const absoluteWords = ['always', 'never', 'impossible', 'perfectly'];
  for (const word of absoluteWords) {
    if (text.includes(word)) {
      // Find the sentence containing the word
      const sentences = studentExplanation.split(/(?<=[.?!])\s+/);
      const sentence = sentences.find(s => s.toLowerCase().includes(word));
      if (sentence) {
        gaps.push({
          gapType: 'unsupported_claim',
          description: `The use of '${word}' suggests an absolute claim that may not be supported.`,
          severity: 'minor',
          sourceEvidence: '',
          sourceChunkIds: [],
          claimText: sentence,
          reason: `Absolute term '${word}' usually indicates a misconception or overgeneralization.`,
          studentExplanationSpan: sentence,
          confidenceScore: 0.6,
          groundingStatus: 'verified', // Technically grounded in student text
          extractionMethod: 'local_deterministic'
        });
      }
      break;
    }
  }

  // 5. Misconception (mockup based on contradiction words)
  const contradictionWords = ['unlike', 'instead of', 'opposite'];
  for (const word of contradictionWords) {
    if (text.includes(word)) {
      const sentences = studentExplanation.split(/(?<=[.?!])\s+/);
      const sentence = sentences.find(s => s.toLowerCase().includes(word));
      if (sentence && sourceChunks.length > 0) {
        gaps.push({
          gapType: 'misconception',
          description: `The phrase '${word}' might imply a misunderstanding of the relationship.`,
          severity: 'moderate',
          sourceEvidence: sourceChunks[0].content.substring(0, 100),
          sourceChunkIds: [sourceChunks[0].id],
          confidenceScore: 0.65,
          groundingStatus: 'verified',
          extractionMethod: 'local_deterministic'
        });
        break;
      }
    }
  }

  return gaps;
}
