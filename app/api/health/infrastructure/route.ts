import { NextRequest, NextResponse } from 'next/server';
import { getInfrastructureConfig } from '@/lib/infrastructure/config';
import { checkInfrastructureHealth } from '@/lib/infrastructure/health';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const config = getInfrastructureConfig();
  if (config.infrastructureHealthToken) {
    const supplied = request.headers.get('authorization');
    if (supplied !== `Bearer ${config.infrastructureHealthToken}`) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' } }, { status: 401 });
    }
  }

  const report = await checkInfrastructureHealth();
  return NextResponse.json(report, {
    status: report.status === 'healthy' ? 200 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
