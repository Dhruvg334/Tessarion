import { AppError } from '@/lib/errors/app-error';
import { SafeTraceSpanSchema, type SafeTraceSpan } from '@/lib/observability/trace-model';
import type { TraceExporter, TraceExportResult } from './types';

export interface OtlpHttpTraceExporterOptions {
  endpoint: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  serviceName?: string;
}

interface OtlpAttribute {
  key: string;
  value: { stringValue?: string; intValue?: string; doubleValue?: number; boolValue?: boolean };
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
        body: JSON.stringify(toOtlpPayload(valid, this.options.serviceName ?? 'tessarion')),
        signal: controller.signal,
      });
      if (!response.ok) throw new AppError('Trace export failed', 503, 'TRACE_EXPORT_FAILED');
      return { accepted: valid.length, rejected: 0 };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Trace export failed', 503, 'TRACE_EXPORT_FAILED');
    } finally {
      clearTimeout(timer);
    }
  }
}

function toOtlpPayload(spans: SafeTraceSpan[], serviceName: string) {
  return {
    resourceSpans: [{
      resource: { attributes: [{ key: 'service.name', value: { stringValue: serviceName } }] },
      scopeSpans: [{
        scope: { name: 'tessarion.safe-trace-exporter', version: '1.0.0' },
        spans: spans.map(toOtlpSpan),
      }],
    }],
  };
}

function toOtlpSpan(span: SafeTraceSpan) {
  const endedAt = span.endedAt ?? span.startedAt;
  const attributes: OtlpAttribute[] = [
    attribute('tessarion.kind', span.kind),
    attribute('tessarion.workspace_id', span.workspaceId),
    attribute('tessarion.user_id', span.userId),
    attribute('tessarion.request_id', span.requestId),
    ...optionalAttributes(span),
    ...Object.entries(span.attributes).flatMap(([key, value]) => value === null ? [] : [attribute(key, value)]),
  ];

  return {
    traceId: uuidToOtlpId(span.traceId, 32),
    spanId: uuidToOtlpId(span.spanId, 16),
    ...(span.parentSpanId ? { parentSpanId: uuidToOtlpId(span.parentSpanId, 16) } : {}),
    name: span.name,
    kind: 1,
    startTimeUnixNano: isoToUnixNanos(span.startedAt),
    endTimeUnixNano: isoToUnixNanos(endedAt),
    attributes,
    status: {
      code: span.status === 'ok' ? 1 : span.status === 'error' ? 2 : 0,
      ...(span.safeErrorCode ? { message: span.safeErrorCode } : {}),
    },
  };
}

function optionalAttributes(span: SafeTraceSpan): OtlpAttribute[] {
  const values: Record<string, string | number | boolean | null> = {
    'tessarion.workflow.name': span.workflowName,
    'tessarion.workflow.version': span.workflowVersion,
    'tessarion.node.name': span.nodeName,
    'tessarion.prompt.id': span.promptId,
    'tessarion.prompt.version': span.promptVersion,
    'tessarion.prompt.hash': span.promptHash,
    'tessarion.provider.id': span.providerId,
    'tessarion.model.id': span.modelId,
    'tessarion.tool.name': span.toolName,
    'tessarion.duration_ms': span.durationMs,
    'tessarion.error.code': span.safeErrorCode,
  };
  return Object.entries(values).flatMap(([key, value]) => value === null ? [] : [attribute(key, value)]);
}

function attribute(key: string, value: string | number | boolean): OtlpAttribute {
  if (typeof value === 'boolean') return { key, value: { boolValue: value } };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { key, value: { intValue: String(value) } }
      : { key, value: { doubleValue: value } };
  }
  return { key, value: { stringValue: value } };
}

function uuidToOtlpId(value: string, length: 16 | 32): string {
  const hex = value.replaceAll('-', '');
  return length === 32 ? hex.padEnd(32, '0').slice(0, 32) : hex.padEnd(16, '0').slice(-16);
}

function isoToUnixNanos(value: string): string {
  return (BigInt(Date.parse(value)) * 1_000_000n).toString();
}
