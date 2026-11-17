// 语言资源注册表（同构复刻 abnk-website 的 src/i18n/resources.ts——第三次复刻）。
//
// 与 website 的差异：portal 是过程资产渲染器（D4 build-time 静态），语言包同样
// 静态 import 打进主包；D3 口径「UI 双语 + 内容 zh 全量 + en 增量 fallback」，
// 兜底语言取 zh-cn（内容主语言），与官网「国际银行 en 优先」相反。
// 任务 3.1 扩展：nav 命名空间（八板块导航与页面级词条）自 common 中独立成包；
// 任务 3.2 扩展：timeline 命名空间（四层下钻页词条：状态词表/层级标题/移交往返）；
// 任务 3.3 扩展：decisions 命名空间（决策时间线：ADR 状态词表/卡标签/修订上下文）；
// 任务 3.4 扩展：metrics 命名空间（指标仪表盘：四指标/节奏/密度/LOC/诚实性标注）；
// 任务 3.5 扩展：journey 命名空间（E2E 旅程：步骤/载体/诚实性标注）；
// 任务 3.6 扩展：evidence/methodology/planning/governance 命名空间（证据浏览
// 的文档/索引/素材卡 + 三板块正式页词条——六任务收口，占位退役）。
// Locale resource registry (isomorphic copy of abnk-website resources.ts, third reuse).
// Difference: portal default locale is zh-cn (the primary content language per D3),
// the inverse of the marketing website's en-first stance.
// Task 3.1 addition: the nav namespace (eight-section navigation and page-level
// copy) is now a separate pack, split out of common.
// Task 3.2 addition: the timeline namespace (four-level drill-down copy:
// status vocabulary, level titles, move round-trip labels).
// Task 3.3 addition: the decisions namespace (decision timeline: ADR status
// vocabulary, card labels, revision-context labels).
// Task 3.4 addition: the metrics namespace (dashboard: four quality figures,
// rhythm, density, LOC, honesty labelling).
// Task 3.5 addition: the journey namespace (E2E journey: steps, carriers,
// honesty labelling).
// Task 3.6 additions: the evidence/methodology/planning/governance
// namespaces (document/index/material-card copy for evidence browsing plus
// the three real section pages — the six-task closing, placeholders retired).
import zhCommon from './locales/zh-cn/common.json';
import zhHome from './locales/zh-cn/home.json';
import zhNav from './locales/zh-cn/nav.json';
import zhTimeline from './locales/zh-cn/timeline.json';
import zhDecisions from './locales/zh-cn/decisions.json';
import zhMetrics from './locales/zh-cn/metrics.json';
import zhJourney from './locales/zh-cn/journey.json';
import zhEvidence from './locales/zh-cn/evidence.json';
import zhMethodology from './locales/zh-cn/methodology.json';
import zhPlanning from './locales/zh-cn/planning.json';
import zhGovernance from './locales/zh-cn/governance.json';
import enCommon from './locales/en-us/common.json';
import enHome from './locales/en-us/home.json';
import enNav from './locales/en-us/nav.json';
import enTimeline from './locales/en-us/timeline.json';
import enDecisions from './locales/en-us/decisions.json';
import enMetrics from './locales/en-us/metrics.json';
import enJourney from './locales/en-us/journey.json';
import enEvidence from './locales/en-us/evidence.json';
import enMethodology from './locales/en-us/methodology.json';
import enPlanning from './locales/en-us/planning.json';
import enGovernance from './locales/en-us/governance.json';

export type Locale = 'en-us' | 'zh-cn';

/** 无前缀 URL 重定向时的兜底语言（浏览器检测结果优先）。 */
/** Fallback locale for prefix-less URL redirects (browser detection wins when available). */
export const DEFAULT_LOCALE: Locale = 'zh-cn';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en-us', label: 'English' },
  { code: 'zh-cn', label: '中文' },
];

/** Widens literal types from JSON imports so translated resources stay assignable. */
type Widen<T> = T extends string
  ? string
  : T extends number | boolean | null
    ? T
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

/** 语言包结构，以中文包（文案原始来源）推导；英文包受同一结构约束。 */
/** Locale pack shape, derived from the zh pack (source of copy truth); en is structurally bound to it. */
export type Common = Widen<typeof zhCommon>;
export type Home = Widen<typeof zhHome>;
export type Nav = Widen<typeof zhNav>;
export type Timeline = Widen<typeof zhTimeline>;
export type Decisions = Widen<typeof zhDecisions>;
// 命名为 MetricsCopy 而非 Metrics：与 @/data/schema 的数据契约 Metrics 接口
// 区分（页面文件常同时消费两者，同名会让 import 互相遮蔽）。
// Named MetricsCopy rather than Metrics: it stays distinct from the data
// contract interface Metrics in @/data/schema (pages routinely consume both,
// and identical names would shadow each other at import sites).
export type MetricsCopy = Widen<typeof zhMetrics>;
export type Journey = Widen<typeof zhJourney>;
export type EvidenceCopy = Widen<typeof zhEvidence>;
export type MethodologyCopy = Widen<typeof zhMethodology>;
export type PlanningCopy = Widen<typeof zhPlanning>;
export type GovernanceCopy = Widen<typeof zhGovernance>;

export type Translations = {
  common: Common;
  home: Home;
  nav: Nav;
  timeline: Timeline;
  decisions: Decisions;
  metrics: MetricsCopy;
  journey: Journey;
  evidence: EvidenceCopy;
  methodology: MethodologyCopy;
  planning: PlanningCopy;
  governance: GovernanceCopy;
};

// 编译期结构校验：英文包键结构必须与中文包完全一致（Widen/satisfies 同构惯例）。
// Compile-time structural check: the en pack must match the zh pack key-for-key
// (the Widen/satisfies isomorphic convention).
const english = {
  common: enCommon,
  home: enHome,
  nav: enNav,
  timeline: enTimeline,
  decisions: enDecisions,
  metrics: enMetrics,
  journey: enJourney,
  evidence: enEvidence,
  methodology: enMethodology,
  planning: enPlanning,
  governance: enGovernance,
} satisfies Translations;

export const RESOURCES: Record<Locale, Translations> = {
  'zh-cn': {
    common: zhCommon,
    home: zhHome,
    nav: zhNav,
    timeline: zhTimeline,
    decisions: zhDecisions,
    metrics: zhMetrics,
    journey: zhJourney,
    evidence: zhEvidence,
    methodology: zhMethodology,
    planning: zhPlanning,
    governance: zhGovernance,
  },
  'en-us': english,
};
