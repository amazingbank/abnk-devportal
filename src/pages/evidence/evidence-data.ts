import {
  partRootEvidenceFiles,
  phaseEvidenceFiles,
  type EvidenceFile,
} from '@/lib/link-resolver';
import { SPRINT_INDEX, findPart, type DocData, type PartData } from '@/pages/timeline/timeline-data';

// 证据页数据模块（任务 3.6）：sprints 文档原文的懒加载通道（import.meta.glob +
// ?raw 按文件分 chunk——已知坑 1 的懒加载形态，DocView 消费）+ 文档索引查询 +
// 证据内联文件的 ?raw 内容 loader（素材卡展开时按需取）。页面零原始格式耦合：
// 元数据走 sprint 契约，原文剥离 front-matter 走渲染管线（lib/markdown/meta）。
// Evidence-page data module (task 3.6): the lazy channel of sprints document
// originals (import.meta.glob + ?raw, chunked per file — the lazy shape of
// pitfall 1, consumed by DocView) plus doc-index lookups and the ?raw
// content loaders of inline evidence files (fetched on demand as material
// cards expand). Pages carry zero raw-format coupling: metadata comes from
// the sprint contract, front-matter stripping from the render pipeline
// (lib/markdown/meta).

/** sprints 树全部文档原文的懒加载映射（key = 数据树绝对路径，按文件分 chunk）。 */
/** Lazy-load map of every sprints document original (key = absolute data-tree path, chunked per file). */
const sprintMdRawModules = import.meta.glob('/src/data/sprints/**/zh-CN/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

/** 证据文件内容的懒加载映射（json/txt/yaml/log/md/py——素材卡按需取）。 */
/** Lazy-load map of evidence-file contents (json/txt/yaml/log/md/py — fetched on demand by material cards). */
const evidenceRawModules = import.meta.glob(
  '/src/data/sprints/**/artifacts/**/*.{txt,md,json,yaml,log,py}',
  { query: '?raw', import: 'default', eager: false },
) as Record<string, () => Promise<string>>;

/** sprints 文档在数据树的绝对路径（原文 loader 键 + 相对链接解析锚）。 */
/** Absolute data-tree path of a sprints document (the raw-loader key and the relative-link anchor). */
export function sprintMdPath(partId: string, doc: string): string {
  return `/src/data/sprints/v0.0.1/${partId}/zh-CN/${doc}`;
}

/** 文档原文 loader（不在树内返回 null——调用方如实展示失败态）。 */
/** Raw loader of a document original (null when absent; callers show the honest failure state). */
export function loadSprintMdRaw(partId: string, doc: string): (() => Promise<string>) | null {
  return sprintMdRawModules[sprintMdPath(partId, doc)] ?? null;
}

/** 证据文件内容 loader（素材卡展开时按需取；不存在返回 null）。 */
/** Content loader of an evidence file (on demand as material cards expand; null when absent). */
export function loadEvidenceRaw(file: EvidenceFile): (() => Promise<string>) | null {
  return evidenceRawModules[file.path] ?? null;
}

/** 按文件名查找 Part 内文档（DocView 的索引入口；不存在返回 null）。 */
/** Find a document inside a part by filename (DocView's index entry point; null when absent). */
export function findDoc(part: PartData | null, docId: string | undefined): DocData | null {
  if (!part || !docId) return null;
  return part.docs.find((d) => d.doc === docId) ?? null;
}

/** findPart 再导出（DocView 单点 import）。 */
/** Re-export of findPart (a single DocView import). */
export { findPart };

/**
 * 一篇文档的证据清单：Phase 文档取本 phase 桶；Plan 文档（phase='plan'）取
 * 全 Part 桶（规划文档的证据面横跨各 Phase）。图片与文本合并、按名排序。
 *
 * Evidence list of one document: a phase doc takes its own phase bucket;
 * the plan doc (phase='plan') takes the whole part bucket (its evidence
 * spans phases). Images and text merge, sorted by name.
 */
export function evidenceOfDoc(partId: string, doc: DocData, part: PartData): EvidenceFile[] {
  if (doc.phase === undefined) return [];
  if (doc.phase === 'plan') {
    const phases = [...new Set(part.docs.map((d) => d.phase).filter((p): p is string => p !== undefined && p !== 'plan'))];
    const files = phases.flatMap((phase) => phaseEvidenceOf(partId, phase));
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }
  return phaseEvidenceOf(partId, doc.phase);
}

function phaseEvidenceOf(partId: string, phase: string): EvidenceFile[] {
  const files = phaseEvidenceFiles(partId, phase);
  return phase === '0' ? [...partRootEvidenceFiles(partId), ...files] : files;
}

/** portal-content 契约再导出（methodology/governance 页消费）。 */
/** Re-export of the portal-content contract (consumed by the methodology/governance pages). */
export const PORTAL_CONTENT = SPRINT_INDEX.portal_content;
export type PortalContentEntryData = (typeof SPRINT_INDEX.portal_content)[number];
