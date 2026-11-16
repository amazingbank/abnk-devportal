import { useLocale } from '@/i18n';

// Nav 骨架（任务 1.2 范围）：品牌 + 语言切换；板块导航词条随 Phase 3 任务 3.1 落位
// （common.nav.primary 当前为空数组占位）。
// Nav skeleton within task 1.2 scope: brand + locale toggle; section links
// arrive with Phase 3 task 3.1 (common.nav.primary is an empty placeholder).
export function Nav() {
  const { common, locale, toggleLocale } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-taupe-300/60 bg-ivory/90 backdrop-blur">
      <div className="page-x flex h-16 items-center justify-between">
        <a href={`/${locale}/`} className="font-mono text-sm font-semibold tracking-tight text-char">
          {common.brand.name}
        </a>
        <button
          type="button"
          onClick={toggleLocale}
          className="rounded-full border border-taupe-300 px-4 py-1.5 font-mono text-[11px] uppercase tracking-eyebrow text-espresso transition-colors hover:border-copper-500 hover:text-copper-600"
        >
          {common.language.switchTo[locale === 'zh-cn' ? 'en-us' : 'zh-cn']}
        </button>
      </div>
      <span className="sr-only">{common.nav.mainAria}</span>
    </header>
  );
}
