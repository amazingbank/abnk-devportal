// 消费契约（Sprint v0.0.1 Part04 任务 1.2）：portal 对数据形态的全部假设集中于此。
// 供给侧 = abnk-asdm 仓 scripts/gen-sprint-index.py（任务 1.1 交付）；两侧是同一
// 形态的两个表述——schema 演进必须双侧同步改，Phase 3 页面只消费类型不解析原始 md
// （Plan 文档「契约漂移风险」条目的互证口径，V1.2.3 是互证门）。
// Consumption contract (Part04 task 1.2): every assumption the portal makes
// about the data shape lives here. The producer side is gen-sprint-index.py
// in the abnk-asdm repo; the two sides express the same shape and must evolve
// together, while Phase 3 pages only consume these types and never parse raw
// markdown (V1.2.3 is the cross-proof gate).

/** 状态词表（与生成器 VALID_STATUS 逐词对齐：✅/⏳/🚧/🔁/🟢/🟡 的映射产物）。 */
/** Status vocabulary, word-for-word with the generator's VALID_STATUS set. */
export type Status = 'completed' | 'pending' | 'in_progress' | 'moved' | 'planned-backlog' | 'draft';

/**
 * 数据集 locale 枚举（Part04 任务 2.3 起）：zh-CN 全量主 + en-US 增量语义
 * 重写（决策 D3/D4——en 是语义重写不是翻译，按 doc id 对称生长）。
 *
 * Locale enum of the dataset (since Part04 task 2.3): zh-CN carries full
 * coverage while en-US grows incrementally as semantic rewrites (decision
 * D3/D4 — English editions are rewrites, not translations; they grow per
 * doc id).
 */
export type Locale = 'zh-CN' | 'en-US';

/** Part 内单篇文档的索引条目（来自文档 front-matter）。 */
/** Index entry of a single document inside a part (from its front-matter). */
export interface DocEntry {
  doc: string;
  status: Status;
  date: string;
  locale: Locale;
  evidence: string;
  /** Phase 编号（'0'–'7' 或 'plan' 等语义标签）。 */
  /** Phase number ('0'–'7') or a semantic label such as 'plan'. */
  phase?: string;
  /** 文档级备注（front-matter doc-note，如范围扩展声明）。 */
  /** Document-level note (front-matter doc-note, e.g. a scope-extension note). */
  'doc-note'?: string;
  /** 移交目标（如 'part04:1.1'——跨 Part 任务移交的审计线索）。 */
  /** Migration target (e.g. 'part04:1.1') — the audit trail of a cross-part task move. */
  moved_to?: string;
}

/** Plan 进度表中的任务条目。 */
/** A task row from the Plan progress table. */
export interface TaskEntry {
  id: string;
  title: string;
  status: Status;
  /** emoji 状态备注（'✅（…）' / '⏳' 等）。 */
  /** Emoji status note ('✅(…)' / '⏳' and the like). */
  note?: string;
}

/** 一个 Part（交付单元）的索引条目。 */
/** Index entry of one delivery part. */
export interface PartEntry {
  id: string;
  status: Status;
  date: string;
  docs: DocEntry[];
  tasks: TaskEntry[];
}

/** portal-content 分区状态词表（与生成器 PORTAL_STATUS 对齐）。 */
/** portal-content status vocabulary, aligned with the generator's PORTAL_STATUS. */
export type PortalStatus = 'published' | 'in_progress' | 'draft';

/**
 * portal-content 分区的索引条目（Part04 任务 2.3 locale 路由）：同一 doc id
 * 逐 locale 注册——双语 doc 双条目（双 locale 注册），单语 doc 单条目且带
 * fallback 标记（值 = 仅有 locale）。渲染层按 locale 字段路由、按 fallback
 * 回退，无需扫描目录树。
 *
 * Index entry of the portal-content partition (Part04 task 2.3 locale
 * routing): one entry per locale of the same doc id — a bilingual doc has
 * two entries (both locales registered), a monolingual doc one entry with a
 * fallback marker (its value = the only available locale). The render side
 * routes on `locale` and falls back on `fallback`; no directory scanning.
 */
export interface PortalContentEntry {
  /** 分区名（overview / methodology / governance——与目录名一致）。 */
  /** Section name (overview / methodology / governance — matches the directory). */
  section: string;
  doc: string;
  locale: Locale;
  status: PortalStatus;
  date?: string;
  /** 单语 doc 的回退标记（双语 doc 无此字段）。 */
  /** Fallback marker of a monolingual doc (absent on bilingual docs). */
  fallback?: Locale;
}

/** $INDEX/sprint-v0.0.1.yaml 的顶层形态（satisfies 校验样例经 Widen 消费）。 */
/** Top-level shape of $INDEX/sprint-v0.0.1.yaml (consumed via Widen by the satisfies sample). */
export interface SprintIndex {
  schema_version: number;
  sprint: string;
  parts: PartEntry[];
  /** portal-content 分区条目（任务 2.3 起；生成器 fail-loud 保证非空）。 */
  /** portal-content section entries (since task 2.3; the generator's fail-loud checks guarantee non-emptiness). */
  portal_content: PortalContentEntry[];
}

/** 达成/总计计数（VP、单测、E2E 断言）。 */
/** Passed/total counters (VP, unit tests, E2E assertions). */
export interface Count {
  passed: number;
  total: number;
}

/** LOC 规模曲线的类目与总计（count-loc.sh 快照）。 */
/** LOC curve categories and total (count-loc.sh snapshot). */
export interface LocCategory {
  files: number;
  label: string;
  lines: number;
}

export interface LocTotal {
  files: number;
  label: string;
  lines: number;
}

export interface LocMetrics {
  categories: LocCategory[];
  snapshot: string;
  total: LocTotal;
}

/** 挂账清单条目（人工维护，D6 诚实性——每条带出处与复验计划）。 */
/** A blocked-item entry (manually curated per the D6 honesty rule; each cites its source and replay plan). */
export interface BlockedItem {
  id: string;
  title: string;
  part: string;
  source: string;
  replay: string;
}

/** Sprint 节奏（Part 起止日期差）。 */
/** Sprint rhythm (per-part start/end date spans). */
export interface SprintRhythmEntry {
  part: string;
  start: string;
  end: string;
  days: number;
}

/** CI 状态（如实标注：v0.0.1 未实跑即 'not_run'，不虚构）。 */
/** CI status (honest labelling: 'not_run' means not actually run in v0.0.1). */
export type CiState = 'not_run' | 'passing' | 'failing';

export interface CiStatus {
  status: CiState;
  note: string;
}

/** 测试报告四指标（源：Part02 Phase P2 Test-Report，source 字段记源路径）。 */
/** The four test-report figures (source: Part02 Phase P2 Test-Report, path kept in `source`). */
export interface TestReport {
  vp: Count;
  unit_tests: Count;
  e2e_assertions: Count;
  contract_drift: number;
  source: string;
}

/** $INDEX/metrics-v0.0.1.json 的顶层形态。 */
/** Top-level shape of $INDEX/metrics-v0.0.1.json. */
export interface Metrics {
  schema_version: number;
  sprint: string;
  adr_count: number;
  blocked_items: BlockedItem[];
  ci: CiStatus;
  /** 各 Part 证据密度（artifacts 文件计数）。 */
  /** Evidence density per part (artifact file counts). */
  evidence_density: Record<string, number>;
  loc: LocMetrics;
  moved_count: number;
  sprint_rhythm: SprintRhythmEntry[];
  test_report: TestReport;
}

/**
 * 深层宽化工具（与 i18n resources 的 Widen 同源同义）。
 *
 * 用途：JSON import 的字符串属性在 TS 中推断为 string，无法直接 satisfies
 * 含枚举（Status/CiState）的契约；`satisfies Widen<SprintIndex>` 保持全部
 * 结构约束（键、嵌套、数组、数值），枚举值的校验由生成器 fail-loud 词表
 * 承担（V1.1.7 已演示拦截），两者互补、零漂移面。
 *
 * Deep-widening helper, same in spirit as the i18n Widen.
 * JSON imports type their string properties as plain `string`, which cannot
 * directly satisfy a contract containing enums (Status/CiState). Using
 * `satisfies Widen<SprintIndex>` keeps every structural constraint (keys,
 * nesting, arrays, numbers) while enum-value enforcement stays with the
 * generator's fail-loud vocabulary check (demonstrated by V1.1.7) — the two
 * layers complement each other with zero drift surface.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number | boolean | null
    ? T
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;
