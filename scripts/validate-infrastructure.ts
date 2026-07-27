import { checkInfrastructureHealth } from '../lib/infrastructure/health';

async function main(): Promise<void> {
  const report = await checkInfrastructureHealth();
  console.table(report.components.map((item) => ({
    component: item.component,
    status: item.status,
    latencyMs: item.latencyMs ?? '-',
    message: item.safeMessage,
  })));

  if (report.components.some((item) => item.status === 'degraded')) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Infrastructure validation failed.';
  console.error(message);
  process.exitCode = 1;
});
