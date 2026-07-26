export interface SystemReadiness {
  overall: 'ready' | 'limited';
  generation: 'configured' | 'not_configured';
  embeddings: 'external' | 'local';
  reranking: 'local';
  workflowRuntime: 'ready';
  checkpointStore: 'ready';
  qdrant: 'configured' | 'not_configured';
  neo4j: 'configured' | 'not_configured';
}

export function getSystemReadiness(): SystemReadiness {
  const generation = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'configured' : 'not_configured';
  const qdrant = process.env.QDRANT_URL ? 'configured' : 'not_configured';
  const neo4j = process.env.NEO4J_URI ? 'configured' : 'not_configured';

  return {
    overall: generation === 'configured' ? 'ready' : 'limited',
    generation,
    embeddings: generation === 'configured' ? 'external' : 'local',
    reranking: 'local',
    workflowRuntime: 'ready',
    checkpointStore: 'ready',
    qdrant,
    neo4j,
  };
}
