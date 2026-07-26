import { getClientEnv } from '@/lib/config/env';
import { Neo4jHttpQueryClient } from '@/lib/graph/neo4j/client';
import { getInfrastructureConfig } from './config';

export type InfrastructureComponent = 'supabase' | 'qdrant' | 'neo4j' | 'phoenix';
export type InfrastructureStatus = 'healthy' | 'degraded' | 'not_configured';

export interface InfrastructureHealthItem {
  component: InfrastructureComponent;
  status: InfrastructureStatus;
  latencyMs?: number;
  safeMessage: string;
}

export interface InfrastructureHealthReport {
  status: 'healthy' | 'degraded';
  checkedAt: string;
  components: InfrastructureHealthItem[];
}

async function timedCheck(component: InfrastructureComponent, check: () => Promise<void>): Promise<InfrastructureHealthItem> {
  const startedAt = Date.now();
  try {
    await check();
    return { component, status: 'healthy', latencyMs: Date.now() - startedAt, safeMessage: 'Connection verified.' };
  } catch {
    return { component, status: 'degraded', latencyMs: Date.now() - startedAt, safeMessage: 'Connection could not be verified.' };
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 4_000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkInfrastructureHealth(): Promise<InfrastructureHealthReport> {
  const infra = getInfrastructureConfig();
  const client = getClientEnv();
  const components: InfrastructureHealthItem[] = [];

  if (client.supabaseUrl && client.supabaseAnonKey) {
    components.push(await timedCheck('supabase', async () => {
      const response = await fetchWithTimeout(`${client.supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        headers: { apikey: client.supabaseAnonKey },
      });
      if (!response.ok) throw new Error('unhealthy');
    }));
  } else {
    components.push({ component: 'supabase', status: 'not_configured', safeMessage: 'Supabase is not configured.' });
  }

  if (infra.qdrant) {
    components.push(await timedCheck('qdrant', async () => {
      const response = await fetchWithTimeout(`${infra.qdrant!.url.replace(/\/$/, '')}/readyz`, {
        headers: infra.qdrant!.apiKey ? { 'api-key': infra.qdrant!.apiKey } : undefined,
      });
      if (!response.ok) throw new Error('unhealthy');
    }));
  } else {
    components.push({ component: 'qdrant', status: 'not_configured', safeMessage: 'Qdrant is not configured; local retrieval fallback remains available.' });
  }

  if (infra.neo4j) {
    components.push(await timedCheck('neo4j', async () => {
      const client = new Neo4jHttpQueryClient(infra.neo4j!);
      const result = await client.execute<{ healthy: number }>('RETURN 1 AS healthy');
      if (result.data[0]?.healthy !== 1) throw new Error('unhealthy');
    }));
  } else {
    components.push({ component: 'neo4j', status: 'not_configured', safeMessage: 'Neo4j is not configured; canonical Postgres graph data remains available.' });
  }

  if (infra.phoenix?.url) {
    components.push(await timedCheck('phoenix', async () => {
      const response = await fetchWithTimeout(`${infra.phoenix!.url!.replace(/\/$/, '')}/healthz`);
      if (!response.ok) throw new Error('unhealthy');
    }));
  } else {
    components.push({ component: 'phoenix', status: 'not_configured', safeMessage: 'Phoenix is not configured; in-memory trace handling remains available.' });
  }

  return {
    status: components.some((item) => item.status === 'degraded') ? 'degraded' : 'healthy',
    checkedAt: new Date().toISOString(),
    components,
  };
}
