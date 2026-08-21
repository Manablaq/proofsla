# ProofSLA

**Evidence-bound SLA settlement for AI/API service executions on GenLayer.**

ProofSLA lets a client lock GEN against a natural-language service-level agreement. A provider accepts the immutable terms and later submits two versioned evidence records for a specific AI/API service run. If the client disputes completion, the Intelligent Contract itself fetches the evidence, verifies SHA-256 digests, asks GenLayer validators to independently judge the run against the SLA, and deterministically allocates escrow from the consensus result.

## Why GenLayer is central

A normal deterministic contract cannot decide whether an AI/API run materially satisfied natural-language quality and scope requirements. A centralized LLM could decide, but both parties would have to trust one operator. In ProofSLA the consensus-critical judgment is executed and independently verified inside GenLayer.

## v1 differentiation

This is intentionally narrower than a generic escrow/court product:

- AI/API service executions only;
- mandatory primary + corroboration evidence;
- evidence pinned by SHA-256;
- freshness window;
- prompt-injection-resistant evidence framing;
- independent validator re-evaluation;
- deterministic basis-point settlement;
- persistent per-SLA state and pull-payment accounting.

## Repository

- `contracts/proofsla.py` — Intelligent Contract
- `tests/test_proofsla_direct.py` — Direct Mode consensus/security tests
- `docs/SPEC_V1.md` — frozen v1 behavior and reviewer evidence target
- `web/` — frontend comes after contract validation

## Development order

1. Python 3.12+ environment
2. `genvm-lint check contracts/proofsla.py`
3. `genvm-lint typecheck contracts/proofsla.py --strict`
4. `genvm-lint schema contracts/proofsla.py --output abi.json`
5. `pytest -q`
6. Hosted GenLayer Studio integration testing
7. Bradbury deployment only after all earlier gates pass
8. Frontend wired to the real deployed contract

We intentionally do **not** deploy before the contract and Direct Mode tests are clean.

## Dependency install

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install genvm-linter genlayer-test
```

## Current phase

Phase 1 scaffold. The source and tests still need to be run against the actual GenLayer SDK/testing-suite version in the development environment. No claim is made yet that the contract has passed lint/type/schema/runtime validation.
