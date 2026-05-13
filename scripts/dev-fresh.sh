#!/usr/bin/env bash
# Free common Next.js ports (stale dev servers cause slow or broken startups), then clean cache.
set -e
for p in 3000 3001 3002; do
  pids=$(lsof -ti ":$p" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
done
rm -rf .next
exec npx next dev
