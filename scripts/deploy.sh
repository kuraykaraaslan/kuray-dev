#!/usr/bin/env bash
#
# Deploy kuray.dev safely.
#
# Why this script exists:
#   `next start` (run by PM2) loads the build manifest into memory at boot.
#   Running `next build` while the old process keeps running deletes the old
#   chunk hashes from disk but the live process keeps serving HTML that points
#   at them — the browser then gets a 500 / text-plain for a missing chunk
#   (ChunkLoadError). The cure is to ALWAYS restart PM2 after a build.
#
# Usage:  bash scripts/deploy.sh
#
set -euo pipefail

APP_NAME="kuray-dev"
cd "$(dirname "$0")/.."   # repo root

echo "▶ Pulling latest…"
git pull --ff-only

# Reinstall deps only when the lockfile actually changed (cheap fast-path).
if ! git diff --quiet HEAD@{1} HEAD -- package-lock.json 2>/dev/null; then
  echo "▶ Lockfile changed — running npm ci…"
  npm ci
else
  echo "▶ Lockfile unchanged — skipping npm ci."
fi

echo "▶ Generating Prisma client…"
npm run generate

echo "▶ Building…"
npm run build

# A failed/old image optimization is cached on disk and keeps returning 400.
echo "▶ Clearing image optimizer cache…"
rm -rf .next/cache/images

echo "▶ Restarting PM2 (loads the new build manifest)…"
# `restart` re-reads the new .next; --update-env picks up any .env changes.
pm2 restart "$APP_NAME" --update-env

echo "✓ Deploy complete."
