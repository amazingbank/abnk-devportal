import metricsJson from '@/data/index/metrics-v0.0.1.json';
import type { Metrics, Widen } from '@/data/schema';
import { resolveRelativeLink, type ResolvedLink } from '@/lib/link-resolver';

// 指标数据模块（任务 3.4 的生产消费通道）：metrics JSON 产物在编译期用
// satisfies 锁死结构（键、嵌套、数组、数值），枚举词表（如 CiState）校验由
// 生成侧 fail-loud 承担——与 timeline-data 同口径，页面零原始格式耦合。
// Metrics data module (the production consumption channel of task 3.4): the
// metrics JSON product is structurally locked at compile time via satisfies
// (keys, nesting, arrays, numbers) while enum vocabularies (e.g. CiState)
// stay with the generator's fail-loud checks — same stance as
// timeline-data; pages carry zero raw-format coupling.
const rawMetrics = metricsJson satisfies Widen<Metrics>;

/** 页面消费的宽化形态（JSON import 的枚举字段在 TS 侧为 string——渲染呈现不判定）。 */
/** The widened shape pages consume (enum fields of a JSON import are plain strings — rendering presents, never judges). */
export type MetricsData = Widen<Metrics>;

export const METRICS: MetricsData = rawMetrics;

/**
 * 溯源链接（已知坑 2 的集中转换）：metrics 源字段是仓相对路径
 * （'Sprints/v0.0.1/…'）——统一经 link-resolver 解析为站内文档资产/证据
 * 资产（构建期 ?url 直供），解析不到时降级源仓镜像并由调用方标注。
 * 依据锚 = '/src/data/index/'（metrics JSON 自身在数据树的落点）。
 *
 * Source links (the single conversion point of pitfall 2): a metrics source
 * field is a repo-relative path ('Sprints/v0.0.1/…') — always resolved
 * through the link-resolver into in-tree doc/evidence assets (build-time
 * ?url serving), degrading to the source-repo mirror when unresolvable, with
 * the caller labelling the degradation. The anchor is '/src/data/index/'
 * (where the metrics JSON itself sits in the data tree).
 */
export function sourceLink(source: string): ResolvedLink {
  const rel = source.replace(/^Sprints\//, 'sprints/');
  return resolveRelativeLink('/src/data/index/', `../${rel}`);
}

/** 源路径的短展示名（'…/phase6/task6.3-final-walkthrough.md' → 'task6.3-final-walkthrough.md'）。 */
/** Short display name of a source path (basename only). */
export function sourceName(source: string): string {
  return source.split('/').pop() ?? source;
}

/** LOC 类目按行数降序的呈现副本（排序只是呈现形态，不改数据本身）。 */
/** A by-lines-descending presentation copy of the LOC categories (sorting is presentation only). */
export function locCategoriesByLines(m: MetricsData): MetricsData['loc']['categories'] {
  return [...m.loc.categories].sort((a, b) => b.lines - a.lines);
}

/** 大数千分位（界面呈现形态，不改数据）。 */
/** Thousands-separated display of large numbers (presentation only). */
export function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

/** Sprint 起止跨度（最早 start → 最晚 end，含首尾两端的天数）。 */
/** Sprint span (earliest start → latest end, both endpoints inclusive). */
export function sprintSpan(m: MetricsData): { start: string; end: string; days: number } {
  const starts = m.sprint_rhythm.map((r) => r.start).sort();
  const ends = m.sprint_rhythm.map((r) => r.end).sort();
  const start = starts[0] ?? '';
  const end = ends[ends.length - 1] ?? '';
  const days =
    start && end
      ? Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1
      : 0;
  return { start, end, days };
}
