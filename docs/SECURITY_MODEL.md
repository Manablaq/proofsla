# ProofSLA Security Model

ProofSLA combines deterministic escrow accounting with nondeterministic
evidence evaluation. This document makes those boundaries explicit.

## Assets

The primary protected assets are:

- escrowed GEN;
- claimable settlement balances;
- immutable SLA terms;
- evidence references and digests;
- lifecycle state;
- settlement verdict/evidence status.

## Authorization

The v1 contract restricts actions by lifecycle and caller role:

- the configured provider accepts the SLA;
- the provider submits delivery evidence;
- the client cancels an unaccepted SLA;
- the client accepts delivery or opens adjudication;
- each account withdraws only its own claimable balance.

## Evidence integrity

Evidence is not trusted because it is reachable by URL.

ProofSLA binds the provider's evidence through:

- HTTPS URL;
- SHA-256 digest;
- observation timestamp;
- an SLA-specific freshness limit.

Validators refetch the resources and verify the hashes before using their
content.

The two evidence URLs must be different. This prevents literal reuse of the
same URL, but it does not prove organizational, infrastructure, or publisher
independence.

## Prompt-injection boundary

Fetched content is passed to validator reasoning as untrusted evidence data.
Instructions found inside that content must not override the contract-defined
task or SLA.

The settlement-relevant validator output is deliberately constrained to:

- `verdict`;
- `evidence_status`.

The human-readable `reason` is explanatory and is not used as a consensus key
for settlement.

## Fail-closed evidence rule

If the evidence status is not `CORROBORATED`, settlement is normalized to
`INSUFFICIENT_EVIDENCE`.

This means conflicting or insufficient evidence cannot settle as `MET`,
`MINOR_BREACH`, or `MAJOR_BREACH`.

## Pull-payment settlement

Settlement updates internal `claimable` balances. Users withdraw separately.

This reduces the amount of external-value behavior inside adjudication and
keeps award calculation separate from value withdrawal.

## Frontend wallet safety

The frontend:

- uses the injected wallet for writes;
- does not store private keys;
- uses the configured Bradbury chain ID;
- distinguishes transaction `ACCEPTED` from `FINALIZED`;
- requires `FINISHED_WITH_RETURN` before treating an accepted write as
  successful;
- refreshes contract state after successful accepted writes.

`NEXT_PUBLIC_PROOFSLA_CONTRACT_ADDRESS` is intentionally public configuration.
It is not a secret.

## Trust assumptions

ProofSLA v1 assumes:

- Bradbury validators can access the submitted HTTPS evidence;
- the evidence remains available and hash-consistent during adjudication;
- validator/LLM reasoning follows the constrained evaluation prompt;
- GenLayer consensus and finality operate as documented for the target network;
- users protect their own wallet credentials.

## Known limitations

- Bradbury Testnet only.
- Evidence URL distinction is not the same as publisher independence.
- Validator reasoning is nondeterministic.
- The client controls whether a completed SLA is directly accepted or sent to
  adjudication in v1.
- A technically valid hash proves content integrity relative to the submitted
  digest, not that the content's real-world claim is inherently true.

## Reporting a security issue

Do not post private keys, seed phrases, wallet credentials, exploitable
transaction details, or active vulnerabilities in a public issue.

Use the repository's private GitHub security-reporting channel when available.
See [`SECURITY.md`](../SECURITY.md).
