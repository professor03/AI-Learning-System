#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${CODESPACE_NAME:-}" ]]; then
  echo "Run this inside your GitHub Codespace." >&2
  exit 1
fi
curl --fail --silent http://127.0.0.1:8787/api/health
echo
curl --fail --silent http://127.0.0.1:8787/vision/health
echo
gh codespace ports visibility 8787:public --codespace "$CODESPACE_NAME"
echo "Public demo: https://${CODESPACE_NAME}-8787.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}/learnsight"
echo "Public means anyone with the link can use the bounded demo. Restart resets port privacy."
