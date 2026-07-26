import { z } from 'zod';

const optionalUrl = z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional());
const optionalSecret = z.preprocess((value) => value === '' ? undefined : value, z.string().optional());
const optionalStrongSecret = z.preprocess((value) => value === '' ? undefined : value, z.string().min(24).optional());

const infrastructureSchema = z.object({
  QDRANT_URL: optionalUrl,
  QDRANT_API_KEY: optionalSecret,
  QDRANT_COLLECTION: z.string().min(1).default('tessarion_workspace_chunks_v1'),
  QDRANT_DENSE_VECTOR_SIZE: z.coerce.number().int().positive().default(768),
  NEO4J_URI: optionalUrl,
  NEO4J_USERNAME: z.string().min(1).default('neo4j'),
  NEO4J_PASSWORD: optionalSecret,
  NEO4J_DATABASE: z.string().min(1).default('neo4j'),
  PHOENIX_URL: optionalUrl,
  PHOENIX_COLLECTOR_ENDPOINT: optionalUrl,
  OTEL_SERVICE_NAME: z.string().min(1).default('tessarion'),
  MCP_SERVER_TOKEN: optionalStrongSecret,
  INFRASTRUCTURE_HEALTH_TOKEN: optionalStrongSecret,
});

export type InfrastructureConfig = {
  qdrant?: { url: string; apiKey?: string; collectionName: string; denseVectorSize: number };
  neo4j?: { url: string; username: string; password: string; database: string };
  phoenix?: { url?: string; collectorEndpoint?: string; serviceName: string };
  mcpServerToken?: string;
  infrastructureHealthToken?: string;
};

export function getInfrastructureConfig(env: NodeJS.ProcessEnv = process.env): InfrastructureConfig {
  const parsed = infrastructureSchema.parse(env);
  return {
    qdrant: parsed.QDRANT_URL ? {
      url: parsed.QDRANT_URL,
      apiKey: parsed.QDRANT_API_KEY,
      collectionName: parsed.QDRANT_COLLECTION,
      denseVectorSize: parsed.QDRANT_DENSE_VECTOR_SIZE,
    } : undefined,
    neo4j: parsed.NEO4J_URI && parsed.NEO4J_PASSWORD ? {
      url: parsed.NEO4J_URI,
      username: parsed.NEO4J_USERNAME,
      password: parsed.NEO4J_PASSWORD,
      database: parsed.NEO4J_DATABASE,
    } : undefined,
    phoenix: parsed.PHOENIX_URL || parsed.PHOENIX_COLLECTOR_ENDPOINT ? {
      url: parsed.PHOENIX_URL,
      collectorEndpoint: parsed.PHOENIX_COLLECTOR_ENDPOINT,
      serviceName: parsed.OTEL_SERVICE_NAME,
    } : undefined,
    mcpServerToken: parsed.MCP_SERVER_TOKEN,
    infrastructureHealthToken: parsed.INFRASTRUCTURE_HEALTH_TOKEN,
  };
}
