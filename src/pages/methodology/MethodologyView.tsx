import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useLocale, useMethodology, useNav } from '@/i18n';
import { methodologyDocRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { stripMetaHeader } from '@/lib/markdown/meta';
import { PORTAL_CONTENT, type PortalContentEntryData } from '@/pages/evidence/evidence-data';

// 方法论板块页（任务 3.6）：消费 portal_content 契约 methodology 分区——索引页
// 渲染当前 locale 的 index.md + 篇章列表；单篇子路由 :docId 按 locale 路由、
// 按契约 fallback 标记回退（D3：en 是语义重写不是翻译，深链 zh 优先）。
// 原文懒加载 ?raw 按文件分 chunk（已知坑 1）。
// Methodology section pages (task 3.6): consume the portal_content contract's
// methodology partition — the index renders the current locale's index.md
// with the chapter list, while the per-doc child route :docId routes by
// locale and falls back per the contract's fallback marker (D3: English
// editions are rewrites, not translations; deep links prefer zh). Originals
// load lazily via ?raw, chunked per file (pitfall 1).
const rawModules = import.meta.glob('/src/data/portal-content/methodology/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

/** 某语言形态下的篇章清单（en 增量：en 有则用 en，无则带 fallback 标记用 zh）。 */
/** Chapter list under one locale shape (en increment: the en entry when present, else the zh one with a fallback marker). */
function chaptersOf(locale: string): { doc: string; entry: PortalContentEntryData; fallback: boolean }[] {
  const entries = PORTAL_CONTENT.filter((e) => e.section === 'methodology');
  return entries
    .filter((e) => e.locale === 'zh-CN' && e.doc !== 'index.md')
    .map((e) => {
      const en = entries.find((x) => x.locale === 'en-US' && x.doc === e.doc);
      const chosen = locale === 'en-us' && en ? en : e;
      return { doc: e.doc, entry: chosen, fallback: locale === 'en-us' && !en };
    });
}

/** 渲染目标文件的数据树绝对路径（locale 路由：本语言有则用之，否则 fallback locale）。 */
/** The render target's absolute data-tree path (locale routing: the own-locale file, else the fallback locale's). */
function targetPath(locale: string, doc: string): { path: string; fallback: boolean } | null {
  const entries = PORTAL_CONTENT.filter((e) => e.section === 'methodology');
  const own = entries.find((e) => e.doc === doc && e.locale === (locale === 'en-us' ? 'en-US' : 'zh-CN'));
  const zh = entries.find((e) => e.doc === doc && e.locale === 'zh-CN');
  if (!own && !zh) return null;
  const chosen = own ?? zh;
  const chosenLocale = chosen ? chosen.locale : 'zh-CN';
  const path = `/src/data/portal-content/methodology/${chosenLocale}/${doc}`;
  return { path, fallback: !own && !!zh && locale === 'en-us' };
}

function useDocRaw(path: string | null): { raw: string | null; failed: boolean } {
  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const loader = path ? (rawModules[path] ?? null) : null;
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
  return { raw, failed };
}

/** 篇章显示名（剥扩展名）。 */
/** Chapter display name (extension stripped). */
function docName(doc: string): string {
  return doc.replace(/\.md$/, '');
}

export function MethodologyIndex() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = useMethodology();
  const section = nav.sections.methodology;
  const target = targetPath(locale, 'index.md');
  const { raw, failed } = useDocRaw(target?.path ?? null);
  const chapters = chaptersOf(locale);

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      {raw !== null ? (
        <MdContent content={stripMetaHeader(raw)} fromAbs={target?.path ?? ''} />
      ) : failed ? (
        <p className="text-sm text-brick-600">{t.list.loadFail}</p>
      ) : (
        <p className="text-sm text-taupe-500">{t.list.loading}</p>
      )}
      <section aria-labelledby="mth-chapters" className="mt-10">
        <h2 id="mth-chapters" className="font-mono text-[12px] uppercase tracking-eyebrow text-copper-600">
          {t.list.docs}
        </h2>
        <ul className="mt-3 flex flex-col">
          {chapters.map(({ doc, entry, fallback }) => (
            <li key={doc} className="border-t border-taupe-300/60 py-3">
              <Link
                to={`/${locale}${methodologyDocRoute(doc)}`}
                data-chapter={doc}
                className="group flex flex-wrap items-baseline gap-3"
              >
                <span className="text-sm text-char group-hover:text-copper-700">{docName(doc)}</span>
                {fallback ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-taupe-500">
                    {t.list.fallbackNote}
                  </span>
                ) : null}
                <span className="font-mono text-[11px] text-taupe-500">{entry.date ?? ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

export function MethodologyDoc() {
  const { locale } = useLocale();
  const t = useMethodology();
  const { docId } = useParams();
  const target = targetPath(locale, docId ?? '');

  const { raw, failed } = useDocRaw(target?.path ?? null);

  if (!target) {
    return <Navigate to={`/${locale}/methodology/`} replace />;
  }

  return (
    <PageShell eyebrow="METHODOLOGY" title={docName(target.path.split('/').pop() ?? '')}>
      <p className="mb-8">
        <Link
          to={`/${locale}/methodology/`}
          data-back-index
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          {t.list.back}
        </Link>
        {target.fallback ? (
          <span className="ml-4 font-mono text-[10px] uppercase tracking-[0.08em] text-taupe-500">
            {t.list.fallbackNote}
          </span>
        ) : null}
      </p>
      {raw !== null ? (
        <MdContent content={stripMetaHeader(raw)} fromAbs={target.path} />
      ) : failed ? (
        <p className="text-sm text-brick-600">{t.list.loadFail}</p>
      ) : (
        <p className="text-sm text-taupe-500">{t.list.loading}</p>
      )}
    </PageShell>
  );
}
