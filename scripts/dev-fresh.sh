#!/usr/bin/env bash
# Stop all dev servers, clear caches, start a single clean instance.
# Use when you see 404 on /_next/static/*, missing layout.css, or broken unstyled pages.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/next-env.sh
source "$ROOT/scripts/next-env.sh"
LOCKFILE="$ROOT/.next-dev.lock"

cleanup() {
  rm -f "$LOCKFILE"
}
trap cleanup EXIT INT TERM

next_env_stop_dev "$ROOT"
for p in 3000 3001 3002; do
  pids=$(lsof -ti ":$p" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping process on port $p..."
    kill -9 $pids 2>/dev/null || true
  fi
done
sleep 0.5

next_env_clear_production_next "$ROOT"
echo "Cleared .next and node_modules/.cache"
echo "Starting dev server at http://localhost:3000 ..."
echo "$$" > "$LOCKFILE"
if [ "${1:-}" = "--turbopack" ]; then
  echo "Warning: Turbopack can hit manifest ENOENT errors in iCloud-synced folders."
  next_env_run_dev "$ROOT" --turbopack
fi
next_env_run_dev "$ROOT"
