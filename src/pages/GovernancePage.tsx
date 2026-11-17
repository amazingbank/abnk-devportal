import { GovernanceView } from './governance/GovernanceView';

// 治理板块页（任务 3.1 挂载点；任务 3.6 起挂正式内容渲染——
// 双语导读 + ADR-010 压轴卡，占位的「规划中」卡片随之退役）。
// Governance section page (task 3.1 mount point; since task 3.6 it mounts the
// real content rendering — the bilingual guide plus the closing ADR-010
// card, retiring the placeholder "planned" card).
export function GovernancePage() {
  return <GovernanceView />;
}
