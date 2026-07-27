import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkInfrastructureHealth } from './health';

describe('infrastructure health', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('reports optional services as not configured without making network calls', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.stubEnv('QDRANT_URL', '');
    vi.stubEnv('NEO4J_URI', '');
    vi.stubEnv('NEO4J_PASSWORD', '');
    vi.stubEnv('ARIZE_SPACE_ID', '');
    vi.stubEnv('ARIZE_API_KEY', '');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const report = await checkInfrastructureHealth();
    expect(report.components.every((item) => item.status === 'not_configured')).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
