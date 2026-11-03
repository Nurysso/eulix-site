#!/usr/bin/env bash
# Fetch docs/ (plus the files component versions are read from) from the eulix
# repo into .eulix-repo/, using a shallow sparse clone.
#
#   EULIX_REPO_URL  repo to clone      (default https://github.com/Nurysso/eulix.git)
#   EULIX_REF       branch or tag      (default main)
#   EULIX_REPO_DIR  target dir, relative to this project (default .eulix-repo)
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_URL="${EULIX_REPO_URL:-https://github.com/Nurysso/eulix.git}"
REF="${EULIX_REF:-main}"
DIR="${EULIX_REPO_DIR:-.eulix-repo}"

# Keep in sync with `version.file` entries in src/site.config.ts.
PATHS=(
  /docs/
  /eulix-cli/internal/utils/constansts.go
  /libeulix/Cargo.toml
  /eulix-parser/Cargo.toml
  /eulix-lsp/Cargo.toml
)

if [ -d "$DIR/.git" ]; then
  echo "Updating $DIR ($REF)"
  git -C "$DIR" sparse-checkout set --no-cone "${PATHS[@]}"
  git -C "$DIR" fetch --depth 1 origin "$REF"
  git -C "$DIR" checkout --force FETCH_HEAD
else
  echo "Cloning $REPO_URL ($REF) into $DIR"
  rm -rf "$DIR"
  git clone --depth 1 --filter=blob:none --sparse --branch "$REF" "$REPO_URL" "$DIR"
  git -C "$DIR" sparse-checkout set --no-cone "${PATHS[@]}"
fi

echo "Docs ready: $(find "$DIR/docs" -name '*.md' | wc -l) markdown files"
