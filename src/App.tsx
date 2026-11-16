import { PortalRouter } from '@/router';

// 任务 3.1 路由接线：App 只挂 PortalRouter，九板块路由注册集中在 src/router.tsx。
// Task 3.1 route wiring: App mounts the PortalRouter; the nine-section route
// registration lives in src/router.tsx.
function App() {
  return <PortalRouter />;
}

export default App;
