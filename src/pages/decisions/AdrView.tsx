import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useDecisions, useLocale } from '@/i18n';
import { decisionsRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { stripMetaHeader } from '@/lib/markdown/meta';
import { adrDataPath, findAdr, loadAdrRaw } from './decisions-data';

// ADR 原文页（任务 3.3）：页头结构化呈现索引元数据（标题/日期/状态），正文按
// 懒加载 ?raw 取原文剥离元信息头后渲染——「五仓定位表」等 GFM 表格依赖
// remark-gfm。加载失败如实展示失败态，不静默降级（D6）。
// ADR original page (task 3.3): the header renders index metadata structurally
// (title/date/status) while the body lazily loads the ?raw original, strips
// its metadata header and renders — GFM tables such as the five-repo table
// rely on remark-gfm. Load failures show an honest failure state, never a
// silent fallback (D6).
export function AdrView() {
  const { locale } = useLocale();
  const { adrId } = useParams();
  const t = useDecisions();
  const adr = findAdr(adrId);

  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!adr) return;
    const loader = loadAdrRaw(adr.doc);
    if (!loader) {
      setFailed(true);
      return;
    }
    let alive = true;
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
  }, [adr]);

  if (!adr) {
    return <Navigate to={decisionsRoute(locale)} replace />;
  }

  const statusLabel = t.statusLabels[adr.status as keyof typeof t.statusLabels] ?? adr.status;

  return (
    <PageShell eyebrow={`DECISIONS · ADR ${adr.id}`} title={adr.title}>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          to={decisionsRoute(locale)}
          className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          ← {t.adrView.back}
        </Link>
      </div>
      <p className="mb-10 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
        {adr.date} · {t.adrView.status}: {statusLabel}
      </p>

      {raw === null && !failed ? <p className="text-sm text-taupe-500">{t.adrView.loading}</p> : null}
      {failed ? <p className="text-sm text-brick-600">{t.adrView.loadFail}</p> : null}
      {raw !== null ? (
        <MdContent content={stripMetaHeader(raw)} fromAbs={adrDataPath(adr.doc)} />
      ) : null}
    </PageShell>
  );
}
