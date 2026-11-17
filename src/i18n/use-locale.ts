import { useContext } from 'react';

import { LocaleContext } from './locale-context';
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

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}

/** 布局级文案（页壳/页脚/SEO meta）。 */
/** Layout-level copy (shell/footer/SEO meta). */
export function useCommon(): Common {
  return useLocale().common;
}

/** 首页页面级文案（导览 hero + 板块目录）。 */
/** Home page copy (directory hero + section cards). */
export function useHome(): Home {
  return useLocale().home;
}

/** 导航级文案（八板块导航 + 各板块页面标题/描述/交付任务标注）。 */
/** Navigation-level copy (eight-section nav + section page titles/descriptions). */
export function useNav(): Nav {
  return useLocale().nav;
}

/** 时间线页文案（四层下钻/状态词表/移交往返）。 */
/** Timeline copy (four-level drill-down, status vocabulary, move round-trip). */
export function useTimeline(): Timeline {
  return useLocale().timeline;
}

/** 决策时间线页文案（ADR 状态词表/卡标签/修订上下文）。 */
/** Decision-timeline copy (ADR status vocabulary, card labels, revision context). */
export function useDecisions(): Decisions {
  return useLocale().decisions;
}

/** 指标仪表盘页文案（四指标/节奏/密度/LOC/诚实性标注）。 */
/** Metrics-dashboard copy (four quality figures, rhythm, density, LOC, honesty labels). */
export function useMetrics(): MetricsCopy {
  return useLocale().metrics;
}

/** E2E 旅程页文案（步骤/载体/诚实性标注）。 */
/** E2E-journey copy (steps, carriers, honesty labels). */
export function useJourney(): Journey {
  return useLocale().journey;
}

/** 证据浏览页文案（文档/索引/素材卡）。 */
/** Evidence-browsing copy (documents, index, material cards). */
export function useEvidence(): EvidenceCopy {
  return useLocale().evidence;
}

/** 方法论板块页文案（篇章列表/回链/加载态）。 */
/** Methodology section copy (chapter list, back link, load states). */
export function useMethodology(): MethodologyCopy {
  return useLocale().methodology;
}

/** 规划板块页文案（分区标签/回链/加载态）。 */
/** Planning section copy (section labels, back link, load states). */
export function usePlanning(): PlanningCopy {
  return useLocale().planning;
}

/** 治理板块页文案（导读卡/加载态）。 */
/** Governance section copy (guide card, load states). */
export function useGovernance(): GovernanceCopy {
  return useLocale().governance;
}

export type { Locale };
