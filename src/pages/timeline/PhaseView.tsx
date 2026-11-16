import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useLocale, useTimeline } from '@/i18n';
import {
  docUrl,
  parseTaskRef,
  phaseEvidenceFiles,
  timelineRoute,
} from '@/lib/link-resolver';
import {
  docDisplayName,
  findPart,
  phaseDocsOf,
  SPRINT_INDEX,
  tasksOfPhase,
} from './timeline-data';
import { StatusBadge } from './StatusBadge';
import { TimelineBreadcrumb } from './TimelineBreadcrumb';

// Phase 层（四层下钻第三层，任务 3.2）：Phase 文档卡（状态/日期/文档备注/
// 移交目标）+ 文档原文链接 + 证据文件清单 + 本 Phase 任务清单——备注
// （如插入性质声明）与移交目标原样呈现（D6：如实展示）。
// Phase level (the third drill-down level, task 3.2): the phase-doc card
// (status/date/doc-note/move target) + the document-original link + the
// evidence-file list + the phase's tasks — notes (such as insertion-nature
// declarations) and move targets render as-is (D6: shown honestly).
export function PhaseView() {
  const { locale } = useLocale();
  const { partId, phaseId } = useParams();
  const timeline = useTimeline();
  const part = findPart(partId);

  if (!part || !phaseId) {
    return <Navigate to={timelineRoute(locale)} replace />;
  }

  const phaseDocs = phaseDocsOf(part).filter((d) => d.phase === phaseId);
  const primary = phaseDocs[0];
  if (!primary) {
    return <Navigate to={timelineRoute(locale, part.id)} replace />;
  }

  const partNum = part.id.slice(4);
  const related = phaseDocs.slice(1);
  const evidence = phaseEvidenceFiles(part.id, phaseId);
  const tasks = tasksOfPhase(part, phaseId);
  const original = docUrl(part.id, primary.doc);
  const movedTarget = primary.moved_to ? parseTaskRef(primary.moved_to) : null;

  return (
    <PageShell
      eyebrow={`SPRINT ${SPRINT_INDEX.sprint} · PART ${partNum} · PHASE ${phaseId}`}
      title={docDisplayName(primary.doc)}
      description={`${primary.date}${primary['doc-note'] ? ` · ${primary['doc-note']}` : ''}`}
    >
      <TimelineBreadcrumb
        trail={[
          { label: timeline.breadcrumb.sprint, to: timelineRoute(locale) },
          { label: `Part ${partNum}`, to: timelineRoute(locale, part.id) },
          { label: `${timeline.breadcrumb.phase} ${phaseId}` },
        ]}
      />
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <StatusBadge status={primary.status} />
        {primary['doc-note'] ? (
          <span className="rounded-full border border-brick-500/40 bg-brick-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-brick-700">
            {primary['doc-note']}
          </span>
        ) : null}
      </div>

      <div className="hairline border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-5 md:px-8">
        {original ? (
          <a
            href={original}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[12px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
          >
            {timeline.phase.docOriginal} · {primary.doc} ↗
          </a>
        ) : (
          <span className="font-mono text-[12px] text-taupe-500">{primary.doc}</span>
        )}
        {movedTarget ? (
          <p className="mt-4" data-moved-to={primary.moved_to}>
            <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
              {timeline.phase.movedToLabel}{' '}
            </span>
            <Link
              to={timelineRoute(locale, movedTarget.partId, { kind: 'task', id: movedTarget.taskId })}
              className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
            >
              {primary.moved_to} →
            </Link>
          </p>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="tl-related" className="mt-12">
          <h2 id="tl-related" className="font-serif text-lg text-char">
            {timeline.phase.relatedDocs}
          </h2>
          <ul className="mt-4 flex flex-col">
            {related.map((doc) => (
              <li
                key={doc.doc}
                data-doc={doc.doc}
                className="flex flex-col gap-2 border-t border-taupe-300/60 py-4 md:flex-row md:items-center md:gap-6"
              >
                <span className="min-w-0 flex-1 text-sm text-char">{docDisplayName(doc.doc)}</span>
                <span className="shrink-0 font-mono text-[11px] text-taupe-500">{doc.date}</span>
                <StatusBadge status={doc.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="tl-evidence" className="mt-12">
        <h2 id="tl-evidence" className="font-serif text-lg text-char">
          {timeline.phase.evidenceTitle}
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
            {timeline.phase.emptyEvidence}
          </p>
        )}
      </section>

      <section aria-labelledby="tl-phase-tasks" className="mt-12">
        <h2 id="tl-phase-tasks" className="font-serif text-lg text-char">
          {timeline.phase.tasksTitle}
        </h2>
        {tasks.length > 0 ? (
          <ul className="mt-4 flex flex-col">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  to={timelineRoute(locale, part.id, { kind: 'task', id: task.id })}
                  data-task={task.id}
                  className="group flex flex-col gap-2 border-t border-taupe-300/60 py-3.5 transition-colors hover:bg-ivory-50 md:flex-row md:items-center md:gap-6"
                >
                  <span className="w-16 shrink-0 font-mono text-sm text-copper-600">{task.id}</span>
                  <span className="min-w-0 flex-1 text-sm text-char group-hover:text-copper-700">
                    {task.title}
                  </span>
                  <StatusBadge status={task.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-taupe-300/60 py-4 text-sm text-taupe-500">
            {timeline.part.empty}
          </p>
        )}
      </section>
    </PageShell>
  );
}
