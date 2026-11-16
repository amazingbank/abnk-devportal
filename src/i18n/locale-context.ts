import { createContext } from 'react';
import type { Common, Decisions, Home, Locale, Nav, Timeline } from './resources';

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
  toggleLocale: () => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
