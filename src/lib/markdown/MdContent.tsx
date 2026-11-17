import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';

import { useLocale } from '@/i18n';
import { resolveRelativeLink } from '@/lib/link-resolver';

// markdown 渲染管线基座（任务 3.3 选型落定：react-markdown + remark-gfm——
// remark/rehype 同族；GFM 表格是 ADR-010 五仓定位表的硬需求）。
// 任务 3.6 扩展——内链路由四类全通 + 三态视觉层次（已知坑 3）：
// ①勾选步骤（GFM task list `- [x]`）→ sage 实勾样式；②待执行步骤（`- [ ]`）
// → copper 空框样式；③执行输出行（「实测（…）」起头的 li）→ 背景块与勾选
// 步骤视觉区分——渲染管线只加样式钩子，状态判定归 front-matter（呈现状态、
// 不判定状态）。内链经 link-resolver 单点转换：文档 md/ADR/方法论/规划 →
// 站内路由；树内文本件 → 构建期资产；png → public/evidence 直供；树外 →
// 源仓公网镜像并显式标注（↗ + data-out-of-scope）。
//
// Markdown render-pipeline base (task 3.3 selection: react-markdown +
// remark-gfm — same remark/rehype family; GFM tables are a hard requirement
// of the ADR-010 five-repo table).
// Task 3.6 additions — all four link classes resolve, plus the three-state
// visual hierarchy (pitfall 3): ① checked steps (GFM task-list `- [x]`) take
// the solid sage check; ② pending steps (`- [ ]`) take the hollow copper
// frame; ③ execution-output lines (li starting with "实测（…）") take a
// background block visually distinct from the checked steps — the pipeline
// only adds style hooks, status judging stays with the front-matter (render
// presents, never judges). In-document links convert through the single
// link-resolver: document mds/ADRs/methodology/planning become in-site
// routes; in-tree text files become build-time assets; png files become
// public/evidence direct serves; out-of-tree targets become public
// source-repo mirrors with an explicit marker (↗ + data-out-of-scope).

/** 行内代码与代码块的统一样式（tailwind，无外部排版插件）。 */
/** Unified inline/block code styling (Tailwind only, no typography plugin). */

/** 递归提取节点子树的首个文本片段（执行输出行的「实测（」前缀判定用）。 */
/** Recursively extracts the first text fragment of a node subtree (for the "实测（" prefix test). */
function firstTextOf(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    for (const child of node) {
      const text = firstTextOf(child);
      if (text) return text;
    }
    return '';
  }
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return props ? firstTextOf(props.children) : '';
  }
  return '';
}

/** GFM task-list 勾选框：已勾 = sage 实勾，未勾 = copper 空框（呈现状态不判定）。 */
/** GFM task-list checkbox: checked renders the solid sage check, unchecked the hollow copper frame (presenting, never judging). */
function TaskCheckbox({ checked }: { checked?: boolean }) {
  return (
    <span
      data-task-checked={checked ? 'true' : 'false'}
      aria-hidden="true"
      className={`mr-2 inline-flex h-4 w-4 shrink-0 translate-y-[2px] items-center justify-center rounded-sm border font-mono text-[10px] leading-none ${
        checked ? 'border-sage-600 bg-sage-500/15 text-sage-700' : 'border-copper-500/70 text-copper-500'
      }`}
    >
      {checked ? '✓' : ''}
    </span>
  );
}

const mdComponents = (locale: string, fromAbs: string): Components => ({
  h1: (p) => <h1 className="mt-10 font-serif text-2xl text-char md:text-3xl" {...p} />,
  h2: (p) => <h2 className="mt-10 font-serif text-xl text-char md:text-2xl" {...p} />,
  h3: (p) => <h3 className="mt-8 font-serif text-lg text-char" {...p} />,
  h4: (p) => <h4 className="mt-6 font-mono text-[13px] uppercase tracking-eyebrow text-copper-600" {...p} />,
  p: (p) => <p className="mt-4 text-sm leading-relaxed text-espresso" {...p} />,
  ul: (p) => <ul className="mt-4 list-disc pl-6" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal pl-6" {...p} />,
  li: ({ children, className, ...p }) => {
    const isTaskItem = typeof className === 'string' && className.includes('task-list-item');
    // 执行输出行的两种年代形态：Part04 起的行首「实测（2026-…）」独立行；
    // Part02 时期的「期望输出：…（✅ 实测 2026-…：…）」内联形态。
    // Two era shapes of execution-output lines: the standalone "实测（2026-…）"
    // line head used since Part04, and the Part02-era inline "…（✅ 实测
    // 2026-…: …）" shape.
    const liText = firstTextOf(children);
    const isExecOutput =
      liText.startsWith('实测（') || liText.startsWith('实测(') || liText.includes('✅ 实测');
    if (isTaskItem) {
      return (
        <li className="mt-2 flex list-none items-start pl-0 text-sm leading-relaxed text-espresso" {...p}>
          {children}
        </li>
      );
    }
    if (isExecOutput) {
      // 执行输出块（三态之二）：sage 背景条与勾选步骤视觉区分——呈现钩子。
      // Execution-output block (state two of three): a sage background strip
      // visually distinct from the checked steps — a presentation hook.
      return (
        <li
          data-exec-output="true"
          className="mt-2 list-none border-l-2 border-l-sage-500/60 bg-ivory-100 py-1.5 pl-4 pr-2 text-sm leading-relaxed text-espresso"
          {...p}
        >
          {children}
        </li>
      );
    }
    return <li className="mt-1.5 text-sm leading-relaxed text-espresso" {...p}>{children}</li>;
  },
  input: ({ checked, type }) =>
    type === 'checkbox' ? <TaskCheckbox checked={checked} /> : null,
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
