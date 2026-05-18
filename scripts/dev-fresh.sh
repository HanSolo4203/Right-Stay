#!/usr/bin/env bash
# Stop all dev servers for this project, clear caches, start a single clean instance.
# Use when you see 404 on /_next/static/*, missing layout.css, or broken unstyled pages.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOCKFILE="$ROOT/.next-dev.lock"

cleanup() {
  rm -f "$LOCKFILE"
}
trap cleanup EXIT INT TERM

if [ -f "$LOCKFILE" ]; then
  old_pid=$(cat "$LOCKFILE" 2>/dev/null || true)
  if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
    echo "Stopping existing dev server (PID $old_pid)..."
    kill -9 "$old_pid" 2>/dev/null || true
    sleep 0.5
  fi
  rm -f "$LOCKFILE"
fi

# Kill any stray Next.js dev processes for this repo
pkill -f "$ROOT/node_modules/.bin/next dev" 2>/dev/null || true
pkill -f "next dev.*$ROOT" 2>/dev/null || true
for p in 3000 3001 3002; do
  pids=$(lsof -ti ":$p" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping process on port $p..."
    kill -9 $pids 2>/dev/null || true
  fi
done
sleep 0.5

rm -rf .next node_modules/.cache
echo "Cleared .next and node_modules/.cache"
echo "Starting dev server at http://localhost:3000 ..."
echo "$$" > "$LOCKFILE"
exec npx next dev --turbopack
