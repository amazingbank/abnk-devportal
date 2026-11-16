import { useContext } from 'react';

import { LocaleContext } from './locale-context';
import type { Common, Home } from './resources';

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}

/** 布局级文案（导航/页脚/SEO meta）。 */
/** Layout-level copy (nav/footer/SEO meta). */
export function useCommon(): Common {
  return useLocale().common;
}

/** 页面级文案（全部 section）。 */
/** Page-level copy (all sections). */
export function useHome(): Home {
  return useLocale().home;
}
