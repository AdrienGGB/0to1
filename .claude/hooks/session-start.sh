#!/usr/bin/env bash
# Installs dependencies at the start of a cloud (remote) session so lint, typecheck and tests
# can run right away. Does nothing locally, or while the app is not initialised yet.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ ! -f package.json ]; then
  exit 0
fi

if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi
