#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to serve the static site for regression tests." >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run the pinned Playwright Test package." >&2
  exit 1
fi

PLAYWRIGHT_TEST_VERSION="${PLAYWRIGHT_TEST_VERSION:-1.61.1}"
export PLAYWRIGHT_HTML_OPEN="${PLAYWRIGHT_HTML_OPEN:-never}"

RUNNER_DIR=".test-results/runner"
RUNNER_BIN="${RUNNER_DIR}/node_modules/.bin/playwright"
RUNNER_NODE_MODULES="${RUNNER_DIR}/node_modules"

cleanup() {
  if [[ -L node_modules ]] && [[ "$(readlink node_modules)" == "${RUNNER_NODE_MODULES}" ]]; then
    rm node_modules
  fi
}

trap cleanup EXIT

mkdir -p "${RUNNER_DIR}"

if [[ ! -x "${RUNNER_BIN}" ]]; then
  npm install \
    --prefix "${RUNNER_DIR}" \
    --package-lock=false \
    --no-save \
    --no-audit \
    --no-fund \
    "@playwright/test@${PLAYWRIGHT_TEST_VERSION}"
fi

if [[ -L node_modules ]]; then
  rm node_modules
elif [[ -e node_modules ]]; then
  echo "A local node_modules path already exists. Move it aside before running tests." >&2
  exit 1
fi

ln -s "${RUNNER_NODE_MODULES}" node_modules

if [[ "${PLAYWRIGHT_INSTALL_BROWSERS:-auto}" != "skip" ]]; then
  "${RUNNER_BIN}" install chromium
fi

"${RUNNER_BIN}" test --config tests/playwright.config.mjs "$@"
