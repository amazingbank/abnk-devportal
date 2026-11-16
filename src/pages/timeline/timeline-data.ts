import sprintIndexJson from '@/data/index/sprint-v0.0.1.json';
import type { SprintIndex, Widen } from '@/data/schema';

// 时间线数据模块（任务 3.2 的生产消费通道）：结构化索引的 JSON 产物在
// 编译期用 satisfies 锁死结构（键、嵌套、数组、数值），枚举值词表校验由
// 生成侧 fail-loud 承担——两层互补、零漂移面（与 sample.check.ts 同口径，
// 但这里导出为页面可消费的窄化形态）。
// Timeline data module (the production consumption channel of task 3.2):
// the JSON product of the structured index is structurally locked at compile
// time via satisfies (keys, nesting, arrays, numbers), while enum-vocabulary
// enforcement stays with the generator's fail-loud checks — the two layers
// complement each other (same stance as sample.check.ts, except this module
// exports a narrowed shape for page consumption).
const rawIndex = sprintIndexJson satisfies Widen<SprintIndex>;

/** 页面消费的宽化形态（JSON import 的枚举字段在 TS 侧为 string——渲染呈现不判定）。 */
/** The widened shape pages consume (enum fields of a JSON import are plain strings on the TS side — rendering presents, never judges). */
export type SprintData = Widen<SprintIndex>;

export const SPRINT_INDEX: SprintData = rawIndex;

export type PartData = SprintData['parts'][number];
export type DocData = PartData['docs'][number];
export type TaskData = PartData['tasks'][number];

/** 按 id 查找 Part（不存在返回 null，由调用方重定向回安全层）。 */
/** Find a part by id (null when absent; callers redirect to a safe level). */
export function findPart(partId: string | undefined): PartData | null {
  return SPRINT_INDEX.parts.find((p) => p.id === partId) ?? null;
}

/** 按 id 查找 Part 内任务。 */
/** Find a task inside a part by id. */
export function findTask(part: PartData, taskId: string | undefined): TaskData | null {
  return part.tasks.find((t) => t.id === taskId) ?? null;
}

/** Phase 文档（含 plan 文档——规划文档同为时间线的一层）。 */
/** Phase documents (the plan doc included — planning is itself a timeline layer). */
export function phaseDocsOf(part: PartData): DocData[] {
  return part.docs.filter((d) => d.phase !== undefined);
}

/** 伴生文档（无 Phase 归属的叙事/报告件——如实单列，不塞进 Phase 层）。 */
/** Companion docs (narrative/report entries with no phase attribution — listed as-is, never forced into a phase). */
export function companionDocsOf(part: PartData): DocData[] {
  return part.docs.filter((d) => d.phase === undefined);
}

/** 文档展示名（剥离仓库前缀与扩展名，如 PhaseP2-Gateway-Backend）。 */
/** Display name of a doc (strips the repo prefix and extension). */
export function docDisplayName(doc: string): string {
  return doc.replace(/^v[\d.]+-Part\d+-/, '').replace(/\.md$/, '');
}

/** 任务 id 的 Phase 前缀（'P2.4'→'P2'，'5.5'→'5'）。 */
/** Phase prefix of a task id ('P2.4'→'P2', '5.5'→'5'). */
export function taskPhaseKey(taskId: string): string {
  const dot = taskId.lastIndexOf('.');
  return dot > 0 ? taskId.slice(0, dot) : taskId;
}

/** 某 Phase 下的任务清单（按 id 前缀归属）。 */
/** Tasks of one phase (attribution by id prefix). */
export function tasksOfPhase(part: PartData, phase: string): TaskData[] {
  return part.tasks.filter((t) => taskPhaseKey(t.id) === phase);
}

/** 任务移交往返链查询：返回本任务的移交目标与承接来源（无则均为 null）。 */
/** Move round-trip lookup for a task: its move target and continuation source (both null when none). */
export function movedLinksFor(
  partId: string,
  taskId: string,
): { to: string | null; from: string | null } {
  const key = `${partId}:${taskId}`;
  const to = SPRINT_INDEX.moved_links.find((l) => l.from_task === key)?.to_task ?? null;
  const from = SPRINT_INDEX.moved_links.find((l) => l.to_task === key)?.from_task ?? null;
  return { to, from };
}

/** 人类可读的任务引用展示（'part04:1.1' → 'Part 04 · 任务 1.1'）。 */
/** Human-readable task reference display ('part04:1.1' → 'Part 04 · Task 1.1'). */
export function taskRefLabel(ref: string): string {
  const idx = ref.indexOf(':');
  const num = ref.slice(4, idx);
  return `Part ${num} · ${ref.slice(idx + 1)}`;
}

/**
 * 状态词 → 徽标视觉档位（五形态 done/doing/pending/moved/suspended 覆盖六值
 * 词表；词表外取保守的挂起档）。视觉档位只决定观感，标签文案仍取状态原词——
 * 渲染呈现状态、不判定状态。
 *
 * Status word → badge visual tier (five tiers done/doing/pending/moved/
 * suspended cover the six-value vocabulary; out-of-vocabulary words take the
 * conservative shelf tier). The tier only decides the visuals while the label
 * always shows the status's own word — rendering presents, never judges.
 */
export type BadgeKind = 'done' | 'doing' | 'pending' | 'moved' | 'suspended';

export function statusBadgeKind(status: string): BadgeKind {
  switch (status) {
    case 'completed':
      return 'done';
    case 'in_progress':
    case 'draft':
      return 'doing';
    case 'pending':
      return 'pending';
    case 'moved':
      return 'moved';
    default:
      return 'suspended';
  }
}
