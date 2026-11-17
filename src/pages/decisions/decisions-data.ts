import { SPRINT_INDEX, type SprintData } from '@/pages/timeline/timeline-data';

// 决策页数据模块（任务 3.3）：结构化索引的 ADR 区与 Part 决策区在此窄化导出，
// 与时间线共用同一份索引加载（timeline-data 为共享数据模块——单一消费点，
// 契约互证逻辑不复制两份）。ADR 原文按「已知坑 1」的懒加载形态取用：
// import.meta.glob + ?raw 按需分块，3.3 的首个路由级 code-splitting 落地。
// 任务 3.6 起 stripMetaHeader 上提至渲染管线（@/lib/markdown/meta）——六页面
// 文档渲染共用（此处不再自有实现）。
// Decision-page data module (task 3.3): narrows and re-exports the index's ADR
// and part-decision regions, sharing the same index load with the timeline
// (timeline-data acts as the shared module — a single consumption point, so
// the contract cross-proof is never duplicated). ADR originals follow the
// known-pitfall-1 lazy shape: import.meta.glob + ?raw chunks on demand — the
// first route-level code-splitting, landing here in 3.3. Since task 3.6 the
// front-matter stripper lives in the render pipeline (@/lib/markdown/meta),
// shared by all six document pages (no local copy here anymore).
export type AdrData = SprintData['adrs'][number];
export type DecisionData = NonNullable<SprintData['parts'][number]['decisions']>[number];
export type PartLike = SprintData['parts'][number];

export const ADRS: AdrData[] = SPRINT_INDEX.adrs;

export function findAdr(adrId: string | undefined): AdrData | null {
  if (!adrId || !/^\d{3}$/.test(adrId)) return null;
  return ADRS.find((a) => a.id === adrId) ?? null;
}

/** ADR 原文（含元信息头）的懒加载映射：key = 数据树绝对路径。 */
/** Lazy-load map of ADR originals (metadata header included): key = absolute data-tree path. */
const adrRawModules = import.meta.glob('/src/data/planning/abnk-design/adr/zh-CN/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

export function loadAdrRaw(doc: string): (() => Promise<string>) | null {
  return adrRawModules[`/src/data/planning/abnk-design/adr/zh-CN/${doc}`] ?? null;
}

/** ADR 原文在数据树的绝对路径（markdown 相对链接的解析锚）。 */
/** Absolute data-tree path of an ADR original (the relative-link anchor). */
export function adrDataPath(doc: string): string {
  return `/src/data/planning/abnk-design/adr/zh-CN/${doc}`;
}

/** Part Plan 文档在数据树的绝对路径（D 卡内容相对链接的解析锚）。 */
/** Absolute data-tree path of a Part Plan doc (the D-card content link anchor). */
export function planDataPath(partId: string): string {
  const part = SPRINT_INDEX.parts.find((p) => p.id === partId);
  const planDoc = part?.docs.find((d) => d.doc.endsWith('-Plan.md'));
  return `/src/data/sprints/v0.0.1/${partId}/zh-CN/${planDoc?.doc ?? ''}`;
}

/** 全部 Part 决策卡（含 Part 归属），拍板日期内联或取表头日期。 */
/** Every part decision card (with part attribution); dates are inline or the table heading's. */
export interface PartDecision {
  partId: string;
  partNum: string;
  decision: DecisionData;
}

export function partDecisions(): PartDecision[] {
  return SPRINT_INDEX.parts.flatMap((p) =>
    (p.decisions ?? []).map((d) => ({ partId: p.id, partNum: p.id.slice(4), decision: d })),
  );
}
