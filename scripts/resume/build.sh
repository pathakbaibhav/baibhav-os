#!/usr/bin/env bash
# Prints scripts/resume/resume.html to public/resume.pdf with headless Chrome.
# Usage: npm run resume   (set CHROME=/path/to/chrome if it isn't in /Applications)
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
"$CHROME" --headless=new --disable-gpu --user-data-dir="$PROFILE" --no-pdf-header-footer \
  --print-to-pdf="public/resume.pdf" "file://$PWD/scripts/resume/resume.html" 2>/dev/null
pages=$(grep -ao "/Count [0-9]*" public/resume.pdf | head -1 | cut -d" " -f2)
echo "public/resume.pdf written ($(du -h public/resume.pdf | cut -f1), ${pages} page(s))"
