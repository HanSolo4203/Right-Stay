#!/usr/bin/env bash
# Stop dev servers and clear .next before production build.
# Dev (Turbopack) and `next build` both write to .next — running both causes ENOENT manifest errors.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/next-env.sh
source "$ROOT/scripts/next-env.sh"
cd "$ROOT"

next_env_stop_dev "$ROOT"
next_env_clear_dev_dist "$ROOT"
next_env_clear_production_next "$ROOT"

unset NEXT_DIST_DIR
npx next build
next_env_mark_production_build "$ROOT"
