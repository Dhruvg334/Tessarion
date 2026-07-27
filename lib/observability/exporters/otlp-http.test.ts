import { describe, expect, it, vi } from 'vitest';
import { createTraceSpan } from '@/lib/observability/trace-model';
import { OtlpHttpTraceExporter } from './otlp-http';

function span() {
  return createTraceSpan({
    traceId: crypto.randomUUID(), parentSpanId: null, kind: 'workflow', name: 'diagnosis',
    workspaceId: crypto.randomUUID(), userId: crypto.randomUUID(), requestId: crypto.randomUUID(),
    workflowName: 'diagnosis', workflowVersion: '1.0.0', nodeName: null, promptId: null, promptVersion: null,
    promptHash: null, providerId: null, modelId: null, toolName: null, attributes: {}, safeErrorCode: null,
  });
}

describe('OtlpHttpTraceExporter', () => {
  it('exports validated safe spans', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const exporter = new OtlpHttpTraceExporter({
      endpoint: 'http://localhost/v1/traces',
      headers: { 'arize-space-id': 'space', 'arize-api-key': 'secret' },
      serviceName: 'tessarion',
      projectName: 'tessarion',
      fetchImpl: fetchImpl as never,
    });
    await expect(exporter.export([span()])).resolves.toEqual({ accepted: 1, rejected: 0 });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const request = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.resourceSpans[0].resource.attributes).toEqual(expect.arrayContaining([
      { key: 'service.name', value: { stringValue: 'tessarion' } },
      { key: 'openinference.project.name', value: { stringValue: 'tessarion' } },
    ]));
    expect(request.headers).toMatchObject({
      'arize-space-id': 'space',
      'arize-api-key': 'secret',
    });
    expect(payload.resourceSpans[0].scopeSpans[0].spans[0].traceId).toHaveLength(32);
    expect(payload.resourceSpans[0].scopeSpans[0].spans[0].spanId).toHaveLength(16);
  });

  it('returns a safe error on transport failure', async () => {
    const exporter = new OtlpHttpTraceExporter({ endpoint: 'http://localhost/v1/traces', fetchImpl: vi.fn().mockRejectedValue(new Error('secret')) as never });
    await expect(exporter.export([span()])).rejects.toMatchObject({ code: 'TRACE_EXPORT_FAILED' });
  });
});
