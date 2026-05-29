#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/next-env.sh
source "$ROOT/scripts/next-env.sh"
cd "$ROOT"

export NEXT_DIST_DIR
NEXT_DIST_DIR="$(next_env_production_dist_dir "$ROOT")"
exec npx next start "$@"
