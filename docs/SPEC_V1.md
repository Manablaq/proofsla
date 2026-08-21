# ProofSLA v1 Specification

## Product boundary

ProofSLA v1 is **not** a generic arbitration court. It is a narrow settlement primitive for disputes over an AI/API service execution.

A service run is eligible only when:

1. a client locks GEN against an SLA before work begins;
2. the provider accepts immutable terms;
3. the provider supplies a versioned primary evidence record;
4. the provider supplies an independent corroboration record;
5. both evidence records are fetched by GenLayer validators and verified against caller-supplied SHA-256 digests;
6. GenLayer validators independently evaluate the same SLA and evidence;
7. only settlement-relevant fields (`verdict`, `evidence_status`) must match;
8. payout math runs deterministically after consensus.

## Verdicts

- `MET`
- `MINOR_BREACH`
- `MAJOR_BREACH`
- `INSUFFICIENT_EVIDENCE`

Evidence status:

- `CORROBORATED`
- `CONFLICTING`
- `INSUFFICIENT`

If evidence is not `CORROBORATED`, v1 forcibly normalizes the verdict to `INSUFFICIENT_EVIDENCE`.

## Settlement

Client chooses two payout parameters at creation:

- provider basis points for `MINOR_BREACH`
- provider basis points for `MAJOR_BREACH`

`MET` always pays provider 100%.

`INSUFFICIENT_EVIDENCE` fails closed and refunds the client 100% in v1.

Funds are credited to a pull-payment ledger (`claimable`) and withdrawn in a separate transaction.

## Evidence security

- HTTPS required.
- SHA-256 required and checked on every validator fetch.
- Primary and corroboration URLs must differ.
- Evidence is capped at 100 KB per record.
- Provider supplies an observation timestamp constrained by the SLA's maximum evidence age.
- Evidence content is explicitly treated as untrusted data in the LLM prompt.
- Missing, conflicting, or unverifiable evidence cannot produce a positive provider verdict.

## Consensus

The contract uses `gl.vm.run_nondet_unsafe`.

Leader:

1. fetch primary evidence;
2. verify SHA-256;
3. fetch corroboration;
4. verify SHA-256;
5. run constrained LLM evaluation;
6. normalize output.

Validator:

1. independently repeats the same process;
2. compares `verdict`;
3. compares `evidence_status`;
4. intentionally ignores free-form `reason` differences.

A validator error or independent mismatch returns `False`.

## State machine

`CREATED -> ACTIVE -> COMPLETED -> RESOLVED`

`CREATED -> CANCELLED`

The names deliberately avoid GenLayer transaction-state names such as `ACCEPTED` and `FINALIZED`.

## Submission evidence target

Before Portal submission we must produce:

- passing linter;
- passing strict typecheck;
- generated ABI/schema;
- Direct Mode consensus agreement test;
- Direct Mode deliberate disagreement test;
- evidence digest mismatch test;
- prompt-injection test;
- hosted Studio integration evidence;
- real Bradbury deployment;
- at least one finalized MET path;
- at least one finalized breach or insufficient-evidence path;
- successful execution result, not only consensus status;
- post-resolution contract state proving the expected awards.
