import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useEvidence, useLocale, useNav } from '@/i18n';
import { evidenceDocRoute, partEvidenceCount, phaseEvidenceFiles, partRootEvidenceFiles } from '@/lib/link-resolver';
import { SPRINT_INDEX, docDisplayName } from '@/pages/timeline/timeline-data';
import { StatusBadge } from '@/pages/timeline/StatusBadge';

// EvidenceIndex 证据索引页（任务 3.6）：四 Part 分桶浏览——每桶卡 = Part 状态 +
// 文档计数 + 证据文件计数（构建期 glob keys 与源侧 find 全量同口径）+ Phase
// 分组折叠的证据文件清单（文本链接 + 截图缩略）。data-part-bucket 计数探针
// 与 V3.6.4 的 find 逐桶比对锚定。
// EvidenceIndex (task 3.6): four part buckets — each bucket card shows the
// part status, document count and evidence-file count (build-time glob keys,
// the same scope as the source-side find), plus the phase-grouped collapsible
// evidence lists (text links and screenshot thumbs). data-part-bucket is the
// count probe anchored to V3.6.4's per-bucket find comparison.
function BucketPhase({
  phase,
  label,
  files,
}: {
  phase: string;
  label: string;
  files: ReturnType<typeof phaseEvidenceFiles>;
}) {
  if (files.length === 0) return null;
  return (
    <li className="mt-3">
      <details data-phase-bucket={phase}>
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
          {label} · {files.length}
        </summary>
        <ul className="mt-2 grid grid-cols-1 gap-2 pl-4 md:grid-cols-2">
          {files.map((file) =>
            file.kind === 'image' ? (
              <li key={file.name} className="hairline bg-ivory-50 p-2">
                <details>
                  <summary className="cursor-pointer break-all font-mono text-[11px] text-copper-600">
                    {file.name}
                  </summary>
                  <img
                    src={file.url}
                    alt={file.name}
                    loading="lazy"
                    className="mt-2 w-full rounded-sm border border-taupe-300/60"
                  />
                </details>
              </li>
            ) : (
              <li key={file.name} className="break-all">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-copper-600 transition-colors hover:text-copper-700"
                >
                  {file.name} ↗
                </a>
              </li>
            ),
          )}
        </ul>
      </details>
    </li>
  );
}

export function EvidenceIndex() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = useEvidence();
  const section = nav.sections.evidence;

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <p className="max-w-3xl text-sm leading-relaxed text-espresso">{t.index.lead}</p>
      <ul className="mt-10 flex flex-col gap-10">
        {SPRINT_INDEX.parts.map((part) => {
          const partNum = part.id.slice(4);
          const count = partEvidenceCount(part.id);
          const phases = [
            ...new Set(part.docs.map((d) => d.phase).filter((p): p is string => p !== undefined)),
          ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
          const rootFiles = partRootEvidenceFiles(part.id);
          return (
            <li
              key={part.id}
              data-part-bucket={part.id}
              data-evidence-count={count}
              className="border-t border-taupe-300/60 pt-6"
            >
              <div className="flex flex-wrap items-center gap-4">
                <StatusBadge status={part.status} />
                <h3 className="font-serif text-lg text-char">Part {partNum}</h3>
                <span className="font-mono text-[11px] text-taupe-500">
                  {interpolate(t.index.docsCount, { count: part.docs.length })} ·{' '}
                  {interpolate(t.index.evidenceCount, { count })}
                </span>
                <Link
                  to={`/${locale}/timeline/${part.id}`}
                  className="ml-auto font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
                >
                  timeline →
                </Link>
              </div>
              <ul className="mt-4 flex flex-col">
                {part.docs.map((doc) => (
                  <li key={doc.doc} className="border-t border-taupe-300/40 py-2.5">
                    <Link
                      to={`/${locale}${evidenceDocRoute(part.id, doc.doc)}`}
                      data-bucket-doc={doc.doc}
                      className="group flex flex-col gap-1 md:flex-row md:items-baseline md:gap-4"
                    >
                      <span className="w-14 shrink-0 font-mono text-[12px] text-copper-600 group-hover:text-copper-700">
                        {doc.phase ?? '—'}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-char group-hover:text-copper-700">
                        {docDisplayName(doc.doc)}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-taupe-500">{doc.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-2">
                {phases.map((phase) => (
                  <BucketPhase
                    key={phase}
                    phase={phase}
                    label={phase === 'plan' ? 'Plan' : interpolate(t.index.phaseLabel, { key: phase })}
                    files={phaseEvidenceFiles(part.id, phase)}
                  />
                ))}
                <BucketPhase
                  phase="root"
                  label={t.index.rootEvidence}
                  files={rootFiles}
                />
              </ul>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
