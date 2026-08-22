# ProofSLA Product Walkthrough

This walkthrough reflects the production frontend hosted at
https://proofsla.vercel.app and the current Bradbury v1 contract.

## Landing

The public landing page explains the service-agreement model before the user
connects a wallet.

![ProofSLA production landing](assets/screenshots/production-landing.png)

The page presents four product ideas directly:

- measurable service requirements;
- evidence-bound execution records;
- GenLayer adjudication;
- deterministic settlement.

## Dashboard

The application dashboard reads live Bradbury contract state for the connected
wallet.

![ProofSLA production dashboard](assets/screenshots/production-dashboard.png)

The dashboard surfaces:

- number of agreements associated with the wallet;
- active and resolved counts;
- claimable GEN;
- recent SLA cards;
- lifecycle state and wallet role;
- verdict and evidence status for resolved agreements;
- network and contract information;
- transaction activity.

## Create an SLA

The client supplies:

- provider address;
- service description;
- measurable requirements;
- escrow amount in GEN;
- evidence freshness window;
- provider payout percentage for minor breach;
- provider payout percentage for major breach.

The escrow field intentionally starts blank so the application never silently
prefills a transfer amount.

## Provider acceptance

Only the configured provider can accept a `CREATED` SLA. After a successful
accepted transaction, the dashboard refreshes automatically and shows the SLA
as `ACTIVE`.

## Submit delivery evidence

The provider submits:

- primary evidence URL;
- primary SHA-256;
- corroboration URL;
- corroboration SHA-256;
- observation time.

Both URLs must use HTTPS and must differ.

A successful submission moves the SLA from `ACTIVE` to `COMPLETED`.

## Client resolution choices

For a completed SLA the client has two intentionally different paths.

### Adjudicate with validators

This invokes the real evidence-bound adjudication path. Validators fetch the
bound records and produce the settlement-relevant result.

### Accept without review

This is a deliberate direct-acceptance shortcut. It skips validator
adjudication and settles the delivery immediately as `MET / CORROBORATED`.

The UI separates these actions so a direct acceptance cannot be mistaken for a
validator-reviewed result.

## Settlement and claimable GEN

A resolved SLA shows:

- verdict;
- evidence status;
- provider award.

Settlement credits are pull-payment balances. A user with a positive
`claimable` amount can submit a separate `withdraw()` transaction.

The UI distinguishes transaction acceptance from finalization, because the
external value transfer completes with protocol finality.

## Production verification scenario

The dedicated SLA #4 frontend-integrated Bradbury test, performed against the same verified frontend code before Vercel production deployment, used:

- service: `ProofSLA Bradbury validator adjudication test`;
- requirement: provider must return HTTP 200 and the response body must contain
  `PROOFSLA_ADJUDICATION_OK`;
- escrow: `0.01 GEN`;
- minor provider payout: `80%`;
- major provider payout: `20%`.

Observed result:

- state: `RESOLVED`;
- verdict: `MET`;
- evidence: `CORROBORATED`;
- provider award: `0.01 GEN`;
- client award: `0 GEN`.

This was the `adjudicate()` path, not the direct acceptance shortcut.
