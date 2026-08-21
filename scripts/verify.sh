#!/usr/bin/env bash
set -euo pipefail

python3 --version
genvm-lint check contracts/proofsla.py
genvm-lint typecheck contracts/proofsla.py --strict
genvm-lint schema contracts/proofsla.py --output abi.json
python3 -m pytest -q

git diff --check 2>/dev/null || true
