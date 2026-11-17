import { useMetrics } from '@/i18n';

// 诚实性徽标（任务 3.4，D6 判据的组件化落点——已知坑 4）：CI 状态徽标 +
// 挂账徽标。v0.0.1 的 CI 是 not_run：徽标如实渲染「未实跑 · 规划中」
// （planned），绝不渲染成绿色 passing 的观感；其他状态按原词呈现，
// 词表外回显原词——渲染呈现状态，不判定不美化。
// Honesty badges (task 3.4, the component-level landing of the D6 criterion —
// pitfall 4): the CI-state badge and the deferred-item badge. v0.0.1's CI is
// not_run: the badge honestly renders "not run · planned" and never takes a
// green passing look; other states render their own word, and
// out-of-vocabulary words echo as-is — rendering presents, never judges or
// polishes.
const CI_STYLE: Record<string, string> = {
  not_run: 'border-brick-500/40 bg-brick-500/10 text-brick-700',
  passing: 'border-sage-500/50 bg-sage-500/10 text-sage-700',
  failing: 'border-brick-600/60 bg-brick-600/15 text-brick-800',
};

export function CiBadge({ status }: { status: string }) {
  const t = useMetrics();
  // not_run 的诚实文案在词条侧（zh「未实跑 · 规划中」/ en「Not run · planned」）；
  // 其余状态与词表外状态一律原词回显，不虚构文案。
  // not_run's honest copy lives in the locale packs (zh / en); every other
  // state, in-vocabulary or not, echoes its own word — no invented copy.
  const label = status === 'not_run' ? t.honesty.ciNotRun : status;
  return (
    <span
      data-ci-state={status}
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${CI_STYLE[status] ?? CI_STYLE.failing}`}
    >
      {label}
    </span>
  );
}

/** 挂账徽标：brick 警示档——挂账项按挂账样式可见，不隐藏（V3.4.3 走查判据）。 */
/** Deferred badge: the brick warning tier — deferred items stay visibly styled, never hidden (the V3.4.3 walkthrough criterion). */
export function BlockedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-brick-600/50 bg-brick-600/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-brick-800">
      {label}
    </span>
  );
}
