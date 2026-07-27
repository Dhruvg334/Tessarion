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
  ARIZE_SPACE_ID: optionalSecret,
  ARIZE_API_KEY: optionalSecret,
  ARIZE_PROJECT_NAME: z.string().min(1).default('tessarion'),
  ARIZE_OTLP_ENDPOINT: optionalUrl.default('https://otlp.arize.com/v1/traces'),
  OTEL_SERVICE_NAME: z.string().min(1).default('tessarion'),
  MCP_SERVER_TOKEN: optionalStrongSecret,
  INFRASTRUCTURE_HEALTH_TOKEN: optionalStrongSecret,
});

export type InfrastructureConfig = {
  qdrant?: { url: string; apiKey?: string; collectionName: string; denseVectorSize: number };
  neo4j?: { url: string; username: string; password: string; database: string };
  arize?: { spaceId: string; apiKey: string; projectName: string; endpoint: string; serviceName: string };
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
    arize: parsed.ARIZE_SPACE_ID && parsed.ARIZE_API_KEY ? {
      spaceId: parsed.ARIZE_SPACE_ID,
      apiKey: parsed.ARIZE_API_KEY,
      projectName: parsed.ARIZE_PROJECT_NAME,
      endpoint: parsed.ARIZE_OTLP_ENDPOINT,
      serviceName: parsed.OTEL_SERVICE_NAME,
    } : undefined,
    mcpServerToken: parsed.MCP_SERVER_TOKEN,
    infrastructureHealthToken: parsed.INFRASTRUCTURE_HEALTH_TOKEN,
  };
}
