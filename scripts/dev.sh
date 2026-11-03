#!/usr/bin/env bash
# Local development: fetch the latest docs from the eulix repo, then run Astro.
#   scripts/dev.sh            # fetch + astro dev
#   scripts/dev.sh build      # fetch + production build (same as CI)
#   scripts/dev.sh preview    # fetch + build + preview
#   SKIP_FETCH=1 scripts/dev.sh   # use the existing .eulix-repo (offline)
set -euo pipefail
cd "$(dirname "$0")/.."

[ "${SKIP_FETCH:-0}" = 1 ] || scripts/fetch-docs.sh
[ -d node_modules ] || pnpm install

case "${1:-dev}" in
  dev)     exec pnpm exec astro dev ;;
  build)   exec pnpm exec astro build ;;
  preview) pnpm exec astro build && exec pnpm exec astro preview ;;
  *) echo "usage: $0 [dev|build|preview]" >&2; exit 1 ;;
esac
