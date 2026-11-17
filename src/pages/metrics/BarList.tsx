import { Link } from 'react-router-dom';

// 纯 CSS 比例条（任务 3.4 的图表选型落点）：零依赖——数据形态是简单计数，
// 坐标轴/交互/动画都是多余重量（延续 D4 build-time 静态的零依赖精神，
// 轻量优先到「无图表库」这一档；选型记录见任务报告）。条宽严格按
// value/max 线性比例，零值就是零宽（视觉同样诚实）；标签与数值文本
// 由调用方传入，本组件不格式化不加工。
// Pure-CSS proportional bars (the charting choice of task 3.4): zero
// dependency — the data shapes are plain counts, and axes/interactions/
// animations would be dead weight (extending D4's build-time-static spirit,
// "lightweight first" all the way down to "no chart library"; the choice is
// recorded in the task report). Bar widths follow value/max strictly and
// linearly, a zero renders zero-width (visually honest too); labels and value
// texts come from the caller — this component formats nothing.
export interface BarItem {
  /** 走查探针与 React key（如 'rhythm-part01'）。 */
  /** Walkthrough probe and React key (e.g. 'rhythm-part01'). */
  key: string;
  label: string;
  value: number;
  display: string;
  /** 次级说明（如日期区间）。 */
  /** Secondary line (e.g. a date range). */
  sub?: string;
  /** 站内路由（时间线下钻）。 */
  /** In-site route (timeline drill-down). */
  to?: string;
}

export function BarList({ items, ariaLabel }: { items: BarItem[]; ariaLabel: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul aria-label={ariaLabel} className="flex flex-col">
      {items.map((item) => {
        const pct = (item.value / max) * 100;
        const row = (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-char">{item.label}</span>
            <span className="shrink-0 font-mono text-[12px] text-espresso">{item.display}</span>
          </div>
        );
        return (
          <li key={item.key} data-bar={item.key} className="border-t border-taupe-300/60 py-3.5">
            {item.to ? (
              <Link to={item.to} className="group block">
                <div className="group-hover:text-copper-700">{row}</div>
              </Link>
            ) : (
              row
            )}
            <div
              className="mt-2 h-2 bg-ivory-200"
              role="presentation"
              aria-hidden="true"
            >
              <div className="h-2 bg-copper-500/80" style={{ width: `${pct}%` }} />
            </div>
            {item.sub ? (
              <p className="mt-1.5 font-mono text-[11px] text-taupe-500">{item.sub}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
