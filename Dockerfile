# ABNK Dev Portal — ASDM 过程资产渲染门户（Vite React SPA，纯静态直供）
#
# 多阶段自含构建：builder 阶段 apk 基础工具 + npm ci + 数据同步 + vite build，
# 产物阶段 nginx 托管 dist。构建上下文形态（Part04 任务 4.1 执行时定，
# 与 4.4 发布手册同口径）：
#   cd abnk-devportal && docker build -t abnk-devportal:local \
#     --build-context asdm=../.asdm \
#     --build-context tokens=../abnk-system/channels/shared .
# —— context 仍为本仓（`.`），两个数据源以 BuildKit 附加上下文注入：
#   asdm = abnk-asdm 仓（四个数据分区）：容器内重建「并排两仓」布局（/workspace/.asdm 与 /workspace/abnk-devportal），
#   sync-data.sh 按 ../.asdm 相对寻址原样运行：构建对数据源零提取逻辑，
#   与宿主机未提交状态解耦（D4「提取入库、构建纯复制」的容器化延续）。
#   容器内 .asdm 随附加上下文携带 .git（builder 已装 git）——sync 的只读性
#   证明与数据新鲜度锚点（index 最后 commit）在容器内真实运行，非降级形态。
#   tokens = abnk-system/channels/shared（design-tokens.json 单一事实源，
#   tailwind.config.js 经 ../abnk-system 相对寻址 + fail-loud 消费）——
#   context 根收敛到 shared 子目录（92K），不传输整个 abnk-system 仓。
# TLS 证书不入镜像——公网 TLS 终止在 abnk-nginx 入口容器（dev 子域反代形态，
#   website 先例第四次适用）。
#
# ABNK Dev Portal — ASDM process-asset rendering portal (Vite React SPA, static).
# Multi-stage self-contained build: builder stage installs apk base tools, runs
# npm ci + data sync + vite build; the runtime stage serves dist via nginx.
# Context form (decided during task 4.1, mirrored in the 4.4 release playbook):
# the build context stays this repo (`.`) while two data sources are injected
# as BuildKit additional contexts: asdm (the four abnk-asdm data partitions,
# laid out side-by-side so sync-data.sh runs unchanged — zero extraction logic
# against the source, decoupled from host working-tree state, D4 containerized;
# inside the image .asdm carries .git via the additional context and git is
# installed in the builder, so both the sync script's read-only proof and the
# data-as-of anchor (the index's last commit) run for real in-container) and
# tokens (abnk-system/channels/shared, the design-tokens single source of truth
# that tailwind.config.js consumes fail-loud via the ../abnk-system relative
# path — the context root narrows to the shared subdir, avoiding the transfer
# of the whole abnk-system repo). No TLS material in the image — public TLS terminates at the abnk-nginx entry.

# ---------- builder ----------
# multi-arch：builder 钉构建机架构（vite build 产物为静态文件，架构无关）
# multi-arch: builder pinned to the build host platform (static output is arch-agnostic)
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /workspace/abnk-devportal

# sync-data.sh 依赖 bash + rsync + git（alpine 基础镜像默认不含；git 供 sync 的
# 只读性证明与数据新鲜度锚点捕获——.asdm 附加上下文携带 .git）
# sync-data.sh needs bash + rsync + git (absent from the alpine base image by
# default; git serves the sync read-only proof and the data-as-of anchor
# capture — the .asdm additional context carries .git)
RUN apk add --no-cache bash rsync git

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 本仓代码（.dockerignore 排除 node_modules/dist/src-data/evidence——
# 数据唯一来源是下方附加上下文同步，保证镜像确定性）
# This repo only (.dockerignore excludes node_modules/dist/synced data —
# the single data path is the additional-context sync below, for determinism)
COPY . .

# abnk-asdm 四个数据分区注入 /workspace/.asdm（附加上下文 asdm=../.asdm）
# abnk-asdm's four data partitions injected under /workspace/.asdm
COPY --from=asdm /workspace/index                        /workspace/.asdm/workspace/index
COPY --from=asdm /workspace/docs/Sprints                /workspace/.asdm/workspace/docs/Sprints
COPY --from=asdm /workspace/docs/planning/abnk-design   /workspace/.asdm/workspace/docs/planning/abnk-design
COPY --from=asdm /workspace/docs/portal-content         /workspace/.asdm/workspace/docs/portal-content

# .git 显式注入（Part04 任务 4.4）：sync 的数据新鲜度锚点（workspace/index 最后
# commit）与只读性证明依赖 git 仓历史——附加上下文整体传输本就含 .git（52MB），
# 此处仅补一层拷贝；builder-only，不进最终镜像。⚠️ 坑：分区选择性 COPY 不会
# 自动带上 .git，0.1.2 首建即踩此坑（git log 静默失败 → 锚点缺失 → vite import
# ENOENT）。
# .git explicitly injected (Part04 task 4.4): the sync data-as-of anchor (the
# index's last commit) and the read-only proof need the git history — the
# additional context transfer already carries .git (52MB); this only adds one
# layer copy. Builder-only, never entering the final image. ⚠️ Pitfall: the
# partition-selective COPYs above do NOT bring .git along — the first 0.1.2
# build hit exactly this (silent git log failure → missing anchor → vite
# import ENOENT).
COPY --from=asdm /.git /workspace/.asdm/.git

# design tokens 注入 /workspace/abnk-system/channels/shared（附加上下文
# tokens=../abnk-system/channels/shared，tailwind.config.js fail-loud 消费）
# Design tokens injected under /workspace/abnk-system/channels/shared
COPY --from=tokens /design-tokens.json /workspace/abnk-system/channels/shared/design-tokens.json

# 数据同步（index/sprints/planning/portal-content → src/data + 证据四桶 →
# public/evidence）后构建——与宿主机发布链同一条 npm run sync && npm run build
# Data sync (partitions → src/data + evidence buckets → public/evidence)
# followed by the build — the same chain the host-side release flow runs
RUN npm run sync && npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine
COPY --from=build /workspace/abnk-devportal/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
