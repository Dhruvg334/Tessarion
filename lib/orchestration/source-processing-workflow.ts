export type SourceProcessingState = 'uploaded' | 'validating' | 'parsing' | 'chunking' | 'embedding' | 'extracting' | 'classifying' | 'graphing' | 'ready' | 'failed';
export function transitionSourceProcessing(state: SourceProcessingState) { return state; }
