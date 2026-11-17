import { Outlet } from 'react-router-dom';

// 证据板块路由壳（任务 3.6）：证据索引（index）与 DocView 文档页由嵌套路由挂载。
// Evidence route shell (task 3.6): the evidence index (index route) and the
// DocView document pages mount via nested routes.
export function EvidencePage() {
  return <Outlet />;
}
