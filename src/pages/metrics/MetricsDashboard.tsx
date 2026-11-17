import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useLocale, useMetrics, useNav } from '@/i18n';
import { decisionsRoute, parseTaskRef, timelineRoute } from '@/lib/link-resolver';
import { SPRINT_INDEX } from '@/pages/timeline/timeline-data';
import { BarList, type BarItem } from './BarList';
import { BlockedBadge, CiBadge } from './HonestyBadge';
import { MetricCard } from './MetricCard';
import {
  fmtNum,
  locCategoriesByLines,
  METRICS,
  sourceLink,
  sourceName,
  sprintSpan,
} from './metrics-data';

// 指标仪表盘（任务 3.4，D6 诚实性原则的页面落点）：消费 metrics 契约渲染
// 全部指标——质量四指标（VP/单测/断言/DRIFT，V3.4.2 与 Test-Report 头部
// 逐项一致）、Sprint 节奏、证据密度、LOC 规模；未完成项（CI 未实跑、挂账、
// 移交）按原样如实展示，数字全部可溯源 metrics.json，无虚构指标。
// Metrics dashboard (task 3.4, the page-level landing of the D6 honesty
// principle): renders every figure from the metrics contract — the four
// quality figures (VP/unit/E2E/drift, matching the Test-Report header line
// for line per V3.4.2), the sprint rhythm, evidence density and LOC size;
// the unfinished (a CI that never ran, deferred items, moved tasks) render
// as-is, every number traceable to metrics.json, nothing invented.
function SourceLink({ source, label, fallbackLabel }: { source: string; label: string; fallbackLabel: string }) {
  const resolved = sourceLink(source);
  if (resolved.kind === 'doc' || resolved.kind === 'source-repo') {
    return (
      <a
        href={resolved.url}
        target="_blank"
        rel="noopener noreferrer"
        data-source-link={sourceName(source)}
        className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
      >
        {resolved.kind === 'doc' ? `${label} · ${sourceName(source)} ↗` : fallbackLabel}
      </a>
    );
  }
  // 解析不到：展示源路径原文（不静默丢弃溯源线索）。
  // Unresolvable: the raw source path stays visible (traceability is never silently dropped).
  return <span className="font-mono text-[12px] text-taupe-500">{source}</span>;
}

export function MetricsDashboard() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = useMetrics();
  const section = nav.sections.metrics;

  const span = sprintSpan(METRICS);
  const evidenceTotal = Object.values(METRICS.evidence_density).reduce((a, b) => a + b, 0);
  const tr = METRICS.test_report;

  const rhythmBars: BarItem[] = METRICS.sprint_rhythm.map((r) => ({
    key: `rhythm-${r.part}`,
    label: `${r.part}（${interpolate(t.rhythm.days, { days: r.days })}${r.days === 0 ? ` · ${t.rhythm.sameDay}` : ''}）`,
    value: r.days,
    display: interpolate(t.rhythm.days, { days: r.days }),
    sub: interpolate(t.rhythm.range, { start: r.start, end: r.end }),
    to: timelineRoute(locale, r.part),
  }));

  const densityBars: BarItem[] = Object.entries(METRICS.evidence_density).map(([part, count]) => ({
    key: `density-${part}`,
    label: part,
    value: count,
    display: interpolate(t.density.files, { count }),
    to: timelineRoute(locale, part),
  }));

  const locBars: BarItem[] = locCategoriesByLines(METRICS).map((c, i) => ({
    key: `loc-${String(i).padStart(2, '0')}`,
    label: c.label,
    value: c.lines,
    display: fmtNum(c.lines),
    sub: interpolate(t.loc.filesUnit, { files: fmtNum(c.files) }),
  }));

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      {/* 总览：五枚概览指标，两枚带下钻链（决策/时间线）。 */}
      {/* Overview: five headline figures, two of them drill-down links. */}
      <dl data-overview className="grid grid-cols-1 gap-px bg-taupe-300/60 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-ivory px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">{t.quality.vp}</dt>
          <dd data-overview-item="vp" className="mt-2 font-serif text-xl text-char">
            {interpolate(t.quality.ratio, { passed: tr.vp.passed, total: tr.vp.total })}
          </dd>
        </div>
        <div className="bg-ivory px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.overview.adrCount.replace('{count}', String(METRICS.adr_count))}
          </dt>
          <dd className="mt-2">
            <Link
              to={decisionsRoute(locale)}
              data-overview-item="adr"
              className="font-serif text-xl text-copper-600 transition-colors hover:text-copper-700"
            >
              {METRICS.adr_count}
            </Link>
          </dd>
        </div>
        <div className="bg-ivory px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {interpolate(t.overview.movedCount, { count: METRICS.moved_count })}
          </dt>
          <dd className="mt-2">
            <Link
              to={timelineRoute(locale)}
              data-overview-item="moved"
              className="font-serif text-xl text-copper-600 transition-colors hover:text-copper-700"
            >
              {METRICS.moved_count}
            </Link>
          </dd>
        </div>
        <div className="bg-ivory px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {interpolate(t.overview.evidenceTotal, { count: evidenceTotal })}
          </dt>
          <dd data-overview-item="evidence" className="mt-2 font-serif text-xl text-char">
            {fmtNum(evidenceTotal)}
          </dd>
        </div>
        <div className="bg-ivory px-5 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {interpolate(t.overview.locTotal, { lines: fmtNum(METRICS.loc.total.lines) })}
          </dt>
          <dd data-overview-item="loc" className="mt-2 font-serif text-xl text-char">
            {fmtNum(METRICS.loc.total.lines)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
        {interpolate(t.overview.sprintSpan, span)}
      </p>

      {/* 质量四指标（V3.4.2：与 Part02 Phase P2 Test-Report 头部逐项一致）。 */}
      {/* Four quality figures (V3.4.2: line-for-line with the P2 Test-Report header). */}
      <section aria-labelledby="mx-quality" className="mt-12">
        <p className="eyebrow text-copper-600" id="mx-quality">
          {t.quality.eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-lg text-char">{t.quality.title}</h2>
        <div className="mt-4 grid grid-cols-1 gap-px bg-taupe-300/60 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t.quality.vp}
            value={interpolate(t.quality.ratio, { passed: tr.vp.passed, total: tr.vp.total })}
            dataKey="vp"
            passed={tr.vp.passed}
            total={tr.vp.total}
          />
          <MetricCard
            label={t.quality.unitTests}
            value={interpolate(t.quality.ratio, { passed: tr.unit_tests.passed, total: tr.unit_tests.total })}
            dataKey="unit_tests"
            passed={tr.unit_tests.passed}
            total={tr.unit_tests.total}
          />
          <MetricCard
            label={t.quality.e2e}
            value={interpolate(t.quality.ratio, { passed: tr.e2e_assertions.passed, total: tr.e2e_assertions.total })}
            dataKey="e2e_assertions"
            passed={tr.e2e_assertions.passed}
            total={tr.e2e_assertions.total}
          />
          <MetricCard
            label={t.quality.drift}
            value={t.quality.driftZero}
            dataKey="contract_drift"
            rawValue={String(tr.contract_drift)}
          />
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-espresso">{t.quality.note}</p>
        <div className="mt-2">
          <SourceLink
            source={tr.source}
            label={t.quality.sourceLabel}
            fallbackLabel={t.quality.sourceFallback}
          />
        </div>
      </section>

      {/* Sprint 节奏与证据密度：纯 CSS 比例条（零依赖图表选型）。 */}
      {/* Sprint rhythm and evidence density: pure-CSS bars (the zero-dep charting choice). */}
      <section aria-labelledby="mx-rhythm" className="mt-12">
        <h2 id="mx-rhythm" className="font-serif text-lg text-char">
          {t.rhythm.title}
        </h2>
        <BarList items={rhythmBars} ariaLabel={t.rhythm.title} />
      </section>

      <section aria-labelledby="mx-density" className="mt-12">
        <h2 id="mx-density" className="font-serif text-lg text-char">
          {t.density.title}
        </h2>
        <BarList items={densityBars} ariaLabel={t.density.title} />
      </section>

      <section aria-labelledby="mx-loc" className="mt-12">
        <h2 id="mx-loc" className="font-serif text-lg text-char">
          {t.loc.title}
        </h2>
        <p className="mt-2 text-sm text-espresso">
          {interpolate(t.loc.total, {
            lines: fmtNum(METRICS.loc.total.lines),
            files: fmtNum(METRICS.loc.total.files),
          })}
          <span className="ml-3 font-mono text-[11px] text-taupe-500">
            {interpolate(t.loc.snapshot, { snapshot: METRICS.loc.snapshot })}
          </span>
        </p>
        <div className="mt-3">
          <BarList items={locBars} ariaLabel={t.loc.title} />
        </div>
      </section>

      {/* 诚实性区（V3.4.3）：CI 未实跑徽标 + 挂账清单（挂账样式）+ 移交往返——全部原样呈现。 */}
      {/* Honesty zone (V3.4.3): the not-run CI badge, the deferred list (deferred styling) and the moved round-trips — all as-is. */}
      <section aria-labelledby="mx-honesty" className="mt-14">
        <p className="eyebrow text-brick-600" id="mx-honesty">
          {t.honesty.eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-lg text-char">{t.honesty.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-espresso">{t.honesty.body}</p>

        <div className="hairline mt-6 border-l-2 border-l-brick-500 bg-ivory-200 px-6 py-5 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">{t.honesty.ciTitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <CiBadge status={METRICS.ci.status} />
            <span className="text-sm text-espresso">{METRICS.ci.note}</span>
          </div>
        </div>

        <h3 className="mt-8 font-mono text-[12px] uppercase tracking-eyebrow text-brick-600">
          {t.honesty.blockedTitle}
        </h3>
        <ul className="mt-3 flex flex-col">
          {METRICS.blocked_items.map((item) => (
            <li
              key={item.id}
              data-blocked={item.id}
              className="border-t border-taupe-300/60 py-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <BlockedBadge label={t.honesty.blockedBadge} />
                <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                  {interpolate(t.honesty.blockedPart, { num: item.part.slice(4) })}
                </span>
              </div>
              <p className="mt-2 text-sm text-char">{item.title}</p>
              <p className="mt-2 text-sm text-espresso">
                <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                  {t.honesty.blockedReplay}{' '}
                </span>
                {item.replay}
              </p>
              <p className="mt-2">
                <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                  {t.honesty.blockedSource}{' '}
                </span>
                <SourceLink source={item.source} label={t.honesty.blockedSource} fallbackLabel={t.quality.sourceFallback} />
              </p>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 font-mono text-[12px] uppercase tracking-eyebrow text-copper-600">
          {t.honesty.movedTitle}
        </h3>
        <ul className="mt-3 flex flex-col">
          {SPRINT_INDEX.moved_links.map((link) => {
            const from = parseTaskRef(link.from_task);
            const to = parseTaskRef(link.to_task);
            return (
              <li key={link.from_task} data-moved={link.from_task} className="border-t border-taupe-300/60 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px]">
                  <span className="text-taupe-500">{t.honesty.movedFrom}</span>
                  {from ? (
                    <Link
                      to={timelineRoute(locale, from.partId, { kind: 'task', id: from.taskId })}
                      className="text-copper-600 transition-colors hover:text-copper-700"
                    >
                      {link.from_task}
                    </Link>
                  ) : (
                    <span>{link.from_task}</span>
                  )}
                  <span className="text-taupe-500">→ {t.honesty.movedTo}</span>
                  {to ? (
                    <Link
                      to={timelineRoute(locale, to.partId, { kind: 'task', id: to.taskId })}
                      className="text-copper-600 transition-colors hover:text-copper-700"
                    >
                      {link.to_task}
                    </Link>
                  ) : (
                    <span>{link.to_task}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}
