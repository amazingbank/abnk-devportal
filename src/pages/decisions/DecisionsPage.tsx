import { Outlet } from 'react-router-dom';

// 决策板块路由壳（任务 3.3）：决策时间线（index）与 ADR 原文页由嵌套路由挂载。
// Decisions route shell (task 3.3): the decision timeline (index) and ADR
// original pages mount via nested routes.
export function DecisionsPage() {
  return <Outlet />;
}
