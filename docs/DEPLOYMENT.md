# ProofSLA Deployment Reference

## Current deployment

| Layer | Deployment |
| --- | --- |
| Intelligent Contract | GenLayer Bradbury Testnet |
| Contract address | `0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8` |
| Chain ID | `4221` |
| Frontend | Vercel |
| Production URL | https://proofsla.vercel.app |
| Production branch | `main` |
| Frontend root | `web` |
| Framework preset | `Next.js` |

## Contract deployment boundary

The frontend uses the already-verified Bradbury contract. Deploying or
redeploying the web application must not deploy a new contract.

A contract source change requires:

1. the reproducible contract verification gate;
2. a deliberate new Bradbury deployment;
3. updated address/ABI/config;
4. fresh live verification evidence;
5. documentation that clearly distinguishes the old and new deployment.

## Frontend environment

Public build-time configuration:

```text
NEXT_PUBLIC_PROOFSLA_CONTRACT_ADDRESS=0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8
```

This value is not a secret. Never put wallet private keys, seed phrases, or
signing credentials in Vercel environment variables used by the browser
frontend.

## Vercel settings

The working production configuration is:

```text
Production branch:  main
Root Directory:     web
Framework Preset:   Next.js
Build Command:      default
Output Directory:   default
Install Command:    default
```

The framework preset matters. Treating the repository as `Other` caused Vercel
to look for a static `public` output directory even though the Next.js build
had completed successfully.

Do not create a fake `public` output directory to work around that
configuration error.

## Pre-deployment frontend gate

```bash
cd web
npm ci
npm run lint
npm run build
npm run test:e2e
npm audit
```

Then from the repository root:

```bash
git diff --check
git status -sb
```

## Production smoke

After Vercel reports `Ready`, verify:

1. `https://proofsla.vercel.app/`
2. `https://proofsla.vercel.app/app`
3. dashboard network: Bradbury / chain ID `4221`
4. contract address matches the documented deployment
5. live SLA history renders
6. no visible runtime error

Production verification should start read-only. Do not create a new live SLA
merely to prove that a deployment renders correctly.

## Rollback

A frontend rollback should use Vercel/Git history and must not alter the
Bradbury contract.

If the frontend commit changes the expected contract interface, roll back the
frontend to a commit compatible with the deployed contract rather than
silently redeploying a different contract.
