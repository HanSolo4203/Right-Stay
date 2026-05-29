#!/usr/bin/env bash
# Stop dev servers and clear .next before production build.
# Dev (Turbopack) and `next build` both write to .next — running both causes ENOENT manifest errors.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/next-env.sh
source "$ROOT/scripts/next-env.sh"
cd "$ROOT"

# Vercel/CI: plain next build — output must land in .next for routes-manifest.json.
if [ -n "${VERCEL:-}" ] || [ -n "${CI:-}" ]; then
  unset NEXT_DIST_DIR
  rm -rf "$ROOT/.next" "$ROOT/node_modules/.cache"
  exec npx next build
fi

next_env_stop_dev "$ROOT"
next_env_clear_dev_dist "$ROOT"
next_env_clear_production_next "$ROOT"

unset NEXT_DIST_DIR
PROD_DIST="$(next_env_production_dist_dir "$ROOT")"
next_env_exclude_from_icloud "$PROD_DIST"
export NEXT_DIST_DIR="$PROD_DIST"
echo "Production build output: $NEXT_DIST_DIR"
npx next build
next_env_mark_production_build "$ROOT"
