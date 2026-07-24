import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordOperationalEvent } from './observability';

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: mockFrom
  })
}));

describe('observability service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
  });

  describe('recordOperationalEvent', () => {
    it('truncates safe message to 2000 chars', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      
      const longMessage = 'A'.repeat(2500);
      await recordOperationalEvent({
        workspaceId: 'ws1',
        userId: 'user1',
        eventType: 'source_added',
        safeMessage: longMessage,
        strict: true
      });
      
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          safe_message: 'A'.repeat(2000)
        })
      );
    });

    it('truncates oversized metadata', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      
      const bigMeta = { data: 'B'.repeat(6000) };
      await recordOperationalEvent({
        workspaceId: 'ws1',
        userId: 'user1',
        eventType: 'source_added',
        safeMessage: 'test',
        metadata: bigMeta,
        strict: true
      });
      
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            _truncated: true
          })
        })
      );
    });

    it('silently swallows DB errors in non-strict mode', async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await recordOperationalEvent({
        workspaceId: 'ws1',
        userId: 'user1',
        eventType: 'source_added',
        safeMessage: 'test'
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('throws AppError on DB error in strict mode', async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });
      
      try {
        await recordOperationalEvent({
          workspaceId: 'ws1',
          userId: 'user1',
          eventType: 'source_added',
          safeMessage: 'test',
          strict: true
        });
        expect.fail('Should have thrown');
      } catch (e: unknown) {
        expect((e as { code?: string }).code).toBe('DB_ERROR');
      }
    });
  });
});
