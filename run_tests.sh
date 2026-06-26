#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
mkdir -p "$ROOT_DIR/.tmp/test_dbs"
export TMPDIR="$ROOT_DIR/.tmp"

pass_count=0
fail_count=0

run_step() {
  local name="$1"
  shift
  echo "==> ${name}"
  if "$@"; then
    echo "PASS: ${name}"
    pass_count=$((pass_count + 1))
  else
    echo "FAIL: ${name}"
    fail_count=$((fail_count + 1))
  fi
}

python_cmd="python3"
if ! command -v python3 >/dev/null 2>&1; then
  python_cmd="python"
fi

run_backend_tests() {
  "$python_cmd" -m venv .venv
  # shellcheck disable=SC1091
  source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate
  python -m pip install --upgrade pip
  python -m pip install -r backend/requirements.txt
  PYTHONPATH=backend pytest unit_tests/backend API_tests -q
}

run_frontend_tests() {
  cd frontend
  npm install
  npm test
  npm run build
}

run_step "Backend unit and API tests" run_backend_tests
run_step "Frontend unit tests and build" run_frontend_tests

echo "==> Test Summary"
echo "Passed groups: ${pass_count}"
echo "Failed groups: ${fail_count}"

if [ "$fail_count" -ne 0 ]; then
  exit 1
fi
