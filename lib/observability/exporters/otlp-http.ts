import { AppError } from '@/lib/errors/app-error';
import { SafeTraceSpanSchema, type SafeTraceSpan } from '@/lib/observability/trace-model';
import type { TraceExporter, TraceExportResult } from './types';

export interface OtlpHttpTraceExporterOptions {
  endpoint: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export class OtlpHttpTraceExporter implements TraceExporter {
  private readonly fetchImpl: typeof fetch;
  constructor(private readonly options: OtlpHttpTraceExporterOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async export(spans: readonly SafeTraceSpan[]): Promise<TraceExportResult> {
    const valid = spans.map((span) => SafeTraceSpanSchema.parse(span));
    if (valid.length === 0) return { accepted: 0, rejected: 0 };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 5000);
    try {
      const response = await this.fetchImpl(this.options.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(this.options.headers ?? {}) },
        body: JSON.stringify({ resourceSpans: [{ scopeSpans: [{ spans: valid }] }] }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new AppError('Trace export failed', 503, 'TRACE_EXPORT_FAILED');
      }
      return { accepted: valid.length, rejected: 0 };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Trace export failed', 503, 'TRACE_EXPORT_FAILED');
    } finally {
      clearTimeout(timer);
    }
  }
}
