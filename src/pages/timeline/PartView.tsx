import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useLocale, useTimeline } from '@/i18n';
import { partRootEvidenceFiles, timelineRoute } from '@/lib/link-resolver';
import {
  companionDocsOf,
  docDisplayName,
  findPart,
  phaseDocsOf,
  SPRINT_INDEX,
  tasksOfPhase,
} from './timeline-data';
import { StatusBadge } from './StatusBadge';
import { TimelineBreadcrumb } from './TimelineBreadcrumb';

// Part 层（四层下钻第二层，任务 3.2）：Phase 文档清单（含 plan）+ 伴生文档
// + 按 Phase 归属分组的任务清单 + Part 根级证据——「每层链到证据指针与文档
// 原文」在本层的落位。
// Part level (the second drill-down level, task 3.2): the phase-doc list
// (plan included) + companion docs + tasks grouped by phase + part-root
// evidence — this level's landing of "every level links to evidence pointers
// and document originals".
export function PartView() {
  const { locale } = useLocale();
  const { partId } = useParams();
  const timeline = useTimeline();
  const part = findPart(partId);

  if (!part) {
    return <Navigate to={timelineRoute(locale)} replace />;
  }

  const phases = phaseDocsOf(part);
  const companions = companionDocsOf(part);
  const rootEvidence = partRootEvidenceFiles(part.id);
  const partNum = part.id.slice(4);

  // 分组：Phase 文档顺序即任务分组顺序；未归属任务（前缀无对应 Phase）追加在尾部。
  // Grouping: phase-doc order is the task-group order; unattributed tasks
  // (prefix without a matching phase) are appended at the tail.
  const matched = new Set<string>();
  const groups = phases.map((doc) => {
    const tasks = tasksOfPhase(part, doc.phase ?? '');
    tasks.forEach((t) => matched.add(t.id));
    return { phase: doc.phase ?? '', tasks };
  });
  const leftovers = part.tasks.filter((t) => !matched.has(t.id));

  return (
    <PageShell
      eyebrow={`SPRINT ${SPRINT_INDEX.sprint} · PART ${partNum}`}
      title={`Part ${partNum}`}
      description={`${part.date} · ${interpolate(timeline.sprint.docsCount, { count: part.docs.length })} · ${interpolate(timeline.sprint.tasksCount, { count: part.tasks.length })}`}
    >
      <TimelineBreadcrumb
        trail={[
          { label: timeline.breadcrumb.sprint, to: timelineRoute(locale) },
          { label: `Part ${partNum}` },
        ]}
      />
      <div className="mb-10 flex items-center gap-4">
        <StatusBadge status={part.status} />
      </div>

      <section aria-labelledby="tl-phases">
        <h2 id="tl-phases" className="font-serif text-lg text-char">
          {timeline.part.phasesTitle}
        </h2>
        <ul className="mt-4 flex flex-col">
          {phases.map((doc) => (
            <li key={doc.doc}>
              <Link
                to={timelineRoute(locale, part.id, { kind: 'phase', id: doc.phase ?? '' })}
                data-phase={doc.phase}
                className="group flex flex-col gap-2 border-t border-taupe-300/60 py-4 transition-colors hover:bg-ivory-50 md:flex-row md:items-center md:gap-6"
              >
                <span className="w-24 shrink-0 font-mono text-sm text-copper-600">
                  {doc.phase}
                </span>
                <span className="min-w-0 flex-1 text-sm text-char group-hover:text-copper-700">
                  {docDisplayName(doc.doc)}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-taupe-500">{doc.date}</span>
                <StatusBadge status={doc.status} />
              </Link>
            </li>
          ))}
          {phases.length === 0 ? (
            <li className="border-t border-taupe-300/60 py-4 text-sm text-taupe-500">
              {timeline.part.empty}
            </li>
          ) : null}
        </ul>
      </section>

      {companions.length > 0 ? (
        <section aria-labelledby="tl-companions" className="mt-12">
          <h2 id="tl-companions" className="font-serif text-lg text-char">
            {timeline.part.companionDocsTitle}
          </h2>
          <ul className="mt-4 flex flex-col">
            {companions.map((doc) => (
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

      <section aria-labelledby="tl-tasks" className="mt-12">
        <h2 id="tl-tasks" className="font-serif text-lg text-char">
          {timeline.part.tasksTitle}
        </h2>
        {groups.map((group) => (
          <div key={group.phase} className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
              {timeline.breadcrumb.phase} {group.phase} · {group.tasks.length}
            </p>
            <ul className="mt-2 flex flex-col">
              {group.tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    to={timelineRoute(locale, part.id, { kind: 'task', id: task.id })}
                    data-task={task.id}
                    className="group flex flex-col gap-2 border-t border-taupe-300/60 py-3.5 transition-colors hover:bg-ivory-50 md:flex-row md:items-center md:gap-6"
                  >
                    <span className="w-16 shrink-0 font-mono text-sm text-copper-600">
                      {task.id}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-char group-hover:text-copper-700">
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {leftovers.length > 0 ? (
          <ul className="mt-2 flex flex-col">
            {leftovers.map((task) => (
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
        ) : null}
      </section>

      {rootEvidence.length > 0 ? (
        <section aria-labelledby="tl-part-evidence" className="mt-12">
          <h2 id="tl-part-evidence" className="font-serif text-lg text-char">
            {timeline.part.partEvidenceTitle}
          </h2>
          <ul className="mt-4 flex flex-col">
            {rootEvidence.map((file) => (
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
        </section>
      ) : null}
    </PageShell>
  );
}
