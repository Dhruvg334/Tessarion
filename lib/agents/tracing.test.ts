import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrace, updateTraceState, completeTrace } from './tracing';

// Mock the service client
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
    })
  })
}));

describe('tracing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain step history in trace context and write to output_summary', async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    const trace = await createTrace('ws1', 'user1', 'test-agent');

    expect(trace.steps.length).toBe(1);
    expect(trace.steps[0].state).toBe('started');

    mockEq.mockResolvedValueOnce({ error: null });
    await updateTraceState(trace, 'step_one');

    expect(trace.steps.length).toBe(2);
    expect(trace.steps[1].state).toBe('step_one');

    const updateArgs = mockUpdate.mock.calls[0][0];
    expect(updateArgs.action).toBe('step_one');
    expect(updateArgs.output_summary.steps).toBeDefined();
    expect(updateArgs.output_summary.steps.length).toBe(2);

    mockEq.mockResolvedValueOnce({ error: null });
    await completeTrace(trace, 'success', { warnings: [] } as any, false);

    expect(trace.steps.length).toBe(2); // completeTrace doesn't push a step itself
    const finalArgs = mockUpdate.mock.calls[1][0];
    expect(finalArgs.output_summary.steps.length).toBe(2);
  });
});
