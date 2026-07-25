export interface Neo4jHttpConfig {
  url: string;
  username: string;
  password: string;
  database?: string;
  requestTimeoutMs?: number;
}

export interface Neo4jQueryResult<TRecord> {
  data: TRecord[];
  counters?: Record<string, number>;
}

export interface Neo4jQueryExecutor {
  execute<TRecord>(statement: string, parameters?: Record<string, unknown>): Promise<Neo4jQueryResult<TRecord>>;
}
