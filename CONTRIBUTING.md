# Contributing to ProofSLA

Thanks for helping improve ProofSLA.

## Before changing code

Read:

- [`docs/SPEC_V1.md`](docs/SPEC_V1.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md)
- [`docs/TESTING.md`](docs/TESTING.md)

The deployed Bradbury contract and the production frontend have separate
verification boundaries. Do not mix them in a single claim.

## Branches

Use a focused branch from the latest `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c <type>/<short-description>
```

Keep changes narrowly scoped.

## Contract changes

Any change under `contracts/` must run the canonical contract verification
gate:

```bash
./scripts/verify.sh
```

Do not update the documented Bradbury contract address unless a new contract
was deliberately deployed and independently verified.

## Frontend changes

From `web/`:

```bash
npm ci
npm run lint
npm run build
npm run test:e2e
```

Then:

```bash
git diff --check
```

Do not add a live Bradbury write to the automated browser suite.

## Documentation changes

Documentation must clearly distinguish:

- deterministic contract behavior;
- validator/LLM judgment;
- test fixtures;
- observed live Bradbury evidence;
- transaction acceptance;
- transaction finalization.

Avoid claims of evidence-source independence unless that independence was
actually established.

## Pull requests

A pull request should contain:

- what changed;
- why it changed;
- verification performed;
- deployment impact;
- contract impact;
- screenshots for visible UI changes.

Do not commit secrets, `.env` files, wallet keys, seed phrases, access tokens,
or private evidence.
