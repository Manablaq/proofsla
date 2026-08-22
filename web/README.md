# ProofSLA Web

Production frontend for ProofSLA, an evidence-bound service-level agreement
settlement application running on GenLayer Bradbury Testnet.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- TanStack Query
- GenLayerJS
- React Hook Form + Zod
- next-themes
- Playwright browser smoke tests

## Network

- Network: GenLayer Bradbury Testnet
- Chain ID: `4221`
- Contract: `0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8`

Override the contract with `NEXT_PUBLIC_PROOFSLA_CONTRACT_ADDRESS`.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
npm run test:e2e
```

The browser tests mock Bradbury reads and wallet RPC and never create a live
transaction. Live Bradbury write verification is intentionally separate.

## Architecture

Injected-wallet actions use the browser EIP-1193 provider. Routine dashboard
reads go through `/api/proofsla/dashboard`, which performs GenLayer reads on
the Next.js server and returns a JSON-safe snapshot. TanStack Query refreshes
that snapshot automatically and invalidates it after accepted writes.

Transaction UI distinguishes GenLayer `ACCEPTED` from `FINALIZED`. Contract
state is refreshed after acceptance; external-value completion such as a
withdrawal is not described as finalized until finality is observed.

## SLA lifecycle

`CREATED → ACTIVE → COMPLETED → RESOLVED`

An unaccepted SLA can also move `CREATED → CANCELLED`.

For a completed SLA the client can:

- **Adjudicate with validators** — verifies the bound evidence through
  GenLayer consensus.
- **Accept without review** — directly accepts delivery and intentionally
  skips validator adjudication.
