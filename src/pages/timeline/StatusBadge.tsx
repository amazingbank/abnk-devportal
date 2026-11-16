import { useTimeline } from '@/i18n';
import { statusBadgeKind, type BadgeKind } from './timeline-data';

// 状态徽标（任务 3.2）：视觉档位映射收在数据模块（statusBadgeKind），本组件
// 只负责呈现——标签文案始终取状态词表的原词（draft/planned-backlog 各有如实
// 标签），未知状态原词回显，不虚构不隐藏（D6）。
// Status badge (task 3.2): the visual-tier mapping lives in the data module
// (statusBadgeKind); this component only presents — the label always shows
// the vocabulary's own word (draft and planned-backlog each carry an honest
// label) and unknown statuses echo the raw word, never invented or hidden (D6).
const BADGE_STYLE: Record<BadgeKind, string> = {
  done: 'border-sage-500/50 bg-sage-500/10 text-sage-700',
  doing: 'border-amber-500/50 bg-amber-500/10 text-amber-600',
  pending: 'border-taupe-400/60 bg-taupe-100 text-taupe-700',
  moved: 'border-copper-500/60 bg-copper-500/10 text-copper-700',
  suspended: 'border-brick-500/40 bg-brick-500/10 text-brick-700',
};

export function StatusBadge({ status }: { status: string }) {
  const timeline = useTimeline();
  const label = timeline.statusLabels[status as keyof typeof timeline.statusLabels] ?? status;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${BADGE_STYLE[statusBadgeKind(status)]}`}
    >
      {label}
    </span>
  );
}
