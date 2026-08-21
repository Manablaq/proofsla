#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXPECTED_CONTRACT_SHA="7bc3b90343eacad03ec6db92fe64333f314a4bb75b85bd9a209ca1a3e1707075"
EXPECTED_REQUIREMENTS_SHA="c57433bd2ecb9862bf56b972382a3c6b01b00903497384c76d7cfe74a4853b0b"

echo "===== PYTHON ====="
command -v python
python --version
python -c "import sys; assert sys.version_info[:2] == (3, 12), sys.version"
echo "PASS Python 3.12"

echo
echo "===== PINNED DEPENDENCIES ====="
FREEZE="$(python -m pip freeze)"
printf "%s\n" "$FREEZE" | grep -Fx "genlayer-py @ git+https://github.com/genlayerlabs/genlayer-py@a3dc35e04898e3889cbfa855bcaf7d2664675b8f"
printf "%s\n" "$FREEZE" | grep -Fx "genlayer-test @ git+https://github.com/genlayerlabs/genlayer-testing-suite@9c09578b143905471fb0657dd53bdaf18da8e35f"
printf "%s\n" "$FREEZE" | grep -Fx "genvm-linter @ git+https://github.com/genlayerlabs/genvm-linter@fa4a4d4536b28fdc2730e13a983ba01b69ccc6f3"
printf "%s\n" "$FREEZE" | grep -Fx "pytest==8.4.2"
echo "PASS pinned dependencies"

echo
echo "===== SOURCE HASHES ====="
CONTRACT_SHA="$(shasum -a 256 contracts/proofsla.py | cut -d" " -f1)"
REQUIREMENTS_SHA="$(shasum -a 256 requirements-dev.txt | cut -d" " -f1)"
echo "$CONTRACT_SHA  contracts/proofsla.py"
echo "$REQUIREMENTS_SHA  requirements-dev.txt"
test "$CONTRACT_SHA" = "$EXPECTED_CONTRACT_SHA"
test "$REQUIREMENTS_SHA" = "$EXPECTED_REQUIREMENTS_SHA"
echo "PASS source hashes"

echo
echo "===== LINT + VALIDATION ====="
genvm-lint check contracts/proofsla.py

echo
echo "===== STRICT TYPECHECK ====="
set +e
TYPECHECK_OUTPUT="$(genvm-lint typecheck contracts/proofsla.py --strict 2>&1)"
TYPECHECK_STATUS=$?
set -e

printf '%s\n' "$TYPECHECK_OUTPUT"

if ! printf '%s\n' "$TYPECHECK_OUTPUT" | grep -Fx "0 error(s), 0 warning(s)" >/dev/null; then
    echo "FAIL strict typecheck did not report 0 errors and 0 warnings"
    exit 1
fi

if [ "$TYPECHECK_STATUS" -ne 0 ] && [ "$TYPECHECK_STATUS" -ne 1 ]; then
    echo "FAIL unexpected strict typecheck exit status: $TYPECHECK_STATUS"
    exit "$TYPECHECK_STATUS"
fi

if [ "$TYPECHECK_STATUS" -eq 1 ]; then
    echo "PASS strict typecheck: 0 errors, 0 warnings (pinned genvm-linter returned status 1)"
else
    echo "PASS strict typecheck: 0 errors, 0 warnings"
fi

echo
echo "===== FRESH SCHEMA ====="
rm -f abi.json
genvm-lint schema contracts/proofsla.py --output abi.json

echo
echo "===== ABI JSON VALIDATION ====="
python -m json.tool abi.json >/dev/null
echo "PASS abi.json is valid JSON"

echo
echo "===== DIRECT MODE TESTS ====="
TEST_OUTPUT="$(python -m pytest -q)"
printf "%s\n" "$TEST_OUTPUT"
printf "%s\n" "$TEST_OUTPUT" | grep -Eq "(^|[[:space:]])21 passed in "
echo "PASS exactly 21 Direct Mode tests"

echo
echo "===== DIFF CHECK ====="
git diff --check
git diff --cached --check
echo "PASS git diff checks"

echo
echo "===== CONTRACT HASH AFTER TESTS ====="
POST_TEST_CONTRACT_SHA="$(shasum -a 256 contracts/proofsla.py | cut -d" " -f1)"
echo "$POST_TEST_CONTRACT_SHA  contracts/proofsla.py"
test "$POST_TEST_CONTRACT_SHA" = "$EXPECTED_CONTRACT_SHA"
echo "PASS contract source unchanged"

echo
echo "===== WORKTREE ====="
git status -sb
