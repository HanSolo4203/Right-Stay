#!/usr/bin/env bash
# Start dev with an isolated cache (outside iCloud Documents) and webpack (stable manifests).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/next-env.sh
source "$ROOT/scripts/next-env.sh"
LOCKFILE="$ROOT/.next-dev.lock"

next_env_stop_dev "$ROOT"
# Drop stale dist from old Turbopack/dev runs in the project .next folder.
if [ -d "$ROOT/.next/static/development" ]; then
  echo "Removing stale .next/static/development ..."
  rm -rf "$ROOT/.next/static/development"
fi

cleanup() {
  rm -f "$LOCKFILE"
}
trap cleanup EXIT INT TERM

echo "Starting dev server at http://localhost:3000 ..."
echo "$$" > "$LOCKFILE"
# Webpack default — Turbopack manifest writes race on iCloud-synced folders (ENOENT on .tmp files).
next_env_run_dev "$ROOT"
