import { useEffect, type ComponentType } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { LocaleProvider } from '@/i18n/locale-provider';
import { DEFAULT_LOCALE, useCommon, type Nav as NavCopy } from '@/i18n';
import { EvidencePage } from '@/pages/EvidencePage';
import { GovernancePage } from '@/pages/GovernancePage';
import { HomeView } from '@/pages/HomeView';
import { JourneyPage } from '@/pages/JourneyPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { MethodologyPage } from '@/pages/MethodologyPage';
import { PlanningPage } from '@/pages/PlanningPage';
import { ReproducePage } from '@/pages/ReproducePage';
import { AdrView } from '@/pages/decisions/AdrView';
import { DecisionsPage } from '@/pages/decisions/DecisionsPage';
import { DecisionTimeline } from '@/pages/decisions/DecisionTimeline';
import { DocView } from '@/pages/evidence/DocView';
import { EvidenceIndex } from '@/pages/evidence/EvidenceIndex';
import { MethodologyDoc, MethodologyIndex } from '@/pages/methodology/MethodologyView';
import { PlanningDoc, PlanningIndex } from '@/pages/planning/PlanningView';
import { PartView } from '@/pages/timeline/PartView';
import { PhaseView } from '@/pages/timeline/PhaseView';
import { SprintView } from '@/pages/timeline/SprintView';
import { TaskView } from '@/pages/timeline/TaskView';
import { TimelinePage } from '@/pages/timeline/TimelinePage';

// 板块路由表（IA 映射表 v2.1「入口路由建议」的实现层落点）：
// id 与 nav.json 的 sections 键一一对应（satisfies 编译期互证——路由缺词条
// 在此直接编译失败），path 为语言前缀下的相对路径。
// Section route table (the implementation-side landing of the IA mapping's
// "entry routes"): each id maps 1:1 to a nav.json sections key (enforced at
// compile time via satisfies — a route without copy fails the build), and
// each path is relative to the locale prefix.
export const SECTION_ROUTES = [
  { id: 'methodology', path: 'methodology' },
  { id: 'planning', path: 'planning' },
  { id: 'decisions', path: 'decisions' },
  { id: 'timeline', path: 'timeline' },
  { id: 'evidence', path: 'evidence' },
  { id: 'journey', path: 'journey' },
  { id: 'metrics', path: 'metrics' },
  { id: 'governance', path: 'governance' },
  { id: 'reproduce', path: 'reproduce' },
] as const satisfies readonly { id: keyof NavCopy['sections']; path: string }[];

export type SectionId = (typeof SECTION_ROUTES)[number]['id'];

// 板块 → 页面组件挂载表：satisfies 保证每个路由 id 都有挂载点（漏一页即编译失败）。
// Section → page component mount table: satisfies guarantees every route id
// has a mount point (a missing page fails the build).
const SECTION_PAGES = {
  methodology: MethodologyPage,
  planning: PlanningPage,
  decisions: DecisionsPage,
  timeline: TimelinePage,
  evidence: EvidencePage,
  journey: JourneyPage,
  metrics: MetricsPage,
  governance: GovernancePage,
  reproduce: ReproducePage,
} satisfies Record<SectionId, ComponentType>;

// 路由切换后回顶（md 深链锚点由浏览器原生 #fragment 处理，不在此拦截）。
// Scroll back to top on route changes (deep-link #fragments are handled
// natively by the browser and are not intercepted here).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 板块内未匹配路径：保持当前语言前缀，仅重置回该语言的首页（reset 语义，
// 与 main.tsx 对无前缀 URL 的处理一致——未知路径不冒充 404 内容页）。
// Unmatched paths within a locale: keep the current locale prefix and reset
// to that locale's home (reset semantics, mirroring main.tsx's handling of
// prefix-less URLs — unknown paths do not pretend to be 404 content pages).
function UnknownPath() {
  const { locale } = useParams();
  return <Navigate to={`/${locale ?? DEFAULT_LOCALE}/`} replace />;
}

// 语言布局门 + 全站页壳（Nav / 内容 Outlet / Footer）。
// Locale layout gate + the site-wide shell (Nav / content Outlet / Footer).
function PortalLayout() {
  const { locale: localeParam } = useParams();
  const common = useCommon();
  const valid = localeParam === 'zh-cn' || localeParam === 'en-us';

  if (!valid) {
    // 防御分支：main.tsx 挂载前已拦截非法前缀，此处兜底程序导航类边界。
    // Defensive branch: main.tsx intercepts invalid prefixes before mount;
    // this guards programmatic-navigation edges.
    return <Navigate to={`/${DEFAULT_LOCALE}/`} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-char focus:px-4 focus:py-2 focus:text-xs focus:text-ivory"
      >
        {common.shell.skipToContent}
      </a>
      <Nav />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// 路由器总装：BrowserRouter（v7 future flags 与 backoffice 同参）→
// LocaleProvider（router navigate 单通道切换语言）→ 板块路由。
// Router assembly: BrowserRouter (v7 future flags matching the backoffice
// precedent) → LocaleProvider (locale switching via the router navigate
// channel only) → section routes.
export function PortalRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <LocaleProvider>
        <Routes>
          <Route path="/:locale" element={<PortalLayout />}>
            <Route index element={<HomeView />} />
            {SECTION_ROUTES.filter((r) => r.id !== 'timeline' && r.id !== 'decisions').map(({ id, path }) => {
              // JSX 成员表达式只支持点号写法，索引取组件需先落到局部常量。
              // JSX member expressions only allow dot notation, so the indexed
              // component must first land in a local constant.
              const SectionElement = SECTION_PAGES[id];
              return <Route key={id} path={path} element={<SectionElement />} />;
            })}
            {/* 灵魂页面：四层下钻嵌套路由（Sprint/Part/Phase/Task——任务 3.2）。 */}
            {/* The soul page: four-level drill-down nested routes (Sprint/Part/Phase/Task — task 3.2). */}
            <Route path="timeline" element={<TimelinePage />}>
              <Route index element={<SprintView />} />
              <Route path=":partId" element={<PartView />} />
              <Route path=":partId/phase/:phaseId" element={<PhaseView />} />
              <Route path=":partId/task/:taskId" element={<TaskView />} />
            </Route>
            {/* 决策时间线：ADR + Part 拍板记录按日期合并 + ADR 原文页（任务 3.3）。 */}
            {/* Decision timeline: ADRs plus Part decisions merged by date, with ADR original pages (task 3.3). */}
            <Route path="decisions" element={<DecisionsPage />}>
              <Route index element={<DecisionTimeline />} />
              <Route path="adr/:adrId" element={<AdrView />} />
            </Route>
            {/* 方法论：内容渲染（索引 + 篇章子路由，任务 3.6）。 */}
            {/* Methodology: content rendering (index plus chapter child routes, task 3.6). */}
            <Route path="methodology" element={<MethodologyPage />}>
              <Route index element={<MethodologyIndex />} />
              <Route path=":docId" element={<MethodologyDoc />} />
            </Route>
            {/* 规划原文：设计文档分区索引 + 单篇渲染（任务 3.6）。 */}
            {/* Planning originals: the design-doc section index plus per-doc rendering (task 3.6). */}
            <Route path="planning" element={<PlanningPage />}>
              <Route index element={<PlanningIndex />} />
              <Route path=":sectionId/:docId" element={<PlanningDoc />} />
            </Route>
            {/* 证据浏览：Part 分桶索引 + DocView 通用文档页（任务 3.6，六任务收口）。 */}
            {/* Evidence browsing: the part-bucket index plus the DocView generic document page (task 3.6, the six-task closing). */}
            <Route path="evidence" element={<EvidencePage />}>
              <Route index element={<EvidenceIndex />} />
              <Route path=":partId/doc/:docId" element={<DocView />} />
            </Route>
            <Route path="*" element={<UnknownPath />} />
          </Route>
          <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}/`} replace />} />
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  );
}
