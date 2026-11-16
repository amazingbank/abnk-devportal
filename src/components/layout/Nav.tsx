import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useLocale, useNav } from '@/i18n';
import { SECTION_ROUTES } from '@/router';

// 全站导航（任务 3.1）：品牌 → 首页；九板块 NavLink 带激活态；语言切换；
// 移动端折叠菜单（路由切换即收起）。形态复刻 abnk-website 的 Nav（sticky +
// backdrop-blur + 端口段复刻的浅色 tokens 皮肤）。
// Site-wide navigation (task 3.1): brand links home; nine section NavLinks
// with active states; a locale toggle; a collapsible mobile menu that closes
// on route change. The form mirrors the abnk-website Nav (sticky +
// backdrop-blur), re-skinned with the light palette of this repo's tokens.
export function Nav() {
  const { common, locale, toggleLocale } = useLocale();
  const nav = useNav();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // 路由或语言切换即收起移动端菜单，防止菜单滞留遮盖新页面。
  // Close the mobile menu on any route or locale change so the overlay
  // never lingers over the next page.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[13px] tracking-[0.04em] transition-colors duration-200 ${
      isActive ? 'text-copper-600' : 'text-espresso hover:text-char'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-taupe-300/60 bg-ivory/90 backdrop-blur">
      <div className="page-x flex h-16 items-center justify-between gap-4">
        <Link
          to={`/${locale}/`}
          className="shrink-0 font-mono text-sm font-semibold tracking-tight text-char"
          aria-label={common.brand.homeLabel}
        >
          {common.brand.name}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label={nav.mainAria}>
          <NavLink to={`/${locale}/`} end className={navLinkClass}>
            {nav.homeLabel}
          </NavLink>
          {SECTION_ROUTES.map(({ id, path }) => (
            <NavLink key={id} to={`/${locale}/${path}`} className={navLinkClass}>
              {nav.sections[id].label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={common.shell.languageAria}
            className="rounded-full border border-taupe-300 px-4 py-1.5 font-mono text-[11px] uppercase tracking-eyebrow text-espresso transition-colors hover:border-copper-500 hover:text-copper-600"
          >
            {common.language.switchTo[locale === 'zh-cn' ? 'en-us' : 'zh-cn']}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? nav.menu.close : nav.menu.open}
            className="flex h-9 w-9 items-center justify-center border border-taupe-300 text-espresso lg:hidden"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              {open ? <path d="M2 2l12 12M14 2L2 14" /> : <path d="M1 3.5h14M1 8h14M1 12.5h14" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-taupe-300/60 bg-ivory lg:hidden"
          aria-label={nav.mainAria}
        >
          <div className="page-x flex flex-col pb-4">
            <NavLink to={`/${locale}/`} end className="border-b border-taupe-300/40 py-3 text-sm text-espresso">
              {nav.homeLabel}
            </NavLink>
            {SECTION_ROUTES.map(({ id, path }) => (
              <NavLink
                key={id}
                to={`/${locale}/${path}`}
                className="border-b border-taupe-300/40 py-3 text-sm text-espresso"
              >
                {nav.sections[id].label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
