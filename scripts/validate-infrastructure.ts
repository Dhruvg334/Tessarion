import { checkInfrastructureHealth } from '../lib/infrastructure/health';

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
