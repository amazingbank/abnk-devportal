import { Link } from 'react-router-dom';

import { SECTION_ROUTES } from '@/router';
import { useHome, useLocale, useNav } from '@/i18n';

// 首页导览（任务 3.1）：hero 消费 home 词条；板块目录卡片按 SECTION_ROUTES
// 顺序渲染九板块（nav 词条）——首页是路由骨架的第一个真实页面，overview
// 长文渲染随渲染器任务（3.6）接入。
// Home directory (task 3.1): the hero consumes the home copy; the section
// cards render the nine sections (nav copy) in SECTION_ROUTES order — the
// first real page of the routing skeleton, with the long-form overview
// landing later alongside the renderer (task 3.6).
export function HomeView() {
  const home = useHome();
  const nav = useNav();
  const { locale } = useLocale();

  return (
    <div className="page-x py-14 md:py-20">
      <header className="max-w-3xl">
        <p className="eyebrow text-copper-600">{home.hero.eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-char md:text-5xl">
          {home.hero.title}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-espresso md:text-base">{home.hero.body}</p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
          {home.hero.phaseNote}
        </p>
      </header>

      <section className="mt-14 md:mt-20">
        <p className="eyebrow text-copper-600">{home.directory.eyebrow}</p>
        <h2 className="mt-3 font-serif text-2xl text-char md:text-3xl">{home.directory.title}</h2>
        <p className="mt-3 text-sm text-espresso">{home.directory.hint}</p>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_ROUTES.map(({ id, path }) => {
            const section = nav.sections[id];
            return (
              <li key={id}>
                <Link
                  to={`/${locale}/${path}`}
                  className="group flex h-full flex-col border border-taupe-300/70 bg-ivory-50 p-6 transition-colors duration-200 hover:border-copper-500"
                >
                  <p className="eyebrow text-copper-600">{section.eyebrow}</p>
                  <h3 className="mt-3 font-serif text-lg text-char transition-colors group-hover:text-copper-700">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-espresso">{section.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
