import { z } from 'zod';

const optionalUrl = z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional());
const optionalSecret = z.preprocess((value) => value === '' ? undefined : value, z.string().optional());
const optionalStrongSecret = z.preprocess((value) => value === '' ? undefined : value, z.string().min(24).optional());

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
});

export const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  GOOGLE_GENERATIVE_AI_API_KEY: optionalSecret,
  INNGEST_EVENT_KEY: optionalSecret,
  INNGEST_SIGNING_KEY: optionalSecret,
  TESSARION_APP_URL: z.string().url().default('http://localhost:3000'),
  QDRANT_URL: optionalUrl,
  QDRANT_API_KEY: optionalSecret,
  QDRANT_COLLECTION: z.string().optional(),
  QDRANT_DENSE_VECTOR_SIZE: z.coerce.number().int().positive().optional(),
  NEO4J_URI: optionalUrl,
  NEO4J_USERNAME: z.string().optional(),
  NEO4J_PASSWORD: optionalSecret,
  NEO4J_DATABASE: z.string().optional(),
  ARIZE_SPACE_ID: optionalSecret,
  ARIZE_API_KEY: optionalSecret,
  ARIZE_PROJECT_NAME: z.string().optional(),
  ARIZE_OTLP_ENDPOINT: optionalUrl,
  OTEL_SERVICE_NAME: z.string().optional(),
  MCP_SERVER_TOKEN: optionalStrongSecret,
  INFRASTRUCTURE_HEALTH_TOKEN: optionalStrongSecret,
});

export function hasSupabaseClientEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function assertSupabaseClientEnv() {
  if (!hasSupabaseClientEnv()) {
    throw new Error('Supabase client environment variables are missing');
  }
}

export function assertGeminiEnv() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is missing');
  }
}

export function getClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!result.success) {
    return { supabaseUrl: '', supabaseAnonKey: '', siteUrl: undefined };
  }
  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: result.data.NEXT_PUBLIC_SITE_URL,
  };
}

export function getServerEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error('Invalid server environment: ' + JSON.stringify(result.error.format()));
  }
  return {
    supabaseServiceRoleKey: result.data.SUPABASE_SERVICE_ROLE_KEY,
    geminiKey: result.data.GOOGLE_GENERATIVE_AI_API_KEY,
    appUrl: result.data.TESSARION_APP_URL,
    qdrantUrl: result.data.QDRANT_URL,
    qdrantApiKey: result.data.QDRANT_API_KEY,
    qdrantCollection: result.data.QDRANT_COLLECTION,
    qdrantDenseVectorSize: result.data.QDRANT_DENSE_VECTOR_SIZE,
    neo4jUri: result.data.NEO4J_URI,
    neo4jUsername: result.data.NEO4J_USERNAME,
    neo4jPassword: result.data.NEO4J_PASSWORD,
    neo4jDatabase: result.data.NEO4J_DATABASE,
    arizeSpaceId: result.data.ARIZE_SPACE_ID,
    arizeApiKey: result.data.ARIZE_API_KEY,
    arizeProjectName: result.data.ARIZE_PROJECT_NAME,
    arizeOtlpEndpoint: result.data.ARIZE_OTLP_ENDPOINT,
    otelServiceName: result.data.OTEL_SERVICE_NAME,
  };
}

export const clientEnv = getClientEnv();
export const serverEnv = (typeof window === 'undefined' ? getServerEnv() : {}) as ReturnType<typeof getServerEnv>;
