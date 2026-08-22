# Security Policy

## Reporting

Do not publish active vulnerabilities, private keys, seed phrases, wallet
credentials, access tokens, or exploitable transaction details in a public
issue.

Use GitHub's private security reporting/advisory feature for this repository
when available.

A useful report includes:

- affected commit or deployment;
- affected contract/frontend component;
- reproduction steps that do not expose real secrets;
- expected vs observed behavior;
- impact;
- proposed mitigation, if known.

## Scope

Security-sensitive areas include:

- escrow and claimable accounting;
- lifecycle authorization;
- evidence digest/freshness verification;
- validator prompt/evidence isolation;
- transaction execution-result handling;
- wallet/chain configuration;
- read API input validation;
- deployment configuration.

## Secrets

The repository should never contain:

- wallet private keys;
- seed phrases;
- signer credentials;
- GitHub/Vercel access tokens;
- secret API keys.

`NEXT_PUBLIC_PROOFSLA_CONTRACT_ADDRESS` is public configuration, not a secret.
