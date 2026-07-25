import type { SafeTraceSpan } from '@/lib/observability/trace-model';

export interface TraceExportResult {
  accepted: number;
  rejected: number;
}

export interface TraceExporter {
  export(spans: readonly SafeTraceSpan[]): Promise<TraceExportResult>;
  shutdown?(): Promise<void>;
}
