# ABNK Dev Portal

> **ABNK Dev Portal** — Amazing Bank 软件工程过程资产的对外展示窗口。
>
> **ABNK Dev Portal** — the public showcase of Amazing Bank's software-engineering process assets.

## 定位（纯渲染器，D7 约束）

本仓**不生产内容**：展示素材全部来自 [abnk-asdm](https://github.com/amazingbank/abnk-asdm) 仓的结构化过程资产（Plan/Phase/Results 文档全文、front-matter 索引、metrics 指标、证据素材），经只读复制后在构建期渲染为静态站点。用户互动、注册、统计等运营功能不属于本仓（ADR-010 边界 2，归官网域）——portal 只做内容渲染，不长运营功能。

This repo **produces no content**: everything displayed is copied read-only from the [abnk-asdm](https://github.com/amazingbank/abnk-asdm) repository's structured process assets (full Plan/Phase/Results documents, the front-matter index, metrics, evidence artifacts) and rendered at build time. Community features do not belong here (ADR-010 boundary 2) — this portal renders, it does not operate.

- 技术形态：React + Vite + TypeScript + Tailwind（build-time 静态，零后端 API）
- 数据链（Plan 决策 D4「提取入库、构建纯复制」）：`abnk-asdm` 生成器提取入库 → 本仓 `scripts/sync-data.sh` 只读复制 → `vite build` 渲染

## 前置条件（两仓并排 clone）

sync 脚本以相对路径 `../.asdm/workspace/...` 取数，因此 **abnk-asdm 必须与本仓在同一父目录下并排 clone**（与本工作区 `amazingbank-ws` 的布局一致）：

The sync script reads via the relative path `../.asdm/workspace/...`, so **abnk-asdm must be cloned as a sibling of this repo** (matching the `amazingbank-ws` workspace layout):

```
<your-workspace>/
├── abnk-devportal/     # 本仓（renderer）
└── .asdm/              # abnk-asdm 仓（数据源，目录名即仓工作根）
```

另需 design tokens 单一事实源 `../abnk-system/channels/shared/design-tokens.json`（`ABNK_DEVPORTAL_TOKENS` 可覆盖路径）；缺文件时构建 fail-loud 退出。

## 构建复现（任何机器）

```bash
npm install
npm run sync        # 只读复制 abnk-asdm 资产到 src/data/（附只读性证明）
npm run typecheck
npm run lint
npm run build
npm run preview     # 本地预览（:6204，dev 为 :6203，strictPort）
```

`src/data/` 是同步产物，**不入库**（见 `.gitignore`）；数据纪律与源仓相反——abnk-asdm 的 `workspace/index/` 产出物入库（git history 即数据可信度审计记录），本仓的拷贝产物构建时再生成。

## 目录结构

```
scripts/sync-data.sh   # 只读复制 + --check 干跑清单 + 只读性证明（exit 2 拦截）
src/data/schema.ts     # 消费契约：index/metrics 的 TS 类型（satisfies 编译期校验）
src/data/sample.check.ts  # 契约互证样例（随 src/data/ 不入库）
src/i18n/              # 双语机制（同构复刻 abnk-website，D3：内容 zh 全量 + en 增量）
src/components/        # Nav/Footer 骨架（八板块页面随 Phase 3 落位）
```

## 数据契约

`src/data/schema.ts` 定义 `SprintIndex`（sprint-v0.0.1.yaml 转换形态）与 `Metrics`（metrics-v0.0.1.json）的全部类型；供给侧是 abnk-asdm 的 `scripts/gen-sprint-index.py`——两侧是同一形态的两个表述，演进必须双侧同步改。

## 状态

Sprint v0.0.1 · Part 04 进行中（工程骨架与数据消费契约，任务 1.2）。本仓自身的交付过程也按 ASDM 规范书写并展示（递归叙事）。
