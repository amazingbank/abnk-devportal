import { Outlet } from 'react-router-dom';

// 方法论板块路由壳（任务 3.1 挂载点；任务 3.6 起挂正式内容渲染——
// 索引页与篇章子路由由嵌套路由挂载，占位的「规划中」卡片随之退役）。
// Methodology route shell (task 3.1 mount point; since task 3.6 it mounts the
// real content rendering — the index page and per-chapter child routes mount
// via nested routes, retiring the placeholder "planned" card).
export function MethodologyPage() {
  return <Outlet />;
}
