import { MetricsDashboard } from './metrics/MetricsDashboard';

// 指标仪表盘板块页（任务 3.1 挂载点；任务 3.4 起挂正式仪表盘——
// metrics 契约消费 + 诚实性组件，占位的「规划中」卡片随之退役）。
// Metrics section page (task 3.1 mount point; since task 3.4 it mounts the
// real dashboard — metrics-contract consumption plus the honesty widgets,
// retiring the placeholder "planned" card).
export function MetricsPage() {
  return <MetricsDashboard />;
}
