import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useCommon, useLocale, useNav } from '@/i18n';
import type { SectionId } from '@/router';

// 板块占位页（任务 3.1）：PageShell 页头消费 nav 词条（eyebrow/标题/描述），
// 「建设中」卡片消费 common.section 词条并以 {task} 注入交付任务号——
// D6 诚实性：未完成板块如实标注「规划中」，不美化不隐藏。
// Section staging page (task 3.1): the PageShell header consumes the nav
// copy (eyebrow/title/description) while the "under construction" card
// consumes common.section with the delivering task injected as {task} —
// D6 honesty: pending sections are shown as planned, never polished or hidden.
export function SectionPage({ id }: { id: SectionId }) {
  const common = useCommon();
  const nav = useNav();
  const { locale } = useLocale();
  const section = nav.sections[id];

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <div className="hairline border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-6 md:px-8">
        <p className="eyebrow text-copper-600">{common.section.plannedEyebrow}</p>
        <h2 className="mt-3 font-serif text-lg text-char">{common.section.plannedTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-espresso">
          {interpolate(common.section.plannedBody, { task: section.deliverTask })}
        </p>
        <Link
          to={`/${locale}/`}
          className="mt-5 inline-block font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
        >
          ← {common.section.backHome}
        </Link>
      </div>
    </PageShell>
  );
}
