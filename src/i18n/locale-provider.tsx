import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LOCALE_HTML_LANG } from './locale';
import { LocaleContext } from './locale-context';
import { parseLocaleFromPathname, swapLocalePrefix } from './locale-url';
import { DEFAULT_LOCALE, RESOURCES, type Locale } from './resources';

// 用户显式切换语言时写入的记录键（只写不读，URL 前缀才是唯一事实来源——与 abnk-website 一致）。
// Storage key written on explicit locale switches (write-only: the URL prefix
// remains the single source of truth, same as abnk-website).
const LOCALE_STORAGE_KEY = 'abnk-devportal-locale';

// 任务 3.1：引入 React Router 后，LocaleProvider 移入 BrowserRouter 内部——
// 语言切换从「裸 pushState + popstate 监听」改为「router navigate 单通道」，
// URL 与渲染语言不再有两条历史栈写入路径。
// Task 3.1: with React Router in place, LocaleProvider now lives inside the
// BrowserRouter — locale switching moved from raw pushState + a popstate
// listener to the single router navigate channel, eliminating the second
// history-stack writer.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [locale, setLocaleState] = useState<Locale>(
    () => parseLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE,
  );

  // <html lang>、<title>、meta description 随语言同步更新。
  // Keep <html lang>, <title> and meta description in sync with the locale.
  useEffect(() => {
    const { common } = RESOURCES[locale];
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
    document.title = common.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', common.meta.description);
  }, [locale]);

  // URL → 状态同步：语言唯一事实来源是 URL 前缀；路由位置变化（前进/后退/
  // 程序导航）后回读对齐，保证渲染语言与地址栏永不背离。
  // URL → state sync: the URL prefix is the single source of truth; after every
  // router location change (back/forward/programmatic), re-align so rendering
  // never diverges from the address bar.
  useEffect(() => {
    const next = parseLocaleFromPathname(location.pathname);
    if (next && next !== locale) setLocaleState(next);
  }, [location.pathname, locale]);

  // 切换保持在客户端完成：router navigate 交换 URL 前缀（保留 query 与锚点，
  // 不触发页面刷新），组件随新语言包就地重渲染。
  // Locale switching stays client-side: router navigate swaps the URL prefix
  // (keeping query and hash) with no reload; components re-render in place.
  const toggleLocale = useCallback(() => {
    const target: Locale = locale === 'en-us' ? 'zh-cn' : 'en-us';
    const nextPathname = swapLocalePrefix(location.pathname, target);
    navigate(`${nextPathname}${location.search}${location.hash}`);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, target);
    } catch {
      // 存储不可用：本次会话内生效即可。
      // Storage unavailable: in-session switching is enough.
    }
    setLocaleState(target);
  }, [locale, location.pathname, location.search, location.hash, navigate]);

  const value = useMemo(() => ({ locale, ...RESOURCES[locale], toggleLocale }), [locale, toggleLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
