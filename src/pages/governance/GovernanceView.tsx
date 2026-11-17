import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { useGovernance, useLocale, useNav } from '@/i18n';
import { adrRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { stripMetaHeader } from '@/lib/markdown/meta';
import { PORTAL_CONTENT } from '@/pages/evidence/evidence-data';

// 治理与开放板块页（任务 3.6）：消费 portal_content 契约 governance 分区——
// 双语导读按当前 locale 渲染（zh/en 双条目齐备，无 fallback 需求），压轴挂
// ADR-010 原文卡（五仓定位与两条保密边界——链去决策板块原文页）。
// Governance-and-openness section page (task 3.6): consumes the
// portal_content contract's governance partition — the bilingual guide
// renders under the current locale (both locales registered, no fallback
// needed), closing with the ADR-010 original card (the five-repo positions
// and the two confidentiality lines, linking into the decisions section).
const rawModules = import.meta.glob('/src/data/portal-content/governance/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

export function GovernanceView() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = useGovernance();
  const section = nav.sections.governance;

  const entry = PORTAL_CONTENT.find(
    (e) => e.section === 'governance' && e.locale === (locale === 'en-us' ? 'en-US' : 'zh-CN'),
  );
  const path = entry ? `/src/data/portal-content/governance/${entry.locale}/index.md` : null;
  const loader = path ? (rawModules[path] ?? null) : null;

  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      {raw !== null && path ? (
        <MdContent content={stripMetaHeader(raw)} fromAbs={path} />
      ) : failed ? (
        <p className="text-sm text-brick-600">{t.list.loadFail}</p>
      ) : (
        <p className="text-sm text-taupe-500">{t.list.loading}</p>
      )}

      <section aria-labelledby="gov-adr" className="mt-12">
        <p className="eyebrow text-copper-600" id="gov-adr">
          {t.list.adrCard}
        </p>
        <div
          data-governance-adr="010"
          className="hairline mt-3 border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-5 md:px-8"
        >
          <h3 className="font-serif text-lg text-char">{t.list.adrCardTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-espresso">{t.list.adrCardBody}</p>
          <Link
            to={adrRoute(locale, '010')}
            className="mt-4 inline-block font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
          >
            {t.list.adrCardLink}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
