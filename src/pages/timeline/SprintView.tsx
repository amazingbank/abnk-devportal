import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useLocale, useNav, useTimeline } from '@/i18n';
import { timelineRoute } from '@/lib/link-resolver';
import { SPRINT_INDEX } from './timeline-data';
import { StatusBadge } from './StatusBadge';

// Sprint 层（四层下钻第一层，任务 3.2）：Sprint 概览 + 汇总计数 + Part 卡片——
// 全部数字从结构化索引推导，零硬编码（V3.2.3 覆盖完备的页面对侧）。
// Sprint level (the first of the four drill-down levels, task 3.2): sprint
// overview + aggregate counters + part cards — every number derives from the
// structured index, nothing hardcoded (the page-side counterpart of the
// V3.2.3 coverage gate).
export function SprintView() {
  const { locale } = useLocale();
  const nav = useNav();
  const timeline = useTimeline();
  const section = nav.sections.timeline;

  const docCount = SPRINT_INDEX.parts.reduce((sum, p) => sum + p.docs.length, 0);
  const taskCount = SPRINT_INDEX.parts.reduce((sum, p) => sum + p.tasks.length, 0);
  const movedCount = SPRINT_INDEX.moved_links.length;

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
        {SPRINT_INDEX.sprint} · {interpolate(timeline.sprint.docsCount, { count: docCount })} ·{' '}
        {interpolate(timeline.sprint.tasksCount, { count: taskCount })} · {timeline.sprint.movedLabel}{' '}
        {movedCount}
      </p>

      <ul className="mt-8 flex flex-col">
        {SPRINT_INDEX.parts.map((part) => (
          <li key={part.id}>
            <Link
              to={timelineRoute(locale, part.id)}
              data-part={part.id}
              className="group flex flex-col gap-3 border-t border-taupe-300/60 py-5 transition-colors hover:bg-ivory-50 md:flex-row md:items-center md:gap-6"
            >
              <span className="w-28 shrink-0 font-mono text-sm text-copper-600">
                Part {part.id.slice(4)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                  {part.date} · {interpolate(timeline.sprint.docsCount, { count: part.docs.length })} ·{' '}
                  {interpolate(timeline.sprint.tasksCount, { count: part.tasks.length })}
                </span>
              </span>
              <StatusBadge status={part.status} />
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
