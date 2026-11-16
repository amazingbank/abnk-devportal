import type { ReactNode } from 'react';

// 页面级视觉基底（任务 3.1）：统一 eyebrow / H1 / 描述的页头与内容容器，
// 后续五任务的全部页面共用——页面只组合，不各自发明页头。
// Page-level visual base (task 3.1): a unified eyebrow / H1 / description
// header plus a content container, shared by every page of the five follow-up
// tasks — pages compose instead of inventing their own headers.
export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-x py-14 md:py-20">
      <header className="max-w-3xl">
        <p className="eyebrow text-copper-600">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl text-char md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-5 text-sm leading-relaxed text-espresso md:text-base">{description}</p>
        ) : null}
      </header>
      {children ? <div className="mt-10 md:mt-14">{children}</div> : null}
    </div>
  );
}
