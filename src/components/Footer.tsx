import { useLocale } from '@/i18n';
import { interpolate } from '@/i18n';

// Footer 骨架（任务 1.2 范围）：tagline + 版权年份（interpolate 机制首用）；
// 板块导航/仓库链接随 Phase 3 任务 3.1 落位。
// Footer skeleton within task 1.2 scope: tagline + copyright year (first use
// of the interpolate mechanism); section links land with Phase 3 task 3.1.
export function Footer() {
  const { common } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="hairline mt-16 bg-warmwhite">
      <div className="page-x flex flex-col gap-2 py-10 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <p className="max-w-xl text-xs leading-relaxed text-espresso">{common.footer.tagline}</p>
        <p className="font-mono text-[11px] text-taupe-500">
          {interpolate(common.footer.copyright, { year })}
        </p>
      </div>
    </footer>
  );
}
