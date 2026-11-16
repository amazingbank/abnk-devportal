import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useLocale } from '@/i18n';
import { resolveRelativeLink } from '@/lib/link-resolver';

// markdown 渲染管线基座（任务 3.3 选型落定：react-markdown + remark-gfm——
// remark/rehype 同族；GFM 表格是 ADR-010 五仓定位表的硬需求）。任务 3.6 在此
// 基座上扩展 front-matter 元信息页头与计划步骤/勾选态/执行输出的三态视觉
// 钩子——本组件只管「原文怎么渲染」，状态呈现归 3.6 的渲染管线。
// 内链经 link-resolver 单点转换：ADR → 站内路由；树内文件 → 构建期资产；
// 树外 → 源仓公网镜像并显式标注（↗ + data-out-of-scope）。
//
// Markdown render-pipeline base (task 3.3 selection: react-markdown +
// remark-gfm — same remark/rehype family; GFM tables are a hard requirement
// of the ADR-010 five-repo table). Task 3.6 extends this base with the
// front-matter header and the visual hooks for plan steps / checkboxes /
// execution outputs — this component only renders the original text, while
// status presentation belongs to the 3.6 pipeline.
// In-document links convert through the single link-resolver: ADRs become
// in-site routes, in-tree files become build-time assets, out-of-tree
// targets become public source-repo mirrors with an explicit marker (↗ +
// data-out-of-scope).

/** 行内代码与代码块的统一样式（tailwind，无外部排版插件）。 */
/** Unified inline/block code styling (Tailwind only, no typography plugin). */
const mdComponents = (locale: string, fromAbs: string): Components => ({
  h1: (p) => <h1 className="mt-10 font-serif text-2xl text-char md:text-3xl" {...p} />,
  h2: (p) => <h2 className="mt-10 font-serif text-xl text-char md:text-2xl" {...p} />,
  h3: (p) => <h3 className="mt-8 font-serif text-lg text-char" {...p} />,
  h4: (p) => <h4 className="mt-6 font-mono text-[13px] uppercase tracking-eyebrow text-copper-600" {...p} />,
  p: (p) => <p className="mt-4 text-sm leading-relaxed text-espresso" {...p} />,
  ul: (p) => <ul className="mt-4 list-disc pl-6" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal pl-6" {...p} />,
  li: (p) => <li className="mt-1.5 text-sm leading-relaxed text-espresso" {...p} />,
  blockquote: (p) => (
    <blockquote className="mt-4 border-l-2 border-l-copper-400 bg-ivory-100 px-4 py-2 text-sm text-espresso" {...p} />
  ),
  code: (p) => (
    <code className="rounded bg-taupe-100 px-1.5 py-0.5 font-mono text-[12px] text-char" {...p} />
  ),
  pre: (p) => (
    <pre
      className="mt-4 overflow-x-auto border border-taupe-300 bg-ivory-50 p-4 font-mono text-[12px] leading-relaxed text-char"
      {...p}
    />
  ),
  table: (p) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  thead: (p) => <thead className="bg-ivory-200" {...p} />,
  th: (p) => (
    <th
      className="border border-taupe-300 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-eyebrow text-char"
      {...p}
    />
  ),
  td: (p) => <td className="border border-taupe-300 px-3 py-2 align-top text-espresso" {...p} />,
  hr: () => <hr className="mt-10 border-t border-taupe-300/60" />,
  a: ({ href, children }) => {
    const linkClass =
      'text-copper-600 underline decoration-copper-300 underline-offset-2 transition-colors hover:text-copper-700';
    if (!href) return <a>{children}</a>;
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {children}
        </a>
      );
    }
    const resolved = resolveRelativeLink(fromAbs, href);
    if (resolved.kind === 'route') {
      return (
        <RouterLink to={`/${locale}${resolved.to}`} className={linkClass}>
          {children}
        </RouterLink>
      );
    }
    if (resolved.kind === 'doc') {
      return (
        <a href={resolved.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {children} ↗
        </a>
      );
    }
    if (resolved.kind === 'source-repo') {
      // 出界降级形态：源仓公网镜像 + 显式标注（已知坑 2 的降级要求）。
      // Out-of-scope degraded shape: public source-repo mirror with an
      // explicit marker (the pitfall-2 degradation requirement).
      return (
        <a
          href={resolved.url}
          target="_blank"
          rel="noopener noreferrer"
          data-out-of-scope="true"
          title="source repo · GitHub"
          className={linkClass}
        >
          {children} ↗
        </a>
      );
    }
    return <a href={href}>{children}</a>;
  },
});

/** markdown 渲染容器：fromAbs 为渲染对象的源文件数据树绝对路径（相对链接锚）。 */
/** Markdown render container; fromAbs is the source file's absolute data-tree path (the relative-link anchor). */
export function MdContent({
  content,
  fromAbs,
  className = '',
}: {
  content: string;
  fromAbs: string;
  className?: string;
}) {
  const { locale } = useLocale();
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents(locale, fromAbs)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
