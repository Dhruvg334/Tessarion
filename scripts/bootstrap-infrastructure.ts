import { getInfrastructureConfig } from '../lib/infrastructure/config';
import { Neo4jHttpQueryClient } from '../lib/graph/neo4j/client';
import { QdrantRestClient } from '../lib/rag/qdrant/client';

async function main(): Promise<void> {
  const config = getInfrastructureConfig();

  if (config.qdrant) {
    const qdrant = new QdrantRestClient({
      url: config.qdrant.url,
      apiKey: config.qdrant.apiKey,
      collectionName: config.qdrant.collectionName,
      denseVectorSize: config.qdrant.denseVectorSize,
    });
    await qdrant.ensureCollection();
    console.log(`Qdrant collection ready: ${config.qdrant.collectionName}`);
  } else {
    console.log('Qdrant not configured; skipped.');
  }

  if (config.neo4j) {
    const neo4j = new Neo4jHttpQueryClient(config.neo4j);
    await neo4j.execute('CREATE INDEX concept_workspace_canonical IF NOT EXISTS FOR (concept:Concept) ON (concept.workspaceId, concept.canonicalId)');
    await neo4j.execute('CREATE INDEX concept_workspace_name IF NOT EXISTS FOR (concept:Concept) ON (concept.workspaceId, concept.name)');
    console.log('Neo4j projection indexes ready.');
  } else {
    console.log('Neo4j not configured; skipped.');
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Infrastructure bootstrap failed.';
  console.error(message);
  process.exitCode = 1;
});
