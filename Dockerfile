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
#   容器内 .asdm 为目录快照而非 git 仓——sync 的只读性证明退化为平凡成立
#   （git -C 失败静默跳过），真实只读性由宿主侧执行同一脚本时验证。
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
# inside the image .asdm is a directory snapshot so the sync script's read-only
# proof degrades to trivially true — the real proof runs on the host) and
# tokens (abnk-system/channels/shared, the design-tokens single source of truth
# that tailwind.config.js consumes fail-loud via the ../abnk-system relative
# path — the context root narrows to the shared subdir, avoiding the transfer
# of the whole abnk-system repo). No TLS material in the image — public TLS terminates at the abnk-nginx entry.

# ---------- builder ----------
# multi-arch：builder 钉构建机架构（vite build 产物为静态文件，架构无关）
# multi-arch: builder pinned to the build host platform (static output is arch-agnostic)
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /workspace/abnk-devportal

# sync-data.sh 依赖 bash + rsync（alpine 基础镜像默认不含二者）
# sync-data.sh needs bash + rsync (absent from the alpine base image by default)
RUN apk add --no-cache bash rsync

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
