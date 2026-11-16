import { Link } from 'react-router-dom';

import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useDecisions, useLocale, useNav } from '@/i18n';
import { adrRoute, timelineRoute } from '@/lib/link-resolver';
import { MdContent } from '@/lib/markdown/MdContent';
import { ADRS, partDecisions, planDataPath, type AdrData, type PartDecision } from './decisions-data';

// 决策时间线（任务 3.3）：ADR 卡（10）与 Part 拍板 D 卡（25）按日期合并成一条
// 线——「项目如何被逐个决策塑造」的叙事页。ADR 卡整卡跳转原文页；D 卡渲染
// 摘要正文（markdown 内链经 link-resolver 转换）并按契约数据挂「修订上下文」
// 跳转链（Part03 D4 → Phase 5 文档）。
// Decision timeline (task 3.3): ten ADR cards and twenty-five Part decision
// cards merged onto one chronological line — the narrative page of "how this
// project got shaped, call by call". An ADR card links whole to its original;
// a D card renders its summary body (in-document links converted through the
// link-resolver) and mounts a revision-context jump from the contract data
// (Part03 D4 → the Phase 5 document).
type TimelineCard =
  | { kind: 'adr'; date: string; adr: AdrData }
  | { kind: 'part-decision'; date: string; item: PartDecision };

export function DecisionTimeline() {
  const { locale } = useLocale();
  const nav = useNav();
  const t = useDecisions();
  const section = nav.sections.decisions;

  const cards: TimelineCard[] = [
    ...ADRS.map((adr) => ({ kind: 'adr' as const, date: adr.date, adr })),
    ...partDecisions().map((item) => ({
      kind: 'part-decision' as const,
      date: item.decision.date,
      item,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const dates = cards.map((c) => c.date);
  const adrCount = ADRS.length;
  const dCount = cards.length - adrCount;

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
        {interpolate(t.summary.adrCount, { count: adrCount })} ·{' '}
        {interpolate(t.summary.dCount, { count: dCount })} ·{' '}
        {interpolate(t.summary.spanFrom, { date: dates[0] ?? '' })}{' '}
        {interpolate(t.summary.spanTo, { date: dates[dates.length - 1] ?? '' })}
      </p>

      <ul className="mt-8 flex flex-col">
        {cards.map((card, i) => (
          <li key={`${card.kind}-${i}`} className="border-t border-taupe-300/60 py-6">
            {card.kind === 'adr' ? (
              <Link
                to={adrRoute(locale, card.adr.id)}
                data-adr={card.adr.id}
                className="group block"
              >
                <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
                  {card.date} · {t.card.adrKind} {card.adr.id}
                </p>
                <h3 className="mt-2 font-serif text-lg text-char transition-colors group-hover:text-copper-700">
                  {card.adr.title}
                </h3>
              </Link>
            ) : (
              <article data-decision={`${card.item.partId}:${card.item.decision.id}`}>
                <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
                  {card.item.decision.date} · {t.card.partKind} {card.item.partNum} ·{' '}
                  {card.item.decision.id}
                </p>
                <h3 className="mt-2 font-serif text-lg text-char">
                  {card.item.decision.id} · {card.item.decision.title}
                </h3>
                <MdContent
                  content={card.item.decision.content}
                  fromAbs={planDataPath(card.item.partId)}
                  className="mt-3"
                />
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                  <Link
                    to={timelineRoute(locale, card.item.partId)}
                    data-part-link={card.item.partId}
                    className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600 transition-colors hover:text-copper-700"
                  >
                    {t.card.partLink} · Part {card.item.partNum} →
                  </Link>
                  {card.item.decision.revised_in_phase ? (
                    <Link
                      to={timelineRoute(locale, card.item.partId, {
                        kind: 'phase',
                        id: card.item.decision.revised_in_phase,
                      })}
                      data-revision={card.item.decision.revised_in_phase}
                      className="font-mono text-[11px] uppercase tracking-eyebrow text-brick-600 transition-colors hover:text-brick-700"
                    >
                      {t.card.revisionContext} · Phase {card.item.decision.revised_in_phase} →
                    </Link>
                  ) : null}
                </div>
              </article>
            )}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
