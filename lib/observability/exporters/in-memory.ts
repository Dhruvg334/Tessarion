import type { SafeTraceSpan } from '@/lib/observability/trace-model';
import type { TraceExporter, TraceExportResult } from './types';

export class InMemoryTraceExporter implements TraceExporter {
  readonly spans: SafeTraceSpan[] = [];
  async export(spans: readonly SafeTraceSpan[]): Promise<TraceExportResult> {
    this.spans.push(...spans.map((span) => structuredClone(span)));
    return { accepted: spans.length, rejected: 0 };
  }
}
