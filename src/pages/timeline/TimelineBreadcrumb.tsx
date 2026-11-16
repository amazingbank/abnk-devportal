import { Link } from 'react-router-dom';

// 时间线面包屑（任务 3.2）：四层下钻的层级回溯通道——Sprint → Part →
// Phase/Task，当前层不可点（aria-current），上层可点回跳。
// Timeline breadcrumb (task 3.2): the level backtrack channel of the
// four-level drill-down — Sprint → Part → Phase/Task; the current level is
// non-clickable (aria-current) while upper levels link back.
export function TimelineBreadcrumb({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-1 font-mono text-[11px] text-taupe-500">
      {trail.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 ? <span className="px-1 text-taupe-400">/</span> : null}
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-copper-600">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-espresso">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
