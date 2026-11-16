// 内链路由转换层（Sprint v0.0.1 Part04 任务 3.2 建基；任务 3.3 扩展）：
// 数据树路径 ↔ 站点路由/资产 URL 的全部转换集中于此，六页面共用——
// 散落各页面的字符串替换会在内容更新时静默断链，故转换只有这一处。
//
// 资产通道（已知坑 1 的文本资产形态）：sprints 数据树内的 md 文档与文本证据件
// （txt/md/json/yaml）以构建期 ?url 复制进产物——「构建纯复制」（D4）在资产层的
// 体现；二进制截图不 import 进 JS，走后续任务的 public/evidence 清单直供通道。
//
// 任务 3.3 扩展：①planning 树 ADR 链接 → 站内决策页路由（markdown 内链优先
// 站内跳转而非裸文件）；②源仓镜像映射从 sprints 单树扩展为四树通用。
//
// The single link-conversion layer (built in task 3.2, extended in task 3.3):
// every translation between data-tree paths and site routes / asset URLs lives
// here and is shared by all six pages — scattered string replacements would
// silently break links on content updates, so this module is the only place
// that converts.
//
// Asset channel (the text-asset shape of known pitfall 1): md documents and
// text evidence files (txt/md/json/yaml) inside the sprints data tree are
// copied into the build output via build-time ?url imports — "build by pure
// copy" (D4) at the asset layer. Binary screenshots are never imported into
// JS; they flow through the public/evidence manifest channel of the later
// tasks.
//
// Task 3.3 additions: ① planning-tree ADR links resolve to in-portal decision
// routes (in-document links prefer in-site hops over raw files); ② the
// source-repo mirror mapping generalizes from the sprints tree alone to all
// four synced trees.

/** 构建期文档资产映射：sprints 树全部 zh-CN 目录下的 md 原文（?url 直供）。 */
/** Build-time document asset map: every md original under the sprints tree (served via ?url). */
const docUrlMap: Record<string, string> = import.meta.glob('/src/data/sprints/**/zh-CN/*.md', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** 构建期证据资产映射：sprints 树 artifacts 桶内的文本证据件（?url 直供）。 */
/** Build-time evidence asset map: text evidence files inside the artifacts buckets (served via ?url). */
const evidenceUrlMap: Record<string, string> = import.meta.glob(
  '/src/data/sprints/**/artifacts/**/*.{txt,md,json,yaml}',
  { query: '?url', import: 'default', eager: true },
);

/** sprints 数据树在 src/data/ 下的根前缀（sync 复制映射的落点）。 */
/** Root prefix of the sprints data tree under src/data/ (the sync mapping target). */
const SPRINTS_PREFIX = '/src/data/sprints/';

/** 源仓公网镜像基址（数据树文件在 abnk-asdm 公开仓的 blob 镜像）。 */
/** Public mirror base of the source repo (blob mirror of data-tree files in abnk-asdm). */
const GITHUB_BLOB_BASE = 'https://github.com/amazingbank/abnk-asdm/blob/main/workspace';

/** planning 树 ADR 文档的路径形态（文件名三位前缀 = ADR id）。 */
/** Path shape of a planning-tree ADR document (three-digit filename prefix = ADR id). */
const ADR_PATH_RE = /^\/src\/data\/planning\/abnk-design\/adr\/zh-CN\/(\d{3})-[^/]+\.md$/;

/** sprints 数据树内的一个可点击文件（构建期资产 URL + 展示名）。 */
/** One clickable file of the sprints data tree (build-time asset URL + display name). */
export interface DataFile {
  /** 数据树绝对路径（/src/data/... 形态）。 */
  /** Absolute path inside the data tree (/src/data/...). */
  path: string;
  /** 展示名（相对 artifacts 桶的路径，如 phaseP2/taskP2.4-transfer-evidence.txt）。 */
  /** Display name (path relative to the artifacts bucket). */
  name: string;
  /** 构建期资产 URL（dev 即数据树原路径，build 即哈希产物路径）。 */
  /** Build-time asset URL (raw data-tree path in dev, hashed asset path in build). */
  url: string;
}

function toDataFile(entry: [path: string, url: string], cutAfter: string): DataFile {
  const rel = entry[0].slice(SPRINTS_PREFIX.length);
  const cut = rel.indexOf(cutAfter);
  const name = cut >= 0 ? rel.slice(cut + cutAfter.length) : rel;
  return { path: entry[0], name, url: entry[1] };
}

/** 任务引用（'part04:1.1' 形态）解析结果。 */
/** Parsed task reference ('part04:1.1' shape). */
export interface TaskRef {
  partId: string;
  taskId: string;
}

/** 解析 'part03:5.5' 形态的任务引用（形态不符返回 null）。 */
/** Parse a 'part03:5.5'-shaped task reference (null on shape mismatch). */
export function parseTaskRef(ref: string): TaskRef | null {
  const idx = ref.indexOf(':');
  if (idx <= 0) return null;
  const partId = ref.slice(0, idx);
  const taskId = ref.slice(idx + 1);
  if (!/^part\d{2}$/.test(partId) || !taskId || !/^[\w.]+$/.test(taskId)) return null;
  return { partId, taskId };
}

/** 四层下钻的路由拼装（Sprint / Part / Phase / Task 四层统一走此函数）。 */
/** Route assembly for the four drill-down levels (all four go through this). */
export function timelineRoute(
  locale: string,
  partId?: string,
  scope?: { kind: 'phase' | 'task'; id: string },
): string {
  const base = `/${locale}/timeline`;
  if (!partId) return `${base}/`;
  const part = `${base}/${partId}`;
  if (!scope) return part;
  return `${part}/${scope.kind}/${scope.id}`;
}

/** ADR 原文页路由（decisions 板块内）。 */
/** Route of an ADR original page (inside the decisions section). */
export function adrRoute(locale: string, adrId: string): string {
  return `/${locale}/decisions/adr/${adrId}`;
}

/** 决策时间线路由（板块根）。 */
/** Route of the decision timeline (section root). */
export function decisionsRoute(locale: string): string {
  return `/${locale}/decisions/`;
}

/** Phase 文档原文的资产 URL（doc = 索引条目文件名；不在树内返回 null）。 */
/** Asset URL of a phase document's original (doc = the index entry filename; null when absent). */
export function docUrl(partId: string, doc: string): string | null {
  return (
    Object.entries(docUrlMap).find(([path]) => path.endsWith(`/${partId}/zh-CN/${doc}`))?.[1] ??
    null
  );
}

/** 一个 Part 某一 Phase 的证据文件清单（目录约定 artifacts/phase{key}/）。 */
/** Evidence-file list of one phase of a part (directory convention artifacts/phase{key}/). */
export function phaseEvidenceFiles(partId: string, phase: string): DataFile[] {
  const prefix = `${SPRINTS_PREFIX}v0.0.1/${partId}/artifacts/phase${phase}/`;
  return Object.entries(evidenceUrlMap)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, url]) => toDataFile([path, url], `${partId}/artifacts/`))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Part 根级证据（artifacts/ 桶直接子文件——phase 目录约定之外的存量形态）。 */
/** Part-root evidence (direct children of the artifacts bucket — legacy shapes outside the phase-directory convention). */
export function partRootEvidenceFiles(partId: string): DataFile[] {
  const prefix = `${SPRINTS_PREFIX}v0.0.1/${partId}/artifacts/`;
  return Object.entries(evidenceUrlMap)
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .map(([path, url]) => toDataFile([path, url], `${partId}/artifacts/`))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** 任务级证据清单：文件名以 task{id}- 起头的全部证据件（跨 phase 桶全树匹配）。 */
/** Task-level evidence list: every evidence file whose basename starts with task{id}- (matched across phase buckets). */
export function taskEvidenceFiles(partId: string, taskId: string): DataFile[] {
  const prefix = `${SPRINTS_PREFIX}v0.0.1/${partId}/artifacts/`;
  const wanted = `task${taskId}-`;
  return Object.entries(evidenceUrlMap)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, url]) => {
      const rel = path.slice(prefix.length);
      return { path, name: rel, url };
    })
    .filter((f) => f.name.split('/').pop()?.startsWith(wanted))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 数据树绝对路径 → 源仓公网镜像 URL（四树通用映射：sprints/planning/index/
 * portal-content）。映射外返回 null。
 *
 * Absolute data-tree path → public source-repo mirror URL (the
 * four-tree mapping: sprints/planning/index/portal-content); null outside
 * every mapping.
 */
function dataPathToRepoUrl(abs: string): string | null {
  const rel = abs.slice('/src/data/'.length);
  if (rel.startsWith('sprints/')) {
    return `${GITHUB_BLOB_BASE}/docs/Sprints/${rel.slice('sprints/'.length)}`;
  }
  if (rel.startsWith('planning/')) {
    return `${GITHUB_BLOB_BASE}/docs/planning/${rel.slice('planning/'.length)}`;
  }
  if (rel.startsWith('index/')) {
    return `${GITHUB_BLOB_BASE}/index/${rel.slice('index/'.length)}`;
  }
  if (rel.startsWith('portal-content/')) {
    return `${GITHUB_BLOB_BASE}/docs/portal-content/${rel.slice('portal-content/'.length)}`;
  }
  return null;
}

/** 内链解析结果四类：站内路由 / 站内文档资产 / 源仓公网镜像 / 无法解析。 */
/** Four resolution outcomes: in-site route, in-tree doc asset, source-repo mirror, or unresolvable. */
export type ResolvedLink =
  | { kind: 'route'; to: string }
  | { kind: 'doc'; url: string }
  | { kind: 'source-repo'; url: string }
  | { kind: 'unresolved'; url: null };

/**
 * 相对链接解析（文档正文内链的路由语义转换——3.3 决策页起用、3.6 渲染管线
 * 全面消费）：以 fromAbs（数据树绝对路径）为锚解析相对链接；ADR 文档 → 站内
 * 决策页路由；sprints 树内文件 → 构建期文档资产；四树内其余 → 源仓公网镜像
 * 并显式标注（降级形态，已知坑 2）。
 *
 * Relative-link resolution (the route-semantics conversion for in-document
 * links — consumed by the 3.3 decision page, then by the 3.6 render pipeline
 * at large): resolves the link against fromAbs (an absolute data-tree path);
 * ADR documents map to in-portal decision routes, files inside the sprints
 * tree map to build-time doc assets, other files inside the four synced
 * trees map to the public source-repo mirror with an explicit out-of-scope
 * marker (the degraded shape, pitfall 2).
 */
export function resolveRelativeLink(fromAbs: string, link: string): ResolvedLink {
  if (/^https?:\/\//.test(link) || link.startsWith('#') || link.startsWith('mailto:')) {
    return { kind: 'unresolved', url: null };
  }
  const dir = fromAbs.slice(0, fromAbs.lastIndexOf('/') + 1);
  const segments = (dir + link).split('?')[0].split('#')[0].split('/');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') resolved.pop();
    else resolved.push(seg);
  }
  const abs = `/${resolved.join('/')}`;
  const adrMatch = ADR_PATH_RE.exec(abs);
  if (adrMatch) {
    return { kind: 'route', to: `/decisions/adr/${adrMatch[1]}` };
  }
  if (abs in docUrlMap) return { kind: 'doc', url: docUrlMap[abs] };
  if (abs in evidenceUrlMap) return { kind: 'doc', url: evidenceUrlMap[abs] };
  if (abs.startsWith('/src/data/')) {
    const mirror = dataPathToRepoUrl(abs);
    if (mirror) return { kind: 'source-repo', url: mirror };
  }
  return { kind: 'unresolved', url: null };
}
