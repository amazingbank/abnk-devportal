import { createContext } from 'react';
import type {
  Common,
  Decisions,
  EvidenceCopy,
  GovernanceCopy,
  Home,
  Journey,
  Locale,
  MetricsCopy,
  MethodologyCopy,
  Nav,
  PlanningCopy,
  Timeline,
} from './resources';

type LocaleContextValue = {
  locale: Locale;
  /** 布局级文案（页壳/页脚/SEO meta），随语言同步就绪。 */
  /** Layout-level copy (shell/footer/SEO meta), ready as the locale switches. */
  common: Common;
  /** 页面级文案（首页导览），随语言同步就绪。 */
  /** Page-level copy (home directory), ready as the locale switches. */
  home: Home;
  /** 导航级文案（八板块导航与板块页面标题/描述），随语言同步就绪。 */
  /** Navigation-level copy (eight-section nav and section page titles), ready as the locale switches. */
  nav: Nav;
  /** 时间线页文案（四层下钻/状态词表/移交往返），随语言同步就绪。 */
  /** Timeline copy (four-level drill-down, status vocabulary, move round-trip), ready as the locale switches. */
  timeline: Timeline;
  /** 决策时间线页文案（ADR 状态词表/卡标签/修订上下文），随语言同步就绪。 */
  /** Decision-timeline copy (ADR status vocabulary, card labels, revision context), ready as the locale switches. */
  decisions: Decisions;
  /** 指标仪表盘页文案（四指标/节奏/密度/LOC/诚实性标注），随语言同步就绪。 */
  /** Metrics-dashboard copy (four quality figures, rhythm, density, LOC, honesty labels), ready as the locale switches. */
  metrics: MetricsCopy;
  /** E2E 旅程页文案（步骤/载体/诚实性标注），随语言同步就绪。 */
  /** E2E-journey copy (steps, carriers, honesty labels), ready as the locale switches. */
  journey: Journey;
  /** 证据浏览页文案（文档/索引/素材卡），随语言同步就绪。 */
  /** Evidence-browsing copy (documents, index, material cards), ready as the locale switches. */
  evidence: EvidenceCopy;
  /** 方法论板块页文案（篇章列表/回链/加载态），随语言同步就绪。 */
  /** Methodology section copy (chapter list, back link, load states), ready as the locale switches. */
  methodology: MethodologyCopy;
  /** 规划板块页文案（分区标签/回链/加载态），随语言同步就绪。 */
  /** Planning section copy (section labels, back link, load states), ready as the locale switches. */
  planning: PlanningCopy;
  /** 治理板块页文案（导读卡/加载态），随语言同步就绪。 */
  /** Governance section copy (guide card, load states), ready as the locale switches. */
  governance: GovernanceCopy;
  toggleLocale: () => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
