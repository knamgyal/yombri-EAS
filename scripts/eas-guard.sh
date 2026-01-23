#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-}"
if [[ -z "$PROFILE" ]]; then
  echo "Usage: ./scripts/eas-guard.sh <development|preview|production>"
  exit 1
fi

# Only enforce safety for preview/production
if [[ "$PROFILE" == "preview" || "$PROFILE" == "production" ]]; then
  # Block dirty working tree
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Refusing $PROFILE build: working tree has uncommitted changes."
    exit 1
  fi

  # Optional: enforce branch
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$PROFILE" == "production" && "$BRANCH" != "main" ]]; then
    echo "Refusing production build: must be on main (current: $BRANCH)."
    exit 1
  fi
fi
