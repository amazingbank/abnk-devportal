import { PageShell } from '@/components/layout/PageShell';
import { interpolate, useJourney, useNav } from '@/i18n';
import {
  CARRIERS,
  COUNTER_CHAIN,
  JOURNEY_META,
  JOURNEY_STEPS,
  P3_LOGIN_RAW,
  primaryEvidenceUrl,
  PROBLEM_RECORDS,
  shotUrl,
  snapshotUrl,
} from './journey-steps';
import { ShotCard } from './ShotCard';

// E2E 旅程故事线页（任务 3.5）：把 phaseP3 的现成素材编排成「登录 → 首页 →
// 转账 → 成功 → 明细 + 余额核对」五步旅程 + 三载体复验——每步一个快照 yaml
// （a11y 语义树，?url 资产）+ 一张截图（public/evidence 静态直供）+ 关键节点
// 文字化；当时的问题记录（p3-login a11y 未开启等）原样展示（V3.5.2 诚实性
// 判据）。页面零原始解析：素材 URL 全部来自 journey-steps 单点。
// The E2E journey storyline page (task 3.5): arranges the phaseP3 assets into
// the login → home → transfer → success → transactions five-step journey plus
// the balance check, with a three-carrier re-verification — each step pairs a
// snapshot yaml (the a11y tree, ?url asset) with a screenshot (public/evidence
// static channel) and text-ified key nodes; the problem records of the time
// (the pre-a11y p3-login among them) render as-is (the V3.5.2 honesty
// criterion). Zero raw parsing: every asset URL comes from the single
// journey-steps module.
export function JourneyView() {
  const nav = useNav();
  const t = useJourney();
  const section = nav.sections.journey;
  const evidenceUrl = primaryEvidenceUrl();

  return (
    <PageShell eyebrow={section.eyebrow} title={section.title} description={section.description}>
      <p className="max-w-3xl text-sm leading-relaxed text-espresso">{t.summary.lead}</p>
      <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.summary.carrier}
          </dt>
          <dd className="mt-1 text-sm text-char">{JOURNEY_META.carrier}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.summary.chain}
          </dt>
          <dd className="mt-1 text-sm text-char">{JOURNEY_META.chain}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.summary.data}
          </dt>
          <dd className="mt-1 text-sm text-char">{JOURNEY_META.data}</dd>
        </div>
      </dl>
      {evidenceUrl ? (
        <p className="mt-4">
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.summary.evidence}{' '}
          </span>
          <a
            href={evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-primary-evidence="taskP3.1-mobile-e2e.md"
            className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
          >
            taskP3.1-mobile-e2e.md ↗
          </a>
        </p>
      ) : null}

      {/* 五步 + 核对步序列：每步 = 快照关键节点文字化 + 截图卡 + 快照链接。 */}
      {/* The five steps plus the check: each = text-ified key nodes, a screenshot card, a snapshot link. */}
      <ol className="mt-10 flex flex-col">
        {JOURNEY_STEPS.map((step) => {
          const snapUrl = snapshotUrl(step.snapshot);
          return (
            <li
              key={step.no}
              data-step={step.no}
              data-step-kind={step.kind}
              className="border-t border-taupe-300/60 py-8"
            >
              <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
                {step.kind === 'check'
                  ? t.step.check
                  : interpolate(t.step.of, { no: step.no })}
              </p>
              <h3 className="mt-2 font-serif text-lg text-char">{step.title}</h3>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                {t.step.nodes}
              </p>
              <ul className="mt-2 list-disc pl-5 marker:text-copper-500">
                {step.nodes.map((node) => (
                  <li key={node} className="mt-1.5 text-sm leading-relaxed text-espresso">
                    {node}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {step.shot ? (
                  <ShotCard
                    src={shotUrl(step.shot)}
                    alt={step.title}
                    caption={step.shot}
                    originalLabel={t.step.shotLink}
                    probe={step.shot}
                  />
                ) : null}
                <div className="hairline flex flex-col bg-ivory-200 px-6 py-5">
                  <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                    {t.step.snapshotLink.replace(' ↗', '')}
                  </p>
                  {snapUrl ? (
                    <a
                      href={snapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-snapshot={step.snapshot}
                      className="mt-3 font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
                    >
                      {step.snapshot} ↗
                    </a>
                  ) : (
                    <span data-snapshot={step.snapshot} className="mt-3 font-mono text-[12px] text-taupe-500">
                      {step.snapshot}
                    </span>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-espresso">
                    {step.snapshot === 'p3-login.yaml'
                      ? t.honesty.rawLabel
                      : step.kind === 'check'
                        ? t.step.check
                        : interpolate(t.step.of, { no: step.no })}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* 三载体复验：iOS / Android 结果行 + 截图网格 + Fineract 计数链。 */}
      {/* Three-carrier re-verification: iOS/Android result lines, screenshot grids, the Fineract counter chain. */}
      <section aria-labelledby="jr-carriers" className="mt-12">
        <h2 id="jr-carriers" className="font-serif text-lg text-char">
          {t.carriers.title}
        </h2>
        <ul className="mt-4 flex flex-col gap-8">
          {CARRIERS.map((run) => (
            <li key={run.id} data-carrier={run.id} className="border-t border-taupe-300/60 pt-6">
              <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper-600">
                {run.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-espresso">{run.result}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
                {t.carriers.shots}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {run.shots.map((shot) => (
                  <ShotCard
                    key={shot}
                    src={shotUrl(shot)}
                    alt={run.label}
                    caption={shot}
                    originalLabel={t.step.shotLink}
                    probe={shot}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="hairline mt-8 border-l-2 border-l-copper-500 bg-ivory-200 px-6 py-5 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.carriers.chainTitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-char" data-counter-chain>
            {COUNTER_CHAIN}
          </p>
        </div>
      </section>

      {/* 诚实性区（V3.5.2）：当时的问题记录原样展示——p3-login 原文 + 记录清单。 */}
      {/* Honesty zone (V3.5.2): the problem records of the time, as-is — the raw p3-login plus the record list. */}
      <section aria-labelledby="jr-honesty" className="mt-12">
        <p className="eyebrow text-brick-600" id="jr-honesty">
          {t.honesty.eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-lg text-char">{t.honesty.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-espresso">{t.honesty.body}</p>
        <div className="hairline mt-6 border-l-2 border-l-brick-500 bg-ivory-200 px-6 py-5 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
            {t.honesty.rawLabel}
          </p>
          <pre
            data-raw-login
            className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-espresso"
          >
            {P3_LOGIN_RAW}
          </pre>
        </div>
        <ul className="mt-6 flex flex-col">
          {PROBLEM_RECORDS.map((record) => (
            <li key={record.title} data-problem={record.title} className="border-t border-taupe-300/60 py-4">
              <p className="text-sm font-medium text-char">{record.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso">{record.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
