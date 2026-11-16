import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useLocale, useTimeline } from '@/i18n';
import { parseTaskRef, taskEvidenceFiles, timelineRoute } from '@/lib/link-resolver';
import { findPart, findTask, movedLinksFor, SPRINT_INDEX, taskRefLabel } from './timeline-data';
import { StatusBadge } from './StatusBadge';
import { TimelineBreadcrumb } from './TimelineBreadcrumb';

// Task 层（四层下钻第四层·叶子，任务 3.2）：任务详情 + 移交往返双向链
// （移交至 / 承接自——链两端互指，往返可点）+ 任务证据清单。备注原样呈现
// （含挂账说明），证据空态如实展示——灵魂页面的「证据链可被点击验证」终点。
// Task level (the fourth, leaf drill-down level, task 3.2): task details + the
// bidirectional move chain (moved-to / continued-from — both ends point at each
// other, the round trip is clickable) + the task evidence list. Notes render
// as-is (blocked-item annotations included) and empty evidence states show
// honestly — the "click-verifiable chain of proof" endpoint of the soul page.
export function TaskView() {
  const { locale } = useLocale();
  const { partId, taskId } = useParams();
  const timeline = useTimeline();
  const part = findPart(partId);
  const task = part ? findTask(part, taskId) : null;

  if (!part || !task) {
    return <Navigate to={timelineRoute(locale)} replace />;
  }

  const partNum = part.id.slice(4);
  const evidence = taskEvidenceFiles(part.id, task.id);
  const moved = movedLinksFor(part.id, task.id);
  const movedTo = moved.to ? parseTaskRef(moved.to) : null;
  const movedFrom = moved.from ? parseTaskRef(moved.from) : null;

  return (
    <PageShell
      eyebrow={`SPRINT ${SPRINT_INDEX.sprint} · PART ${partNum} · TASK ${task.id}`}
      title={task.title}
    >
      <TimelineBreadcrumb
        trail={[
          { label: timeline.breadcrumb.sprint, to: timelineRoute(locale) },
          { label: `Part ${partNum}`, to: timelineRoute(locale, part.id) },
          { label: `${timeline.breadcrumb.task} ${task.id}` },
        ]}
      />
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <StatusBadge status={task.status} />
        {task.note ? (
          <span className="font-mono text-[11px] text-taupe-500">
            {timeline.task.noteLabel} · {task.note}
          </span>
        ) : null}
      </div>

      {(movedTo || movedFrom) && (
        <div className="hairline border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-5 md:px-8">
          {movedTo && (
            <p data-moved-to={moved.to}>
              <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                {timeline.task.movedToLabel}{' '}
              </span>
              <Link
                to={timelineRoute(locale, movedTo.partId, { kind: 'task', id: movedTo.taskId })}
                className="text-sm text-copper-600 transition-colors hover:text-copper-700"
              >
                {taskRefLabel(moved.to ?? '')} →
              </Link>
            </p>
          )}
          {movedFrom && (
            <p className="mt-2" data-moved-from={moved.from}>
              <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                {timeline.task.movedFromLabel}{' '}
              </span>
              <Link
                to={timelineRoute(locale, movedFrom.partId, { kind: 'task', id: movedFrom.taskId })}
                className="text-sm text-copper-600 transition-colors hover:text-copper-700"
              >
                ← {taskRefLabel(moved.from ?? '')}
              </Link>
            </p>
          )}
        </div>
      )}

      <section aria-labelledby="tl-task-evidence" className="mt-12">
        <h2 id="tl-task-evidence" className="font-serif text-lg text-char">
          {timeline.task.evidenceTitle}
        </h2>
        {evidence.length > 0 ? (
          <ul className="mt-4 flex flex-col">
            {evidence.map((file) => (
              <li key={file.name} className="border-t border-taupe-300/60 py-3">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-evidence={file.name}
                  className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
                >
                  {file.name} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-taupe-300/60 py-4 text-sm text-taupe-500">
            {timeline.task.emptyEvidence}
          </p>
        )}
      </section>
    </PageShell>
  );
}
