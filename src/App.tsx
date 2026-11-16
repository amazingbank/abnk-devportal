import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { useHome } from '@/i18n';

// 空壳占位页（任务 1.2 范围）：Nav + 骨架说明 + Footer，无业务渲染——
// 八板块路由与页面随 Phase 3（任务 3.1）落位。
// Placeholder shell within task 1.2 scope: Nav + skeleton note + Footer,
// no business rendering — the eight sections arrive with Phase 3 (task 3.1).
function App() {
  const home = useHome();

  return (
    <>
      <Nav />
      <main className="page-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow text-copper-600">{home.skeleton.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-3xl text-char md:text-4xl">
          {home.skeleton.title}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-espresso md:text-base">
          {home.skeleton.body}
        </p>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-eyebrow text-taupe-500">
          {home.skeleton.phaseNote}
        </p>
      </main>
      <Footer />
    </>
  );
}

export default App;
