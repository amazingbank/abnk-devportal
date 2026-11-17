import { phaseEvidenceFiles } from '@/lib/link-resolver';

// 旅程数据模块（任务 3.5）：五步 + 核对步的故事结构、三载体复验与问题记录，
// 全部内容从 phaseP3 真实素材文字化（快照关键节点 / 证据报告原文摘录）——
// 页面零原始解析：快照 yaml 与证据 md 的可点击 URL 统一经 link-resolver 的
// evidenceUrlMap（?url 资产直供），截图 PNG 走 public/evidence 静态直供
// （已知坑 1 的二进制形态，不 import 进 JS）。
// Journey data module (task 3.5): the five-step-plus-check story structure,
// the multi-carrier re-verification and the problem records are all text-ified
// from the real phaseP3 assets (snapshot key nodes / verbatim excerpts of the
// evidence report) — zero raw parsing on the page: clickable URLs of snapshot
// yamls and evidence md always come from the link-resolver's evidenceUrlMap
// (?url asset channel) while screenshot PNGs flow through the public/evidence
// static channel (the binary shape of pitfall 1, never imported into JS).

/** 旅程素材在 public/evidence 下的静态直供基址（sync-data.sh 直供通道落点）。 */
/** Static direct-serve base of the journey assets under public/evidence (the sync channel target). */
const EVIDENCE_BASE = '/evidence/part02/phaseP3';

/** 截图静态 URL（screenshots/ 桶，载体前缀命名）。 */
/** Static URL of a screenshot (screenshots/ bucket, carrier-prefixed naming). */
export function shotUrl(file: string): string {
  return `${EVIDENCE_BASE}/screenshots/${file}`;
}

/** phaseP3 文本证据件（快照 yaml / 报告）的 ?url 资产映射（单点取用）。 */
/** The ?url asset map of phaseP3 text evidence (snapshot yamls / reports) — single access point. */
const phaseP3Files = phaseEvidenceFiles('part02', 'P3');

/** 快照 yaml 的构建期资产 URL（找不到返回 null，由调用方降级展示文件名）。 */
/** Build-time asset URL of a snapshot yaml (null when absent; callers degrade to the filename). */
export function snapshotUrl(file: string): string | null {
  return phaseP3Files.find((f) => f.name === `phaseP3/${file}`)?.url ?? null;
}

/** 主证据报告（taskP3.1 走查记录）的构建期资产 URL。 */
/** Build-time asset URL of the primary evidence report (the taskP3.1 walkthrough record). */
export function primaryEvidenceUrl(): string | null {
  return phaseP3Files.find((f) => f.name === 'phaseP3/taskP3.1-mobile-e2e.md')?.url ?? null;
}

/** p3-login.yaml 原文（a11y 未开启状态的原始快照——诚实性区块原样展示用）。 */
/** The raw p3-login.yaml (the pre-a11y snapshot — displayed verbatim in the honesty zone). */
const loginRaw = import.meta.glob('/src/data/sprints/v0.0.1/part02/artifacts/phaseP3/p3-login.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const P3_LOGIN_RAW: string =
  Object.values(loginRaw)[0] ?? '（p3-login.yaml 未找到——如实降级展示，请检查 sync）';

/** 一个旅程步骤（快照关键节点文字化 + 截图卡 + 证据链接三素材）。 */
/** One journey step (key nodes text-ified, a screenshot card, an evidence link). */
export interface JourneyStep {
  no: number;
  /** 核对步标记（第六步语义——Fineract 侧独立核对）。 */
  /** The check-step marker (the sixth step — Fineract-side independent verification). */
  kind: 'step' | 'check';
  title: string;
  /** 快照关键节点（快照 yaml 内容的文字化摘录，原样口径）。 */
  /** Snapshot key nodes (text-ified excerpts of the snapshot yaml, as-is). */
  nodes: string[];
  /** 快照 yaml 文件名（p3-01.yaml 等）。 */
  /** Snapshot yaml filename (p3-01.yaml etc.). */
  snapshot: string;
  /** 截图文件名（web-01-login.png 等，相对 screenshots/）。 */
  /** Screenshot filename (web-01-login.png etc., relative to screenshots/). */
  shot?: string;
}

/** 五步旅程 + 余额核对步（源：taskP3.1-mobile-e2e.md 五步走查 + Fineract 侧独立核对）。 */
/** The five journey steps plus the balance check (source: the taskP3.1 report's five-step walkthrough and Fineract verification). */
export const JOURNEY_STEPS: JourneyStep[] = [
  {
    no: 1,
    kind: 'step',
    title: '登录（网关 PBKDF2 凭据 + JWT 签发）',
    nodes: [
      '登录表单：用户名 / 密码输入 + 「登 录」',
      'alice + local-prodform 口令 → POST /login 200，JWT 注入 Bearer 拦截器',
      '快照原文备注：指纹登录与安全键盘为视觉占位（POC 范围外）',
    ],
    snapshot: 'p3-01.yaml',
    shot: 'web-01-login.png',
  },
  {
    no: 2,
    kind: 'step',
    title: '首页总览（真实 Fineract 余额 = P0.3 种子口径）',
    nodes: [
      '问候语「你好，王 P.」（网关脱敏 displayName，clientId 28）',
      '活期总余额 ¥10,029.82；账户 0000**0011 ¥9,729.82 / 0000**0012 ¥300.00',
      '独立核对（curl 网关 /me/accounts）：账户 [11, 12]，余额 [9729.82, 300.0] —— UI = API 一致',
    ],
    snapshot: 'p3-02.yaml',
    shot: 'web-02-home.png',
  },
  {
    no: 3,
    kind: 'step',
    title: '转账 100（默认转出 11 → 转入 12）',
    nodes: [
      '本人转账表单：转出 0011（¥9,729.82）→ 转入 0012（¥300.00）',
      '金额 100，附言 P3E2E-084537（时间戳唯一标记）',
    ],
    snapshot: 'p3-03.yaml',
    shot: 'web-03-transfer.png',
  },
  {
    no: 4,
    kind: 'step',
    title: '提交成功（网关聚合幂等 + 补偿）',
    nodes: [
      '成功对话框：流水号 1026，转出账户新余额 ¥9,629.82',
      '余额核算：9,729.82 − 100 = 9,629.82 ✓',
    ],
    snapshot: 'p3-04.yaml',
    shot: 'web-04-transfer-success.png',
  },
  {
    no: 5,
    kind: 'step',
    title: '明细出现新流水（runningBalance 变化）',
    nodes: [
      '明细首行：网关转账 abnk-hnzh9zcstk-x74gpay0：P3E2E-084537 · 支取 -¥100.00 · 余额 ¥9,629.82',
      '历史流水同页可见（P2.4/P2.7 测试转账、每日 Interest posting）——真实 Fineract 数据',
    ],
    snapshot: 'p3-05.yaml',
    shot: 'web-05-transactions.png',
  },
  {
    no: 6,
    kind: 'check',
    title: '余额核对（Fineract 侧独立核对）',
    nodes: [
      '账户 11 交易计数 75 → 76（+1 ✓）；账户 12 计数 3 → 4（+1 ✓）',
      '账户 12 最新交易 id=1027，Deposit ¥100.00，runningBalance ¥400.00，note 与 UI 附言一致',
      '断言行：UI 明细首条与 Fineract 最新交易逐字段一致（金额 / runningBalance / 附言 / 幂等后缀）',
    ],
    snapshot: 'p3-chk.yaml',
  },
];

/** 一次载体复验（iOS / Android——结果行 + 截图清单）。 */
/** One carrier re-verification (iOS / Android — result line plus screenshot list). */
export interface CarrierRun {
  id: string;
  label: string;
  result: string;
  shots: string[];
}

/** 三载体复验（web 为主线已入五步序列；此处 iOS/Android）。 */
/** Multi-carrier re-verification (web is the mainline above; iOS and Android here). */
export const CARRIERS: CarrierRun[] = [
  {
    id: 'ios',
    label: 'iOS 复验（iPhone 16 Pro 模拟器，flutter drive）',
    result: 'All tests passed.（两轮：流水号 1028 / 1030，均转账 100 成功 + 明细新流水断言 PASS）',
    shots: [
      'ios-01-login.png',
      'ios-02-home.png',
      'ios-03-transfer.png',
      'ios-04-transactions.png',
    ],
  },
  {
    id: 'android',
    label: 'Android 复验（abnk_api36 模拟器，flutter drive）',
    result: 'All tests passed.（流水号 1032，转账 100 成功 + 明细新流水断言 PASS）',
    shots: [
      'android-01-login.png',
      'android-02-home.png',
      'android-03-transfer.png',
      'android-04-transfer-success.png',
      'android-05-transactions.png',
    ],
  },
];

/** Fineract 计数链（账户 11 交易计数全程核对，源报告原文口径）。 */
/** The Fineract counter chain (account 11 transaction totals, from the report). */
export const COUNTER_CHAIN =
  '75（基线）→ 76（web，流水 1026）→ 77（iOS 轮 1，流水 1028）→ 78（iOS 轮 2，流水 1030）→ 79（Android，流水 1032）——每轮 +1 精确对应，无重复无遗漏';

/** 当时的问题记录（V3.5.2 诚实性判据——原样展示，不美化）。 */
/** The problem records of the time (the V3.5.2 honesty criterion — shown as-is, never polished). */
export const PROBLEM_RECORDS: { title: string; detail: string }[] = [
  {
    title: 'p3-login.yaml：a11y 树未开启时的原始快照',
    detail: '走查起点先落了一份 a11y 树尚未开启的快照——整棵语义树只有一行「Enable accessibility」按钮。按原样展示，不删除不补拍。',
  },
  {
    title: '指纹登录与安全键盘为视觉占位（POC 范围外）',
    detail: '登录页快照原文备注：视觉占位组件如实存在于 UI（p3-01.yaml 节点「指纹登录（视觉占位）」与「指纹登录与安全键盘为视觉占位（POC 范围外）」）。',
  },
  {
    title: '接线过程修复的三处链路缺口（走查中发现）',
    detail: '① dio 请求 URL 路径被吞进 fragment（Uri.replace 序列化 #? 尾巴）→ 改 Uri(scheme:host:port) 构造 origin；② CORS preflight 全部失败（网关本地 @RestController 不在 SCG globalcors 覆盖内，OPTIONS 被过滤器拦成 401/404）→ 新增 CorsConfig + 过滤器对 OPTIONS 直通；③ 登录 401 invalid_credentials（gateway_users.json 与本地栈种子 clientId 不匹配）→ 生成 local-prodform 口令映射（明文只在 .github-private）。',
  },
  {
    title: '走查过程环境坑位（归档备忘 3 条）',
    detail: '① Android 构建期 Repository Google is disabled（瞬时网络失败后 Gradle 禁用仓库，--stop 清 daemon 重跑即过）；② driver unusually long time to connect + app 卡启动页（此前 adb kill-server 弄坏转发链路，冷启动模拟器恢复）；③ integration_test 内嵌 takeScreenshot 挂起（request_data 超时）→ 三载体截图统一改外部通道（playwright / simctl / adb screencap），integration_test 只承担断言。',
  },
];

/** 概要信息行（载体 / 链路 / 数据——源报告头部口径）。 */
/** Summary info lines (carrier / chain / data — from the report header). */
export const JOURNEY_META: { carrier: string; chain: string; data: string } = {
  carrier: 'Flutter web（:6280）· 390×844 · playwright 语义树驱动',
  chain: 'web 载体 :6280 → ABNK 网关 :8080（bootRun）→ 生产形态 Fineract 栈 :8081 + abnk-pg-prod :5433',
  data: 'P0.3 local-prodform 种子（alice = clientId 28，活期账户 11/12）· 演示口令经 .github-private 注入走查，不落证据',
};
