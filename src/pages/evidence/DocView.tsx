import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useEvidence, useLocale } from '@/i18n';
import { docUrl, evidenceDocRoute, parseTaskRef, timelineRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { stripMetaHeader } from '@/lib/markdown/meta';
import { StatusBadge } from '@/pages/timeline/StatusBadge';
import { docDisplayName } from '@/pages/timeline/timeline-data';
import { evidenceOfDoc, findDoc, findPart, loadSprintMdRaw, sprintMdPath } from './evidence-data';
import { MaterialCard } from './MaterialCard';

// DocView 通用文档页（任务 3.6）：sprints 树文档的站内阅读层——页头结构化呈现
// 索引元数据（状态徽标/日期/Phase/备注/移交），正文懒加载 ?raw 原文剥离
// front-matter 后经渲染管线（内链四类路由转换 + 三态视觉层次），页底证据素材
// 以内联素材卡展开（截图/JSON/文本三分支）。加载失败如实展示（D6）。
// DocView, the generic document page (task 3.6): the in-portal reading layer
// of sprints documents — the header renders index metadata structurally
// (status badge, date, phase, note, move target), the body lazily loads the
// ?raw original, strips the front-matter and runs it through the render
// pipeline (all four link classes resolve, three-state visual hierarchy),
// and the page bottom expands evidence assets as inline material cards
// (screenshot / JSON / text branches). Load failures render honestly (D6).
export function DocView() {
  const { locale } = useLocale();
  const { partId, docId } = useParams();
  const t = useEvidence();
  const part = findPart(partId);
  const doc = findDoc(part, docId);

  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const loader = doc && part ? loadSprintMdRaw(part.id, doc.doc) : null;

  useEffect(() => {
    if (!loader) {
      setRaw(null);
      setFailed(false);
      return;
    }
    let alive = true;
    setRaw(null);
    setFailed(false);
    loader()
      .then((text: string) => {
        if (alive) setRaw(text);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [loader]);

  if (!part || !doc) {
    return <Navigate to={`/${locale}/evidence/`} replace />;
  }

  const partNum = part.id.slice(4);
  const evidence = evidenceOfDoc(part.id, doc, part);
  const original = docUrl(part.id, doc.doc);
  const movedTarget = doc.moved_to ? parseTaskRef(doc.moved_to) : null;

  return (
    <PageShell
      eyebrow={`EVIDENCE · PART ${partNum}${doc.phase && doc.phase !== 'plan' ? ` · PHASE ${doc.phase}` : ''}`}
      title={docDisplayName(doc.doc)}
    >
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          to={`/${locale}/evidence/`}
          data-back-index
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          ← {t.doc.back}
        </Link>
        <StatusBadge status={doc.status} />
        <span className="font-mono text-[11px] text-taupe-500">
          {t.doc.metaDate} {doc.date}
        </span>
        {original ? (
          <a
            href={original}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-copper-600 transition-colors hover:text-copper-700"
          >
            {t.doc.originalLink}
          </a>
        ) : null}
      </div>

      {/* front-matter 元信息页头（复用契约类型——元信息与正文状态一致由 front-matter 注入保证）。 */}
      {/* Front-matter meta header (contract types reused — meta/body status consistency is guaranteed by front-matter injection). */}
      <dl data-doc-meta className="hairline grid grid-cols-2 gap-x-8 gap-y-3 border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-4 md:grid-cols-4 md:px-8">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">{t.doc.metaPhase}</dt>
          <dd className="mt-1 font-mono text-[12px] text-char">{doc.phase ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">{t.doc.metaDate}</dt>
          <dd className="mt-1 font-mono text-[12px] text-char">{doc.date}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">doc</dt>
          <dd className="mt-1 break-all font-mono text-[12px] text-char">{doc.doc}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">locale</dt>
          <dd className="mt-1 font-mono text-[12px] text-char">{doc.locale}</dd>
        </div>
        {doc['doc-note'] ? (
          <div className="col-span-2 md:col-span-4">
            <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">{t.doc.metaNote}</dt>
            <dd className="mt-1 text-sm text-espresso">{doc['doc-note']}</dd>
          </div>
        ) : null}
        {movedTarget ? (
          <div className="col-span-2 md:col-span-4" data-moved-to={doc.moved_to}>
            <dt className="font-mono text-[10px] uppercase tracking-eyebrow text-taupe-500">{t.doc.movedTo}</dt>
            <dd className="mt-1">
              <Link
                to={timelineRoute(locale, movedTarget.partId, { kind: 'task', id: movedTarget.taskId })}
                className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
              >
                {doc.moved_to} →
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3">
        <Link
          to={timelineRoute(locale, part.id)}
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          {t.doc.timelineLink}
        </Link>
      </p>

      <article data-doc-body className="mt-10">
        {raw === null && !failed ? <p className="text-sm text-taupe-500">{t.doc.loading}</p> : null}
        {failed ? <p className="text-sm text-brick-600">{t.doc.loadFail}</p> : null}
        {raw !== null ? (
          <MdContent content={stripMetaHeader(raw)} fromAbs={sprintMdPath(part.id, doc.doc)} />
        ) : null}
      </article>

      {/* 证据素材内联区（V3.6.4：点击展开内联卡）。 */}
      {/* Inline evidence zone (V3.6.4: click to expand inline cards). */}
      <section aria-labelledby="ev-materials" className="mt-12">
        <h2 id="ev-materials" className="font-serif text-lg text-char">
          {t.doc.evidenceTitle}
        </h2>
        {evidence.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 gap-3">
            {evidence.map((file) => (
              <li key={file.name}>
                <MaterialCard file={file} copy={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-taupe-300/60 py-4 text-sm text-taupe-500">
            {t.doc.evidenceEmpty}
          </p>
        )}
      </section>

      {/* 同 Part 其他文档快捷链（分桶浏览的横向补充）。 */}
      {/* Quick links to sibling docs of the same part (a lateral supplement to bucket browsing). */}
      <section aria-labelledby="ev-siblings" className="mt-12">
        <h2 id="ev-siblings" className="font-serif text-lg text-char">
          {t.index.docTitle}
        </h2>
        <ul className="mt-4 flex flex-col">
          {part.docs
            .filter((d) => d.doc !== doc.doc)
            .map((d) => (
              <li key={d.doc} className="border-t border-taupe-300/60 py-3">
                <Link
                  to={`/${locale}${evidenceDocRoute(part.id, d.doc)}`}
                  data-sibling-doc={d.doc}
                  className="group flex flex-col gap-1 md:flex-row md:items-baseline md:gap-4"
                >
                  <span className="font-mono text-[12px] text-copper-600 group-hover:text-copper-700">
                    {d.phase ?? '—'}
                  </span>
                  <span className="text-sm text-char group-hover:text-copper-700">{docDisplayName(d.doc)}</span>
                  <span className="font-mono text-[11px] text-taupe-500">{d.date}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </PageShell>
  );
}
