#!/usr/bin/env bash
# Shared helpers for dev/build scripts (source from other scripts, do not execute directly).
set -euo pipefail

next_env_root() {
  echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
}

# Separate from production `.next` so dev/build never race on manifests.
next_env_dev_dist_dir() {
  local root="${1:-}"
  if [ -z "$root" ]; then
    root="$(next_env_root)"
  fi
  echo "${NEXT_DIST_DIR:-$root/.next-dev}"
}

next_env_exclude_dev_dist_from_icloud() {
  local dev_dist="$1"
  mkdir -p "$dev_dist"
  # Prevent iCloud from syncing/evicting manifest .tmp files (common cause of ENOENT in ~/Documents).
  if [ "$(uname -s)" = "Darwin" ]; then
    xattr -w com.apple.fileprovider.ignore#P 1 "$dev_dist" 2>/dev/null || true
  fi
}

next_env_stop_dev() {
  local root="$1"
  local lockfile="$root/.next-dev.lock"
  local dev_dist
  dev_dist="$(next_env_dev_dist_dir "$root")"

  if [ -f "$lockfile" ]; then
    local old_pid
    old_pid=$(cat "$lockfile" 2>/dev/null || true)
    if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
      echo "Stopping dev server (PID $old_pid)..."
      kill -9 "$old_pid" 2>/dev/null || true
      sleep 0.5
    fi
    rm -f "$lockfile"
  fi

  pkill -f "$root/node_modules/.bin/next dev" 2>/dev/null || true
  pkill -f "next dev.*$root" 2>/dev/null || true
  pkill -f "$root/.next/postcss.js" 2>/dev/null || true
  pkill -f "$dev_dist/postcss.js" 2>/dev/null || true
}

next_env_is_production_next() {
  local root="$1"
  [ -f "$root/.next/.production-build" ] || [ -f "$root/.next/BUILD_ID" ]
}

next_env_is_mixed_next() {
  local root="$1"
  [ -f "$root/.next/BUILD_ID" ] && [ -d "$root/.next/static/development" ]
}

next_env_clear_production_next() {
  local root="$1"
  rm -rf "$root/.next" "$root/node_modules/.cache"
}

next_env_clear_dev_dist() {
  local root="$1"
  rm -rf "$(next_env_dev_dist_dir "$root")"
}

next_env_mark_production_build() {
  local root="$1"
  mkdir -p "$root/.next"
  echo "production" > "$root/.next/.production-build"
}

next_env_run_dev() {
  local root="$1"
  shift
  export NEXT_DIST_DIR
  NEXT_DIST_DIR="$(next_env_dev_dist_dir "$root")"
  cd "$root"
  next_env_exclude_dev_dist_from_icloud "$NEXT_DIST_DIR"
  next_env_clear_dev_dist "$root"
  echo "Dev cache: $NEXT_DIST_DIR"
  exec npx next dev "$@"
}
