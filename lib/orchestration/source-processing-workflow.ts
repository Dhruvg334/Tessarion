export type SourceProcessingState = 'uploaded' | 'validating' | 'parsing' | 'chunking' | 'embedding' | 'extracting' | 'classifying' | 'graphing' | 'ready' | 'failed';
// TODO: Implement workflow logic
export function transitionSourceProcessing(state: SourceProcessingState) { return state; }
