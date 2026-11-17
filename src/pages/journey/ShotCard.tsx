// 截图卡（任务 3.5）：旅程截图的呈现单元——图片走 public/evidence 静态直供
// （二进制资产不 import 进 JS，已知坑 1），懒加载（19+ 张旅程截图不阻塞首屏），
// 卡片带原图链接与走查探针锚点（data-shot）。加载失败的降级态如实展示文件名
// （诚实性：不悄悄吞掉缺失素材）。
// Screenshot card (task 3.5): the presentation unit of journey screenshots —
// images flow through the public/evidence static channel (binary assets are
// never imported into JS, pitfall 1) with lazy loading (the 19+ journey shots
// never block first paint); the card carries the original link plus the
// walkthrough probe anchor (data-shot). A failed load degrades honestly to
// the filename (honesty: missing assets are never silently swallowed).
export function ShotCard({
  src,
  alt,
  caption,
  originalLabel,
  probe,
}: {
  src: string;
  alt: string;
  caption: string;
  originalLabel: string;
  probe: string;
}) {
  return (
    <figure data-shot={probe} className="hairline bg-ivory-50 p-4">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full rounded-sm border border-taupe-300/60"
      />
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-[11px] text-taupe-500">{caption}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-copper-600 transition-colors hover:text-copper-700"
        >
          {originalLabel}
        </a>
      </figcaption>
    </figure>
  );
}
