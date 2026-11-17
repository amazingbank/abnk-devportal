// 内链路由转换层（Sprint v0.0.1 Part04 任务 3.2 建基；任务 3.3/3.6 扩展）：
// 数据树路径 ↔ 站点路由/资产 URL 的全部转换集中于此，六页面共用——
// 散落各页面的字符串替换会在内容更新时静默断链，故转换只有这一处。
//
// 资产通道（已知坑 1 的两形态）：①文本资产（md/txt/json/yaml/log/py）以构建期
// ?url 复制进产物；②二进制截图 png 不 import 进 JS——sync 直供 public/evidence/
// （任务 3.6 泛化四 Part 全桶），本层把 png 数据树路径换算为直供 URL。
//
// 任务 3.3 扩展：①planning 树 ADR 链接 → 站内决策页路由；②源仓镜像映射四树通用。
// 任务 3.6 扩展（内链路由四类全通）：③sprints 树 md → 站内 DocView 文档路由
// （part 内 Plan↔Phase 与跨 part 链接统一）；④portal-content methodology md →
// 站内方法论路由；⑤planning 树设计文档（非 ADR）→ 站内规划路由。
//
// The single link-conversion layer (built in task 3.2, extended by tasks
// 3.3/3.6): every translation between data-tree paths and site routes /
// asset URLs lives here and is shared by all six pages — scattered string
// replacements would silently break links on content updates, so this
// module is the only place that converts.
//
// Asset channels (the two shapes of pitfall 1): ① text assets (md/txt/json/
// yaml/log/py) are copied into the build output via build-time ?url imports;
// ② binary screenshots (png) are never imported into JS — sync serves them
// from public/evidence/ (generalized to all four part buckets in task 3.6),
// and this layer maps png data-tree paths to that direct-serve URL.
//
// Task 3.3 additions: ① planning-tree ADR links resolve to in-portal
// decision routes; ② the source-repo mirror mapping generalizes to all four
// synced trees.
// Task 3.6 additions (all four in-document link classes resolve): ③ sprints
// md → the in-portal DocView route (covering both within-part Plan↔Phase and
// cross-part links); ④ portal-content methodology md → the in-portal
// methodology route; ⑤ planning-tree design docs (non-ADR) → the in-portal
// planning route.

/** 构建期文档资产映射：sprints 树全部 zh-CN 目录下的 md 原文（?url 直供）。 */
/** Build-time document asset map: every md original under the sprints tree (served via ?url). */
const docUrlMap: Record<string, string> = import.meta.glob('/src/data/sprints/**/zh-CN/*.md', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** 构建期证据资产映射：sprints 树 artifacts 桶内的文本证据件（?url 直供）。
 * 点开头文件（如 phase6/.audit-pairing.py）glob 的 * 不匹配，用显式 .* 模式
 * 补齐（V3.6.4 分桶计数与源侧 find 逐桶一致的缺口之一）。 */
/** Build-time evidence asset map: text evidence files inside the artifacts
 * buckets (served via ?url). Dot-prefixed files (e.g. phase6/.audit-pairing.py)
 * escape the * glob, so an explicit .* pattern closes the gap (one of the two
 * deficits found by the V3.6.4 per-bucket count comparison). */
const evidenceUrlMap: Record<string, string> = {
  ...import.meta.glob('/src/data/sprints/**/artifacts/**/*.{txt,md,json,yaml,log,py}', {
    query: '?url',
    import: 'default',
    eager: true,
  }),
  ...import.meta.glob('/src/data/sprints/**/artifacts/**/.*', {
    query: '?url',
    import: 'default',
    eager: true,
  }),
};

/**
 * 构建期图片清单（任务 3.6）：sprints artifacts 桶内全部 png 的 keys——只取
 * 键不取 loader（不调用即不 emit），URL 由 sync 的 public/evidence 直供通道
 * 给出（二进制不 import 进 JS，已知坑 1）。keys 是构建期静态全量清单，
 * EvidenceIndex 分桶计数与 DocView 证据内联共用。
 *
 * Build-time image inventory (task 3.6): the keys of every png under the
 * sprints artifacts buckets — keys only, loaders never invoked (nothing is
 * emitted unless called); URLs come from the sync-run public/evidence
 * direct-serve channel (binaries are never imported into JS, pitfall 1).
 * The keys form the build-time static inventory shared by the EvidenceIndex
 * bucket counts and the DocView inline evidence cards.
 */
const evidenceImageKeys: Record<string, unknown> = import.meta.glob(
  '/src/data/sprints/**/artifacts/**/*.png',
  { eager: false },
);

/** sprints 数据树带版本段的前缀（图片直供 URL 的换算锚）。 */
/** Versioned prefix of the sprints tree (the anchor for image direct-serve URLs). */
const SPRINTS_VERSIONED_PREFIX = '/src/data/sprints/v0.0.1/';

/** 源仓公网镜像基址（数据树文件在 abnk-asdm 公开仓的 blob 镜像）。 */
/** Public mirror base of the source repo (blob mirror of data-tree files in abnk-asdm). */
const GITHUB_BLOB_BASE = 'https://github.com/amazingbank/abnk-asdm/blob/main/workspace';

/** planning 树 ADR 文档的路径形态（文件名三位前缀 = ADR id）。 */
/** Path shape of a planning-tree ADR document (three-digit filename prefix = ADR id). */
const ADR_PATH_RE = /^\/src\/data\/planning\/abnk-design\/adr\/zh-CN\/(\d{3})-[^/]+\.md$/;

/** sprints 树 Phase/Plan 文档的路径形态（DocView 路由的提取锚）。 */
/** Path shape of a sprints-tree phase/plan document (the DocView route anchor). */
const SPRINTS_MD_RE = /^\/src\/data\/sprints\/v0\.0\.1\/(part\d{2})\/zh-CN\/([^/]+\.md)$/;

/** portal-content 方法论文档的路径形态（methodology 路由锚；en 增量同 doc id）。 */
/** Path shape of a portal-content methodology doc (the methodology route anchor; en grows by the same doc id). */
const METHODOLOGY_MD_RE = /^\/src\/data\/portal-content\/methodology\/(?:zh-CN|en-US)\/([^/]+\.md)$/;

/** planning 树设计文档的路径形态（planning 路由锚——不含 adr/，adr 走决策路由）。 */
/** Path shape of a planning-tree design doc (the planning route anchor — adr/ excluded, ADRs route to decisions). */
const PLANNING_MD_RE = /^\/src\/data\/planning\/abnk-design\/(0\d-[a-z-]+)\/zh-CN\/([^/]+\.md)$/;

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

/** 一个证据文件的呈现形态分类（内联素材卡的渲染分支）。 */
/** The presentation kind of one evidence file (the inline material-card branch). */
export type EvidenceKind = 'image' | 'json' | 'text';

/** 证据内联文件（文本走 ?url 资产，图片走 public/evidence 直供）。 */
/** An inline evidence file (text via the ?url asset channel, images via public/evidence). */
export interface EvidenceFile extends DataFile {
  kind: EvidenceKind;
}

function toEvidenceFile(path: string, url: string): EvidenceFile {
  const name = partAndRel(path).rel;
  const ext = name.split('.').pop() ?? '';
  const kind: EvidenceKind =
    ext === 'png' ? 'image' : ext === 'json' ? 'json' : 'text';
  return { path, name, url, kind };
}

/** png 数据树路径 → public/evidence 直供 URL（part 段保留、artifacts 段剥除）。 */
/** png data-tree path → the public/evidence direct-serve URL (part kept, artifacts stripped). */
function imagePublicUrl(abs: string): string {
  const { partId, rel } = partAndRel(abs);
  return `/evidence/${partId}/${rel}`;
}

/** sprints 树路径 → { partId, artifacts 桶内相对路径 }。 */
/** Sprints-tree path → { partId, path relative to the artifacts bucket }. */
function partAndRel(abs: string): { partId: string; rel: string } {
  const rest = abs.slice(SPRINTS_VERSIONED_PREFIX.length);
  const slash = rest.indexOf('/');
  const partId = rest.slice(0, slash);
  let rel = rest.slice(slash + 1);
  if (rel.startsWith('artifacts/')) rel = rel.slice('artifacts/'.length);
  return { partId, rel };
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

/**
 * DocView 文档路由（任务 3.6）：sprints 树文档的站内阅读页——locale 前缀由
 * MdContent 的 RouterLink 拼装，此处只给语言无关段（partId + 完整文件名）。
 *
 * DocView document route (task 3.6): the in-portal reading page of sprints
 * documents — the locale prefix is assembled by MdContent's RouterLink, so
 * only the locale-independent part (partId + full filename) is given here.
 */
export function evidenceDocRoute(partId: string, doc: string): string {
  return `/evidence/${partId}/doc/${doc}`;
}

/** 方法论单篇路由（docId = 完整文件名；板块根 = /methodology/）。 */
/** Route of one methodology doc (docId = the full filename; section root = /methodology/). */
export function methodologyDocRoute(doc: string): string {
  return `/methodology/${doc}`;
}

/** 规划设计文档路由（sectionId = 分区目录名，docId = 完整文件名）。 */
/** Route of one planning design doc (sectionId = the section dir, docId = the full filename). */
export function planningDocRoute(sectionId: string, doc: string): string {
  return `/planning/${sectionId}/${doc}`;
}

/** Phase 文档原文的资产 URL（doc = 索引条目文件名；不在树内返回 null）。 */
/** Asset URL of a phase document's original (doc = the index entry filename; null when absent). */
export function docUrl(partId: string, doc: string): string | null {
  return (
    Object.entries(docUrlMap).find(([path]) => path.endsWith(`/${partId}/zh-CN/${doc}`))?.[1] ??
    null
  );
}

/** 一个 Part 某一 Phase 的证据文件清单（目录约定 artifacts/phase{key}/——文本 + 图片合并）。 */
/** Evidence-file list of one phase of a part (directory convention artifacts/phase{key}/ — text plus images merged). */
export function phaseEvidenceFiles(partId: string, phase: string): EvidenceFile[] {
  const prefix = `${SPRINTS_VERSIONED_PREFIX}${partId}/artifacts/phase${phase}/`;
  const text = Object.entries(evidenceUrlMap)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, url]) => toEvidenceFile(path, url));
  const images = Object.keys(evidenceImageKeys)
    .filter((path) => path.startsWith(prefix))
    .map((path) => toEvidenceFile(path, imagePublicUrl(path)));
  return [...text, ...images].sort((a, b) => a.name.localeCompare(b.name));
}

/** Part 根级证据（artifacts/ 桶直接子文件——phase 目录约定之外的存量形态）。 */
/** Part-root evidence (direct children of the artifacts bucket — legacy shapes outside the phase-directory convention). */
export function partRootEvidenceFiles(partId: string): EvidenceFile[] {
  const prefix = `${SPRINTS_VERSIONED_PREFIX}${partId}/artifacts/`;
  const text = Object.entries(evidenceUrlMap)
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .map(([path, url]) => toEvidenceFile(path, url));
  return text.sort((a, b) => a.name.localeCompare(b.name));
}

/** 一个 Part 全桶证据计数（文本 glob + 图片清单 keys——与源侧 find 全量一致）。 */
/** Whole-bucket evidence count of one part (text globs + image keys — matching the source-side find). */
export function partEvidenceCount(partId: string): number {
  const prefix = `${SPRINTS_VERSIONED_PREFIX}${partId}/artifacts/`;
  const textCount = Object.keys(evidenceUrlMap).filter((path) => path.startsWith(prefix)).length;
  const imageCount = Object.keys(evidenceImageKeys).filter((path) => path.startsWith(prefix)).length;
  return textCount + imageCount;
}

/** 任务级证据清单：文件名以 task{id}- 起头的全部证据件（跨 phase 桶全树匹配）。 */
/** Task-level evidence list: every evidence file whose basename starts with task{id}- (matched across phase buckets). */
export function taskEvidenceFiles(partId: string, taskId: string): DataFile[] {
  const prefix = `${SPRINTS_VERSIONED_PREFIX}${partId}/artifacts/`;
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
 * Absolute data-tree path → public source-repo mirror URL (the four-tree
 * mapping); null outside every mapping.
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

/** 内链解析结果五类：站内路由 / 站内文档资产 / 直供图片 / 源仓公网镜像 / 无法解析。 */
/** Five resolution outcomes: in-site route, in-tree doc asset, direct-served image, source-repo mirror, or unresolvable. */
export type ResolvedLink =
  | { kind: 'route'; to: string }
  | { kind: 'doc'; url: string }
  | { kind: 'source-repo'; url: string }
  | { kind: 'unresolved'; url: null };

/**
 * 数据树路径 → 源仓坐标（已知坑 2 的两个坐标系）：portal-content 树剥掉了
 * workspace/docs 前缀，文档内相对链接按源仓层级书写——portal-content 文档
 * 里 ../../ 层数与数据树坐标差一层；sprints 在源仓是大写 Sprints。此函数
 * 给出 fromAbs 的源仓形态（用于按源仓坐标重解析链接）。
 *
 * Data-tree path → the source-repo coordinate (the two coordinate systems of
 * pitfall 2): the portal-content tree strips the workspace/docs prefix while
 * in-document relative links are written against the source layout — so
 * portal-content docs walk one ../../ level short, and the source repo spells
 * sprints with a capital S. This function yields the source-repo form of
 * fromAbs (used to re-resolve links in the source coordinate).
 */
function sourcePathOf(abs: string): string | null {
  if (abs.startsWith('/src/data/portal-content/')) {
    return `workspace/docs/portal-content/${abs.slice('/src/data/portal-content/'.length)}`;
  }
  if (abs.startsWith('/src/data/sprints/')) {
    return `workspace/docs/Sprints/${abs.slice('/src/data/sprints/'.length)}`;
  }
  if (abs.startsWith('/src/data/planning/')) {
    return `workspace/docs/planning/${abs.slice('/src/data/planning/'.length)}`;
  }
  if (abs.startsWith('/src/data/index/')) {
    return `workspace/index/${abs.slice('/src/data/index/'.length)}`;
  }
  return null;
}

/**
 * 源仓路径 → 数据树路径（逆映射 + S/s 大小写归一——已知坑 2 的坑口之一）。
 *
 * Source-repo path → data-tree path (the inverse mapping plus the S/s
 * case-folding — one mouth of pitfall 2).
 */
function dataPathOf(sourcePath: string): string | null {
  if (sourcePath.startsWith('workspace/docs/portal-content/')) {
    return `/src/data/portal-content/${sourcePath.slice('workspace/docs/portal-content/'.length)}`;
  }
  if (sourcePath.startsWith('workspace/docs/Sprints/') || sourcePath.startsWith('workspace/docs/sprints/')) {
    return `/src/data/sprints/${sourcePath.slice('workspace/docs/Sprints/'.length)}`;
  }
  if (sourcePath.startsWith('workspace/docs/planning/')) {
    return `/src/data/planning/${sourcePath.slice('workspace/docs/planning/'.length)}`;
  }
  if (sourcePath.startsWith('workspace/index/')) {
    return `/src/data/index/${sourcePath.slice('workspace/index/'.length)}`;
  }
  return null;
}

/** 相对链接段归一（./、..、查询与锚点剥除）。 */
/** Normalizes relative-link segments (./ and .., query and anchor stripped). */
function normalizeSegments(base: string, link: string): string[] {
  const segments = (base + link).split('?')[0].split('#')[0].split('/');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') resolved.pop();
    else resolved.push(seg);
  }
  return resolved;
}

/**
 * 相对链接解析（文档正文内链的路由语义转换——3.3 决策页起用、3.6 全站消费）：
 * 以 fromAbs（数据树绝对路径）为锚，**双坐标解析**（已知坑 2：先按数据树坐标
 * 归一，未命中再按源仓坐标重解析——portal-content 层级差与 S/s 大小写两坑
 * 由 dataPathOf/sourcePathOf 单点换算吸收）。任务 3.6 四类内链全通：sprints
 * md → DocView 路由；methodology md → 方法论路由；planning 设计文档 → 规划
 * 路由；ADR → 决策页路由；png → public/evidence 直供；sprints 树内其余文本件
 * → 构建期资产；四树内非文档（index yaml/json 等）→ 源仓公网镜像并显式标注
 * （降级形态，已知坑 2）。
 *
 * Relative-link resolution (the route-semantics conversion for in-document
 * links — consumed by the 3.3 decision page, then site-wide by 3.6):
 * resolves the link against fromAbs (an absolute data-tree path) in
 * **two coordinates** (pitfall 2: data-tree normalization first, then a
 * source-repo re-resolution on miss — the portal-content level gap and the
 * S/s case fold are both absorbed by the dataPathOf/sourcePathOf single
 * conversion). All four link classes resolve as of task 3.6: sprints md →
 * DocView routes; methodology md → methodology routes; planning design
 * docs → planning routes; ADRs → decision routes; png → public/evidence
 * direct serving; other text files inside the sprints tree → build-time
 * assets; non-document files inside the four trees (index yaml/json etc.)
 * → the public source-repo mirror with an explicit out-of-scope marker
 * (the degraded shape, pitfall 2).
 */
export function resolveRelativeLink(fromAbs: string, link: string): ResolvedLink {
  if (/^https?:\/\//.test(link) || link.startsWith('#') || link.startsWith('mailto:')) {
    return { kind: 'unresolved', url: null };
  }
  const dir = fromAbs.slice(0, fromAbs.lastIndexOf('/') + 1);
  const resolved = normalizeSegments(dir, link);
  const abs = `/${resolved.join('/')}`;

  // 源仓坐标重解析：数据树坐标未命中时，把 fromAbs 换回源仓形态再走一遍
  // （../ 层数按源仓书写才对得上），换算结果再映回数据树路径。
  // Source-coordinate re-resolution: when the data-tree normalization misses,
  // re-walk the segments from fromAbs's source-repo form (the ../ counts are
  // written against the source layout), then map the result back.
  let absData = abs;
  if (!looksResolvable(absData)) {
    const srcDir = sourcePathOf(fromAbs);
    if (srcDir) {
      const srcDirAbs = `/${srcDir.slice(0, srcDir.lastIndexOf('/') + 1)}`;
      const srcResolved = normalizeSegments(srcDirAbs, link);
      const srcAbs = srcResolved.join('/');
      const mapped = dataPathOf(srcAbs);
      if (mapped) absData = mapped;
    }
  }

  return resolveAbs(absData);
}

/** 数据树绝对路径的最终匹配（路由/资产/直供/镜像/未解析五分支）。 */
/** Final matching of an absolute data-tree path (the five branches: route, asset, direct serve, mirror, unresolved). */
function resolveAbs(abs: string): ResolvedLink {
  // 站内路由四类：sprints 文档 / methodology 文档 / planning 设计文档 / ADR。
  // Four in-site route classes: sprints docs, methodology docs, planning
  // design docs, and ADRs.
  const sprintMd = SPRINTS_MD_RE.exec(abs);
  if (sprintMd) return { kind: 'route', to: evidenceDocRoute(sprintMd[1], sprintMd[2]) };
  const methodologyMd = METHODOLOGY_MD_RE.exec(abs);
  if (methodologyMd) return { kind: 'route', to: methodologyDocRoute(methodologyMd[1]) };
  const planningMd = PLANNING_MD_RE.exec(abs);
  if (planningMd) return { kind: 'route', to: planningDocRoute(planningMd[1], planningMd[2]) };
  const adrMatch = ADR_PATH_RE.exec(abs);
  if (adrMatch) {
    return { kind: 'route', to: `/decisions/adr/${adrMatch[1]}` };
  }

  // png：public/evidence 直供（二进制不 import 进 JS）。
  // png: public/evidence direct serving (binaries never imported into JS).
  if (abs in evidenceImageKeys) {
    return { kind: 'doc', url: imagePublicUrl(abs) };
  }

  if (abs in docUrlMap) {
    // 落到 docUrlMap 的 md 不应再走裸资产——sprints md 已被上面的路由分支接住，
    // 这里兜底（如非 zh-CN 目录的边缘形态）保持 ?url 打开原文。
    // An md reaching docUrlMap should not have survived the route branches
    // above; this fallback (edge shapes such as non-zh-CN dirs) keeps the
    // ?url original view.
    return { kind: 'doc', url: docUrlMap[abs] };
  }
  if (abs in evidenceUrlMap) return { kind: 'doc', url: evidenceUrlMap[abs] };
  if (abs.startsWith('/src/data/')) {
    const mirror = dataPathToRepoUrl(abs);
    if (mirror) return { kind: 'source-repo', url: mirror };
  }
  return { kind: 'unresolved', url: null };
}

/** 粗判：归一结果是否已在四树可解域（决定是否启用源仓坐标重解析）。 */
/** Rough check: whether the normalized path falls inside the resolvable four-tree domain (gating the source-coordinate re-resolution). */
function looksResolvable(abs: string): boolean {
  return (
    SPRINTS_MD_RE.test(abs) ||
    METHODOLOGY_MD_RE.test(abs) ||
    PLANNING_MD_RE.test(abs) ||
    ADR_PATH_RE.test(abs) ||
    abs in docUrlMap ||
    abs in evidenceUrlMap ||
    abs in evidenceImageKeys ||
    abs.startsWith('/src/data/portal-content/') ||
    abs.startsWith('/src/data/sprints/') ||
    abs.startsWith('/src/data/planning/') ||
    abs.startsWith('/src/data/index/')
  );
}
