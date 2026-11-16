#!/usr/bin/env bash
# sync-data.sh — abnk-devportal 的只读数据复制脚本（Sprint v0.0.1 Part04 任务 1.2）。
#
# 定位（Plan 决策 D4「提取入库、构建纯复制」）：portal 构建对 abnk-asdm 零提取
# 逻辑——本脚本只做 checkout 两仓之间的只读复制（index 产出物原样 + md 全文 +
# 证据素材 + 规划文档），任何机器按 README 并排 clone 两仓后跑一次即可复现
# src/data/，vite build 直接消费。
#
# 复制映射（源 → 目标，均相对本仓根）：
#   ../.asdm/workspace/index                        → src/data/index/
#   ../.asdm/workspace/docs/Sprints                 → src/data/sprints/
#   ../.asdm/workspace/docs/planning/abnk-design    → src/data/planning/abnk-design/
#   ../.asdm/workspace/docs/portal-content          → src/data/portal-content/
#     （Part04 任务 2.3 首次扩面——portal-content 分区自本任务起进入数据集口径）
#
# 只读性证明：脚本在复制前后各取一次源仓 git status --porcelain 并比对，
# 不一致即退出码 2（portal 对 abnk-asdm 纯只读，任何源侧残留变更都会被拦截）。
#
# 双侧 git 纪律（已知坑 2，与本仓 .gitignore 互锁）：
#   - 源仓：workspace/index 产出物入库（git history 即审计记录）；
#   - 本仓：src/data/ 拷贝产物不入库（构建时生成，.gitignore 已写死）。
#
# 用法：
#   bash scripts/sync-data.sh           # 复制 + 只读性证明
#   bash scripts/sync-data.sh --check   # 干跑：输出复制清单（rsync --dry-run --itemize），不落盘
#
# 退出码：0 = 同步成功且只读性成立；1 = 源缺失/参数错误；2 = 只读性被破坏。
#
# sync-data.sh — read-only data sync for abnk-devportal (Part04 task 1.2).
# Per plan decision D4 ("extraction committed, build is pure copy") the portal
# performs zero extraction at build time: this script only copies read-only
# between the two checked-out repos, fully reproducible on any machine.
# Mapping: workspace/{index → src/data/index, docs/Sprints → src/data/sprints,
# docs/planning/abnk-design → src/data/planning/abnk-design,
# docs/portal-content → src/data/portal-content}.
# Read-only proof: git status of the source repo is captured before and after
# the copy; any drift fails with exit code 2.
# Usage: run plain for sync + proof, or with --check for a dry-run listing.
# Exit codes: 0 ok; 1 missing source / bad usage; 2 read-only violation.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ASDM="$PORTAL_ROOT/../.asdm"
SRC_INDEX="$ASDM/workspace/index"
SRC_SPRINTS="$ASDM/workspace/docs/Sprints"
SRC_PLANNING="$ASDM/workspace/docs/planning/abnk-design"
SRC_PORTAL_CONTENT="$ASDM/workspace/docs/portal-content"
DEST="$PORTAL_ROOT/src/data"

MODE="sync"
if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
elif [[ $# -gt 0 ]]; then
  echo "用法: bash scripts/sync-data.sh [--check]" >&2
  exit 1
fi

# 源就绪检查（fail-loud：源仓未按 README 并排 clone 时给出可执行的指引）。
# Source readiness check (fail-loud with actionable guidance when the sibling
# abnk-asdm clone is missing).
for src in "$SRC_INDEX" "$SRC_SPRINTS" "$SRC_PLANNING" "$SRC_PORTAL_CONTENT"; do
  if [[ ! -d "$src" ]]; then
    echo "ERROR: 源目录缺失: $src（abnk-asdm 须与本仓并排 clone，见 README「前置条件」）" >&2
    exit 1
  fi
done

# 源侧 git 纪律：只读性基线（含未提交工作区变更在内的完整 porcelain）。
# Source-side read-only baseline: full porcelain output, committed or not.
baseline="$(git -C "$ASDM" status --porcelain 2>/dev/null || true)"

# 复制矩阵：src → dest 子路径（rsync -a 保元数据；--delete 保证产物与源零漂移）。
# Copy matrix: src → dest subpaths (rsync -a preserves metadata; --delete
# keeps the sync products exactly aligned with the source).
MAPPING=(
  "$SRC_INDEX|index"
  "$SRC_SPRINTS|sprints"
  "$SRC_PLANNING|planning/abnk-design"
  "$SRC_PORTAL_CONTENT|portal-content"
)

copy_count=0
for pair in "${MAPPING[@]}"; do
  src="${pair%%|*}"
  sub="${pair##*|}"
  dst="$DEST/$sub"
  if [[ "$MODE" == "check" ]]; then
    echo "[check] 将同步: $src → $dst"
    rsync -a --delete --dry-run --itemize --exclude .DS_Store "$src/" "$dst/" | sed 's/^/[check]   /'
  else
    mkdir -p "$dst"
    rsync -a --delete --exclude .DS_Store "$src/" "$dst/"
  fi
  copy_count=$((copy_count + 1))
done

if [[ "$MODE" == "check" ]]; then
  echo "[check] 干跑完成：$copy_count 个映射，未落盘（运行不带参数执行真实同步）"
  exit 0
fi

# 复制后的只读性证明：源仓 porcelain 必须与基线逐字节一致。
# Read-only proof: the source repo porcelain must be byte-identical to the baseline.
after="$(git -C "$ASDM" status --porcelain 2>/dev/null || true)"
if [[ "$baseline" != "$after" ]]; then
  echo "ERROR: 只读性被破坏——源仓在同步期间出现新变更：" >&2
  diff <(echo "$baseline") <(echo "$after") >&2 || true
  exit 2
fi

echo "sync OK: 4 个映射已复制到 src/data/（index/sprints/planning/abnk-design/portal-content），源仓只读性成立（porcelain 前后一致）"
