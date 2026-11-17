import { Outlet } from 'react-router-dom';

// 规划板块路由壳（任务 3.1 挂载点；任务 3.6 起挂正式内容渲染——
// 分区索引页与设计文档子路由由嵌套路由挂载，占位的「规划中」卡片随之退役）。
// Planning route shell (task 3.1 mount point; since task 3.6 it mounts the
// real content rendering — the section index and per-doc child routes mount
// via nested routes, retiring the placeholder "planned" card).
export function PlanningPage() {
  return <Outlet />;
}
