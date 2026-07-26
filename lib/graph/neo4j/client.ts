import { AppError } from '@/lib/errors/app-error';
import type { Neo4jHttpConfig, Neo4jQueryExecutor, Neo4jQueryResult } from './types';

interface Neo4jQueryApiResponse {
  data?: {
    fields?: string[];
    values?: unknown[][];
  };
  errors?: Array<{ code?: string; message?: string }>;
  counters?: Record<string, number>;
}

export class Neo4jHttpQueryClient implements Neo4jQueryExecutor {
  private readonly database: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: Neo4jHttpConfig) {
    this.database = config.database ?? 'neo4j';
    this.timeoutMs = config.requestTimeoutMs ?? 5_000;
  }

  async execute<TRecord>(statement: string, parameters: Record<string, unknown> = {}): Promise<Neo4jQueryResult<TRecord>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.config.url.replace(/\/$/, '')}/db/${encodeURIComponent(this.database)}/query/v2`, {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ statement, parameters }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AppError('Graph projection service is unavailable', 503, 'GRAPH_SERVICE_UNAVAILABLE');
      }

      const payload = await response.json() as Neo4jQueryApiResponse;
      if (payload.errors?.length) {
        throw new AppError('Graph query failed', 502, 'GRAPH_QUERY_FAILED');
      }

      const fields = payload.data?.fields ?? [];
      const rows = payload.data?.values ?? [];
      const data = rows.map((values) => Object.fromEntries(fields.map((field, index) => [field, values[index]])) as TRecord);
      return { data, counters: payload.counters };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('Graph query timed out', 504, 'GRAPH_QUERY_TIMEOUT');
      }
      throw new AppError('Graph projection service is unavailable', 503, 'GRAPH_SERVICE_UNAVAILABLE');
    } finally {
      clearTimeout(timeout);
    }
  }
}
