import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startTutoringSession, continueTutoringSession, completeTutoringSession, abandonTutoringSession } from './tutoring';
import { recordOperationalEvent } from './observability';

vi.mock('./observability', () => ({
  recordOperationalEvent: vi.fn(),
}));

const mockSelectTerminal = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

const mockBuilder = {
  eq: mockEq,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  select: mockSelect,
  order: mockOrder,
  limit: mockLimit,
  update: mockUpdate,
  insert: mockInsert,
  then: function(resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
    return mockSelectTerminal().then(resolve, reject);
  }
};

mockEq.mockReturnValue(mockBuilder);
mockSelect.mockReturnValue(mockBuilder);
mockOrder.mockReturnValue(mockBuilder);
mockLimit.mockReturnValue(mockBuilder);
mockUpdate.mockReturnValue(mockBuilder);
mockSingle.mockReturnValue(mockBuilder);
mockMaybeSingle.mockReturnValue(mockBuilder);
mockInsert.mockReturnValue(mockBuilder);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => mockBuilder
  })
}));

describe('tutoring service observability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectTerminal.mockResolvedValue({ data: [{ id: 'sess1' }], error: null });
    
    // For startTutoringSession / getTutoringSession we need to return single objects occasionally
    mockSingle.mockResolvedValue({ data: { id: 'ws1', status: 'active', workspace_id: 'ws1', user_id: 'user1', concept_id: 'c1' }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockReturnValue(mockBuilder);
  });

  it('should log tutoring_started event', async () => {
    await startTutoringSession({ workspaceId: 'ws1', userId: 'user1', conceptId: 'c1', reviewScheduleId: 'review1' });
    expect(recordOperationalEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'tutoring_started',
      workspaceId: 'ws1',
      userId: 'user1'
    }));
  });

  it('should log tutoring_turn_submitted event', async () => {
    await continueTutoringSession('ws1', 'user1', 'sess1', 'My answer');
    expect(recordOperationalEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'tutoring_turn_submitted',
      workspaceId: 'ws1',
      userId: 'user1'
    }));
  });

  it('should log tutoring_completed event', async () => {
    await completeTutoringSession('ws1', 'user1', 'sess1');
    expect(recordOperationalEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'tutoring_completed',
      workspaceId: 'ws1',
      userId: 'user1'
    }));
  });

  it('should log tutoring_abandoned event', async () => {
    await abandonTutoringSession('ws1', 'user1', 'sess1');
    expect(recordOperationalEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'tutoring_abandoned',
      workspaceId: 'ws1',
      userId: 'user1'
    }));
  });
});
