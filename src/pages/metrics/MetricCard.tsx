// 指标卡（任务 3.4）：数值的原子呈现单元——大号衬线数字 + 等宽小写标签，
// 数字一律来自 metrics 契约，卡片不做任何加工（D6：无虚构指标）。
// data-metric / data-passed / data-total / data-value 是走查机械比对
// （V3.4.2）的探针锚点。
// Metric card (task 3.4): the atomic presentation unit of a figure — a large
// serif number with a mono label; the number always comes straight from the
// metrics contract, never adjusted by the card (D6: no invented figures).
// data-metric / data-passed / data-total / data-value are the probe anchors
// of the mechanical walkthrough comparison (V3.4.2).
export function MetricCard({
  label,
  value,
  dataKey,
  passed,
  total,
  rawValue,
}: {
  label: string;
  value: string;
  dataKey: string;
  passed?: number;
  total?: number;
  rawValue?: string;
}) {
  return (
    <div
      data-metric={dataKey}
      data-passed={passed}
      data-total={total}
      data-value={rawValue}
      className="hairline bg-ivory-50 px-6 py-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">{label}</p>
      <p className="mt-3 font-serif text-2xl text-char md:text-3xl">{value}</p>
    </div>
  );
}
