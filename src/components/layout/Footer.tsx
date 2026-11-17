import { interpolate, useCommon } from '@/i18n';
import dataAsOf from '@/data/data-as-of.json';

// 数据源仓与本仓的公网入口（D5 开源口径；链接目标不是 UI 词条，留在组件内）。
// Public entry points of the data source repo and this repo (D5 openness
// stance; link targets are not UI copy, so they stay in the component).
const REPO_URLS = {
  asdm: 'https://github.com/amazingbank/abnk-asdm',
  portal: 'https://github.com/amazingbank/abnk-devportal',
} as const;

// 全站页脚（任务 3.1）：渲染器定位 tagline + 双仓入口 + 版权年份。
// 任务 4.4 数据新鲜度标注：data-as-of.json 由 sync-data.sh 捕获源仓
// workspace/index 的最后 commit——发布是手动链（CI 未实跑），页脚如实
// 展示数据时点（已知坑 5 / D6 诚实性），不虚标实时性。
// Site-wide footer (task 3.1): the renderer tagline, both repository entry
// points, and the copyright year.
// Task 4.4 data-freshness annotation: data-as-of.json is captured by
// sync-data.sh from the source repo's last commit touching workspace/index —
// releases are a manual chain (CI not yet running), so the footer states the
// data point verbatim (known pitfall 5 / D6 honesty), never claiming realtime.
export function Footer() {
  const common = useCommon();
  const year = new Date().getFullYear();

  return (
    <footer className="hairline mt-16 bg-warmwhite">
      <div className="page-x flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="max-w-xl text-xs leading-relaxed text-espresso">{common.footer.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-taupe-500">
            <a
              href={REPO_URLS.asdm}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-copper-600"
            >
              {common.footer.repoAsdmLabel} ↗
            </a>
            <a
              href={REPO_URLS.portal}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-copper-600"
            >
              {common.footer.repoPortalLabel} ↗
            </a>
          </div>
          <p className="mt-3 font-mono text-[11px] text-taupe-400">
            {interpolate(common.footer.dataAsOf, { date: dataAsOf.asOf, commit: dataAsOf.commit })}
          </p>
        </div>
        <p className="shrink-0 font-mono text-[11px] text-taupe-500">
          {interpolate(common.footer.copyright, { year })}
        </p>
      </div>
    </footer>
  );
}
