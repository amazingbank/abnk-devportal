import { useContext } from 'react';

import { LocaleContext } from './locale-context';
import type { Common, Home, Locale, Nav, Timeline } from './resources';

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

export type { Locale };
