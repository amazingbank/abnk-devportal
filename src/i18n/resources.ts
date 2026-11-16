// 语言资源注册表（同构复刻 abnk-website 的 src/i18n/resources.ts——第三次复刻）。
//
// 与 website 的差异：portal 是过程资产渲染器（D4 build-time 静态），语言包同样
// 静态 import 打进主包；D3 口径「UI 双语 + 内容 zh 全量 + en 增量 fallback」，
// 兜底语言取 zh-cn（内容主语言），与官网「国际银行 en 优先」相反。
// 任务 3.1 扩展：nav 命名空间（八板块导航与页面级词条）自 common 中独立成包；
// 任务 3.2 扩展：timeline 命名空间（四层下钻页词条：状态词表/层级标题/移交往返）；
// 任务 3.3 扩展：decisions 命名空间（决策时间线：ADR 状态词表/卡标签/修订上下文）。
// Locale resource registry (isomorphic copy of abnk-website resources.ts, third reuse).
// Difference: portal default locale is zh-cn (the primary content language per D3),
// the inverse of the marketing website's en-first stance.
// Task 3.1 addition: the nav namespace (eight-section navigation and page-level
// copy) is now a separate pack, split out of common.
// Task 3.2 addition: the timeline namespace (four-level drill-down copy:
// status vocabulary, level titles, move round-trip labels).
// Task 3.3 addition: the decisions namespace (decision timeline: ADR status
// vocabulary, card labels, revision-context labels).
import zhCommon from './locales/zh-cn/common.json';
import zhHome from './locales/zh-cn/home.json';
import zhNav from './locales/zh-cn/nav.json';
import zhTimeline from './locales/zh-cn/timeline.json';
import zhDecisions from './locales/zh-cn/decisions.json';
import enCommon from './locales/en-us/common.json';
import enHome from './locales/en-us/home.json';
import enNav from './locales/en-us/nav.json';
import enTimeline from './locales/en-us/timeline.json';
import enDecisions from './locales/en-us/decisions.json';

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

export type Translations = {
  common: Common;
  home: Home;
  nav: Nav;
  timeline: Timeline;
  decisions: Decisions;
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
} satisfies Translations;

export const RESOURCES: Record<Locale, Translations> = {
  'zh-cn': {
    common: zhCommon,
    home: zhHome,
    nav: zhNav,
    timeline: zhTimeline,
    decisions: zhDecisions,
  },
  'en-us': english,
};
