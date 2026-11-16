import { Outlet } from 'react-router-dom';

// 时间线路由壳（任务 3.2）：四层下钻共用此壳——Sprint（index）/Part/Phase/
// Task 各层由嵌套路由挂载；层级头部与面包屑在各视图内按层数据自绘。
// Timeline route shell (task 3.2): all four drill-down levels share this
// shell — Sprint (index) / Part / Phase / Task mount via nested routes, while
// level headers and breadcrumbs are drawn per-view from the level's data.
export function TimelinePage() {
  return <Outlet />;
}
