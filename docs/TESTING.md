# ProofSLA Testing and Verification

ProofSLA separates offline/reproducible verification from live Bradbury
evidence. A passing local suite is not described as proof of a live network
transaction, and an `ACCEPTED` transaction is not described as finalized unless
finality was observed.

## Result terminology

Use these labels consistently:

- **PASS** — the requested gate was executed and its expected evidence was
  observed.
- **FAIL** — the gate executed and produced a failing result.
- **NOT RUN** — the gate did not execute, including setup/tooling failures.

## Contract gate

Canonical command:

```bash
./scripts/verify.sh
```

The verified gate covers:

- Python 3.12 environment;
- pinned GenLayer packages;
- source hashing;
- lint;
- semantic validation;
- strict typecheck;
- schema generation;
- ABI JSON validation;
- Direct Mode tests;
- diff/hash checks after execution.

Current verified Direct Mode result: **21 / 21 passed**.

### Pinned linter nuance

The pinned `genvm-linter` build used by this repository prints:

```text
0 error(s), 0 warning(s)
```

for strict typecheck but returns process exit status `1`.

The verification script accepts only the observed version-specific `0/1` status
while requiring the exact zero-error/zero-warning summary. It does not use a
generic `|| true`.

## Frontend gate

From `web/`:

```bash
npm ci
npm run lint
npm run build
npm run test:e2e
npm audit
```

Current verified browser suite: **5 / 5 passed**.

The Playwright suite uses deterministic mocked wallet/read behavior and does not
submit live Bradbury transactions.

Coverage includes:

- landing page/app entry;
- theme control;
- blank escrow default;
- accessible create-SLA form labels;
- provider wallet/dashboard state;
- claimable balance rendering;
- client `COMPLETED` actions;
- validator adjudication presented as the primary action;
- direct acceptance presented separately;
- mobile navigation and horizontal-overflow check.

## Production runtime smoke

The built frontend was also served with `next start`.

Observed:

```text
/                         HTTP 200
/app                      HTTP 200
/api/proofsla/dashboard   live Bradbury read
```

The API returned SLA IDs `4`, `3`, `2`, `1` and the expected account claimable
state at the time of the smoke.

## Live Bradbury verification

Live writes are not part of the normal frontend E2E suite.

The dedicated validator-adjudication run reached:

```text
SLA #4
state: RESOLVED
verdict: MET
evidence_status: CORROBORATED
provider_award: 10000000000000000
client_award: 0
```

See [`BRADBURY_LIVE_VERIFICATION.md`](BRADBURY_LIVE_VERIFICATION.md) for the
full evidence record and exact transaction references.

## Deployment verification

The current `main` frontend was deployed to Vercel with:

- Root Directory: `web`
- Framework Preset: `Next.js`
- production URL: https://proofsla.vercel.app
- source commit:
  `60d4a0150be7ae93469d24b54950bde1da065044`

The live landing page and `/app` were visually verified. The production
dashboard loaded the Bradbury contract and displayed SLA #4 as
`RESOLVED / MET / CORROBORATED`.

## Change policy

### Contract changes

Require the full contract gate and, before any claim about a new deployment,
fresh deployment/live evidence.

### Frontend-only changes

Require at minimum:

```bash
npm run lint
npm run build
npm run test:e2e
git diff --check
```

A frontend-only change must not be described as a contract upgrade.
