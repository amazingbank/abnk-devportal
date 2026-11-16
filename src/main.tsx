import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LocaleProvider } from '@/i18n/locale-provider';
import { resolveBrowserLocale } from '@/i18n/locale';
import { parseLocaleFromPathname } from '@/i18n/locale-url';

// 字体包（@fontsource-variable）随 Phase 3 UI 实装引入；当前骨架阶段零外部依赖。
// Font packages (@fontsource-variable) land with Phase 3 UI work; the skeleton
// stage intentionally carries no font dependency.
import './index.css';

const locale = parseLocaleFromPathname(window.location.pathname);

if (locale === null) {
  // 无语言前缀的 URL（遗留路径、非法前缀）重置为浏览器检测语言的首页：
  // 全页 replace、reset 语义（有意丢弃 path/query/hash），与 abnk-website 一致。
  // Prefix-less URLs (legacy paths, invalid prefixes) reset to the browser
  // locale home via a full page replace, dropping path/query/hash by design.
  window.location.replace(`/${resolveBrowserLocale()}/`);
} else {
  // 规范化语言根路径的尾斜杠（"/en-us" → "/en-us/"），保持单一规范形态。
  // Normalize the locale root trailing slash ("/en-us" → "/en-us/").
  if (window.location.pathname === `/${locale}`) {
    window.history.replaceState(null, '', `/${locale}/${window.location.search}${window.location.hash}`);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </StrictMode>
  );
}
