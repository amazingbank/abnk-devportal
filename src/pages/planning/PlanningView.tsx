import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useLocale, useNav, usePlanning } from '@/i18n';
import { decisionsRoute, planningDocRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { stripMetaHeader } from '@/lib/markdown/meta';

// 规划板块页（任务 3.6）：设计文档分区浏览——索引页渲染 abnk-design README
// 导览 + 七分区清单（00-baseline…06-evolution，ADR 全集链去「决策」板块）；
// 单篇子路由 :sectionId/:docId 懒加载 ?raw 原文（front-matter 剥离 + 管线渲染）。
// 分区清单 = import.meta.glob keys（构建期静态，零运行时目录扫描）。
// Planning section pages (task 3.6): design docs browsable by section — the
// index renders the abnk-design README guide plus the seven-section list
// (00-baseline…06-evolution, the full ADR set linking into the Decisions
// section), while the per-doc child route :sectionId/:docId lazily loads the
// ?raw original (front-matter stripped, pipeline-rendered). The section
// inventory is the import.meta.glob keys (build-time static, zero runtime
// directory scanning).
const planningRawModules = import.meta.glob('/src/data/planning/abnk-design/**/zh-CN/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

/** 设计文档分区（adr 与根 README 之外的全部 zh-CN 设计文档，构建期静态清单）。 */
/** Design-doc sections (every zh-CN design doc except adr/ and the root README — a build-time static inventory). */
const SECTION_RE = /^\/src\/data\/planning\/abnk-design\/(0\d-[a-z-]+)\/zh-CN\/([^/]+\.md)$/;

export interface PlanningGroup {
  sectionId: string;
  docs: string[];
}

const PLANNING_GROUPS: PlanningGroup[] = Object.keys(planningRawModules)
  .flatMap((key) => {
    const m = SECTION_RE.exec(key);
    return m ? [{ sectionId: m[1], doc: m[2] }] : [];
  })
  .sort((a, b) => a.sectionId.localeCompare(b.sectionId) || a.doc.localeCompare(b.doc))
  .reduce<PlanningGroup[]>((acc, { sectionId, doc }) => {
    const last = acc[acc.length - 1];
    if (last && last.sectionId === sectionId) last.docs.push(doc);
    else acc.push({ sectionId, docs: [doc] });
    return acc;
  }, []);

/** 根 README 的数据树绝对路径（板块导览）。 */
/** The root README's absolute data-tree path (the section guide). */
const README_PATH = '/src/data/planning/abnk-design/zh-CN/README.md';

function usePlanningRaw(path: string | null): { raw: string | null; failed: boolean } {
  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const loader = path ? (planningRawModules[path] ?? null) : null;
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

export function PlanningIndex() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = usePlanning();
  const section = nav.sections.planning;
  const { raw, failed } = usePlanningRaw(README_PATH);
  const groupLabels = t.list.groups;

  const groups = useMemo(() => PLANNING_GROUPS, []);

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <p className="max-w-3xl text-sm leading-relaxed text-espresso">{t.list.lead}</p>
      <div className="mt-8">
        {raw !== null ? (
          <details open data-planning-readme>
            <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-eyebrow text-copper-600">
              {t.list.readme}
            </summary>
            <div className="mt-3">
              <MdContent content={stripMetaHeader(raw)} fromAbs={README_PATH} />
            </div>
          </details>
        ) : failed ? (
          <p className="text-sm text-brick-600">{t.list.loadFail}</p>
        ) : (
          <p className="text-sm text-taupe-500">{t.list.loading}</p>
        )}
      </div>
      <ul className="mt-10 flex flex-col">
        {groups.map((group) => (
          <li
            key={group.sectionId}
            data-planning-group={group.sectionId}
            className="border-t border-taupe-300/60 py-5"
          >
            <h3 className="font-serif text-base text-char">
              {group.sectionId} · {groupLabels[group.sectionId as keyof typeof groupLabels] ?? group.sectionId}
            </h3>
            <ul className="mt-2 flex flex-col">
              {group.docs.map((doc) => (
                <li key={doc} className="py-1.5">
                  <Link
                    to={`/${locale}${planningDocRoute(group.sectionId, doc)}`}
                    data-planning-doc={doc}
                    className="text-sm text-espresso transition-colors hover:text-copper-700"
                  >
                    {doc}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link
          to={decisionsRoute(locale)}
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          {t.list.adrLink}
        </Link>
      </p>
    </PageShell>
  );
}

export function PlanningDoc() {
  const { locale } = useLocale();
  const t = usePlanning();
  const { sectionId, docId } = useParams();
  const path =
    sectionId && docId ? `/src/data/planning/abnk-design/${sectionId}/zh-CN/${docId}` : null;
  const { raw, failed } = usePlanningRaw(path);

  if (!path || !(path in planningRawModules)) {
    return <Navigate to={`/${locale}/planning/`} replace />;
  }

  return (
    <PageShell eyebrow={`PLANNING · ${sectionId}`} title={docId?.replace(/\.md$/, '') ?? ''}>
      <p className="mb-8">
        <Link
          to={`/${locale}/planning/`}
          data-back-index
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          {t.list.back}
        </Link>
      </p>
      {raw !== null ? (
        <MdContent content={stripMetaHeader(raw)} fromAbs={path} />
      ) : failed ? (
        <p className="text-sm text-brick-600">{t.list.loadFail}</p>
      ) : (
        <p className="text-sm text-taupe-500">{t.list.loading}</p>
      )}
    </PageShell>
  );
}
