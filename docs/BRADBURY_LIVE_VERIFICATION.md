# ProofSLA Bradbury Live Verification

## Status

**Contract-level Bradbury happy path: PASS**

This report records the live Bradbury Testnet verification of ProofSLA, including the original runtime compatibility failure, the corrective patch, the successful redeployment, the full SLA lifecycle, nondeterministic evidence adjudication, validator consensus, deterministic settlement, and finalized GEN withdrawal.

This report distinguishes transaction consensus status from execution success. A transaction being `ACCEPTED` or `FINALIZED` is not treated by itself as proof that its Intelligent Contract execution succeeded. Where applicable, `txExecutionResult` / `txExecutionResultName` were checked separately.

## Network and Contract

- Network: Bradbury Testnet
- Verified contract address: `0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8`
- Verified contract source SHA-256:
  `7bc3b90343eacad03ec6db92fe64333f314a4bb75b85bd9a209ca1a3e1707075`
- Bradbury compatibility fix commit: `f25f126`
- Evidence commit:
  `f79afe8fd9f8fc9005072460a055293456a46a19`
- Evidence capture directory:
  `docs/evidence/bradbury-live-2026-08-21/`

## Participants

- Client:
  `0x5bB49021001200fE8156a81c7fcF097e535e7181`
- Provider:
  `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## SLA #1

- SLA ID: `1`
- Escrow: `1000000000000000000` wei = `1 GEN`
- Service:
  `ProofSLA Bradbury API execution test`
- Requirement:
  `The provider must return HTTP 200 and the response body must contain the exact text PROOFSLA_OK.`
- Minor-breach provider share: `8000` bps
- Major-breach provider share: `2000` bps
- Maximum evidence age: `86400` seconds

## Historical Bradbury Compatibility Failure

The first Bradbury deployment used the pre-fix contract.

Old contract:

`0x6446B96242B6F3678E629a29e7b6a0A13e3511c`

Deployment transaction:

`0x3a04f3c8eca9a394338a6932977a5342900395ddb17accb46f531127e7a517ab`

The subsequent `create_sla` transaction was:

`0x6ffb82a301c672794107772e98cd4ec1c4050d9fada8da55020ad8155f216a4e`

Consensus reached agreement, but the Intelligent Contract execution failed.

The debug trace showed that Bradbury/Studio surfaced the `provider` Address calldata value as a Python integer. When the SLA object was persisted into Address-typed storage, the runtime attempted to access `.as_bytes` on that integer and raised:

```text
AttributeError: 'int' object has no attribute 'as_bytes'
```

The failed transaction did not create an SLA; the post-failure SLA count remained zero.

The compatibility patch normalized supported Address representations before authorization checks and storage. It also normalized the Address argument used by `get_claimable`.

Regression coverage was added for the integer-address representation, including a same-address role-separation case.

The corrected contract source SHA-256 is:

`7bc3b90343eacad03ec6db92fe64333f314a4bb75b85bd9a209ca1a3e1707075`

## Corrected Deployment

Corrected Bradbury deployment transaction:

`0xc0146846c7ff84723ba42e4cfaee3d829d5b8be1e76066c68d4dcb0c15f76228`

Contract:

`0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8`

Execution:

- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

Initial `get_sla_count()` returned `0`.

## Live SLA Lifecycle

### 1. Create SLA

Transaction:

`0xbc5b0e5eadecf9767ddd29c3fe9c2419b99894038a1eb118b3aaa1f3b4531d20`

Observed execution:

- sender: client
- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

Persisted state:

- SLA count: `1`
- state: `CREATED`
- escrow: `1 GEN`
- correct client
- correct provider
- correct SLA terms and payout parameters

Result: **PASS**

### 2. Provider Accepts SLA

Transaction:

`0xccf40eebe823e153205e76e1418d940b736635a3ac76931734d5aaac394fbf2a`

Observed execution:

- sender: provider
- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

Persisted transition:

`CREATED -> ACTIVE`

Accepted timestamp:

`2026-08-21T16:02:07+00:00`

Result: **PASS**


## Evidence Records

The evidence records were committed before submission and referenced through commit-pinned public URLs.

Evidence commit:

`f79afe8fd9f8fc9005072460a055293456a46a19`

### Primary evidence

URL:

`https://raw.githubusercontent.com/Manablaq/proofsla/f79afe8fd9f8fc9005072460a055293456a46a19/evidence/primary-proofsla-bradbury-001.txt`

SHA-256:

`4ac304d2dcfdb30c6d2617201af955fdfa32268fc393e845753ac2d21fe990aa`

Recorded content includes:

- run ID `proofsla-bradbury-001`
- HTTP status `200`
- response body `PROOFSLA_OK`

### Corroboration evidence

URL:

`https://raw.githubusercontent.com/Manablaq/proofsla/f79afe8fd9f8fc9005072460a055293456a46a19/evidence/corroboration-proofsla-bradbury-001.txt`

SHA-256:

`1e0a07a6fcbde3bdbb47dbb8838eabe7424fcbba392f4b0fc6e96c0a72903d66`

The remote commit-pinned files were fetched independently after publication and their SHA-256 values matched the committed evidence records.

Evidence observation timestamp:

`1787328818`

Important limitation: these are two distinct immutable URLs, but both records are hosted in the same GitHub repository. This live run therefore proves distinct-reference hash-bound corroboration, not organizationally independent evidence publishing.

## Submit Delivery Evidence

Transaction:

`0xe4851834b3536f527fd9312316d517a2a6961da6c202e01299a87d31a3a214bd`

Observed execution:

- sender: provider
- initial validators: `3`
- rounds: `0`
- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

Persisted transition:

`ACTIVE -> COMPLETED`

Persisted values included:

- primary immutable URL
- primary SHA-256
- corroboration immutable URL
- corroboration SHA-256
- evidence observation timestamp
- `completed_at = 2026-08-21T16:18:44+00:00`

Before adjudication:

- verdict empty
- evidence status empty
- provider award `0`
- client award `0`

Result: **PASS**

## Live Nondeterministic Adjudication

Transaction:

`0x23ccc795ce236bc08430292eae9b1ff6e72c6b9444a21914cb7911e297f34e39`

Caller:

client

Observed execution:

- initial validators: `3`
- rounds: `0`
- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

Consensus output:

- verdict: `MET`
- evidence status: `CORROBORATED`

Persisted reason:

> Both evidence records refer to the same run ID and report HTTP status 200 with response body exactly PROOFSLA_OK, satisfying the SLA.

The transaction exercised the live Bradbury nondeterministic path, including web evidence retrieval, digest checking, LLM SLA adjudication, and validator comparison of settlement-relevant fields.

Persisted transition:

`COMPLETED -> RESOLVED`

Resolved timestamp:

`2026-08-21T16:23:29+00:00`

Result: **PASS**


## Deterministic Settlement

The finalized resolved SLA state recorded:

- state: `RESOLVED`
- verdict: `MET`
- evidence status: `CORROBORATED`
- provider award: `1000000000000000000`
- client award: `0`

Studio-observed pre-withdrawal claimable balances were:

- provider: `1000000000000000000`
- client: `0`

These pre-withdrawal claimable reads were observed before `withdraw()` and are reported as such. They were not reconstructed later as historical RPC state.

Result: **PASS**

## Finalized Withdrawal

Withdrawal transaction:

`0xa04e6800ee2e64299406db7537e48e0d00ddb0a6f59a8d59de85249d09374358`

Caller:

provider

Parent execution:

- result: `AGREE`
- `txExecutionResult = 1`
- `txExecutionResultName = FINISHED_WITH_RETURN`

The transaction subsequently reached:

`FINALIZED`

The finalized transaction exposed the external message:

- recipient:
  `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- value:
  `1000000000000000000`
- data:
  empty
- `onAcceptance`:
  `false`

Final consensus data showed:

- votes committed: `5`
- votes revealed: `5`
- validator votes:
  `AGREE, AGREE, AGREE, AGREE, AGREE`

Triggered GenLayer child transaction IDs:

`[]`

The finalized parent transaction itself contains the EOA external value-transfer message.

An earlier accepted-stage view showed `messages: []`. The outbound 1 GEN message became visible after the transaction reached `FINALIZED`.

ProofSLA therefore does not treat `ACCEPTED` alone as proof of final external payment.

Finalized state after withdrawal:

- provider claimable: `0`
- client claimable: `0`

Result: **PASS**

## Finalized State Capture

A read-only finalized Bradbury state snapshot was captured in:

`docs/evidence/bradbury-live-2026-08-21/final-state-reads.json`

SHA-256:

`b1f69655e881767309ad7a8500499e2fb17503028dec22cb6302fdd032796eda`

The snapshot used:

`TransactionHashVariant.LATEST_FINAL`

and records the structured Bradbury `gen_call` responses together with the decoded ProofSLA return values.

Final decoded values:

- SLA count: `1`
- state: `RESOLVED`
- verdict: `MET`
- evidence status: `CORROBORATED`
- provider award: `1000000000000000000`
- client award: `0`
- resolved at: `2026-08-21T16:23:29+00:00`
- provider claimable after withdrawal: `0`
- client claimable: `0`

Result: **PASS**

## Pinned SDK Read Compatibility Finding

While capturing the finalized state, three version-specific SDK behaviors were observed.

### 1. Final-state selector API

The pinned SDK does not accept:

`state_status=...`

Its installed `read_contract` API instead exposes:

`transaction_hash_variant`

The installed enum contains:

- `LATEST_FINAL = 'latest-final'`
- `LATEST_NONFINAL = 'latest-nonfinal'`

### 2. Read caller context

The pinned SDK requires an account context even for `read_contract`.

An ephemeral local account was therefore used only as caller context for the read-only `gen_call`.

No blockchain write transaction was submitted by this state-capture process.

### 3. Structured Bradbury gen_call response

The pinned SDK wrapper contains:

```python
enc_result = self.provider.make_request(
    method="gen_call",
    params=[request_params],
)["result"]

prefixed_result = "0x" + enc_result
```

Bradbury returned `result` as a structured object rather than the string expected by this wrapper.

That caused:

```text
TypeError: can only concatenate str (not "dict") to str
```

The exact installed wrapper implementation was captured in:

`docs/evidence/bradbury-live-2026-08-21/sdk-read-contract-source.txt`

SHA-256:

`fcfa4b528688f463686c49cfbdb570efdd509c9ff3691e0c4266d6b7213dd8eb`

For the successful finalized snapshot, only the incompatible wrapper result-extraction step was bypassed.

The pinned SDK's own:

- calldata encoder
- calldata serializer
- Bradbury provider
- transaction-hash variant
- calldata decoder

were retained.

The return bytes were extracted from the structured Bradbury `result.data` field and then decoded with the pinned SDK decoder.

This is recorded as a tooling compatibility finding, not a ProofSLA contract failure.


## Pinned Linter Verification Finding

The pinned `genvm-linter` strict typecheck command reports:

`0 error(s), 0 warning(s)`

but returns process exit status `1`.

The reproducible verification script does not suppress typecheck failures with `|| true`. It captures the typecheck output and status, requires the exact zero-errors/zero-warnings summary, and accepts only the observed status `0` or `1`. Any different summary or unexpected exit status fails verification.

This is recorded as a pinned-tooling behavior, not a ProofSLA contract failure.

## Evidence Package

The repository evidence package contains:

- corrected deployment transaction
- `create_sla` transaction
- `accept_sla` transaction
- `submit_delivery_evidence` transaction
- `adjudicate` transaction
- adjudication debug trace
- `withdraw` transaction
- withdrawal debug trace
- withdrawal triggered-transaction result
- pre-fix deployment transaction
- pre-fix failed `create_sla` transaction
- pre-fix failed `create_sla` debug trace
- finalized-state reads
- remote evidence verification
- environment metadata
- pinned SDK `read_contract` implementation

All captured JSON files were validated with `python -m json.tool`.

## Contract-Level Bradbury Gate Summary

| Gate | Result |
|---|---|
| Corrected deployment | PASS |
| `create_sla` execution | PASS |
| `CREATED` persistence | PASS |
| Provider acceptance | PASS |
| `CREATED -> ACTIVE` | PASS |
| Commit-pinned primary evidence | PASS |
| Primary digest verification | PASS |
| Commit-pinned corroboration evidence | PASS |
| Corroboration digest verification | PASS |
| Evidence submission | PASS |
| `ACTIVE -> COMPLETED` | PASS |
| Live web evidence retrieval | PASS |
| Evidence hash validation | PASS |
| LLM SLA adjudication | PASS |
| Validator consensus | PASS |
| `MET` verdict | PASS |
| `CORROBORATED` evidence status | PASS |
| `COMPLETED -> RESOLVED` | PASS |
| Provider award = 1 GEN | PASS |
| Client award = 0 | PASS |
| Pull-payment accounting | PASS |
| Withdrawal execution | PASS |
| Withdrawal finalization | PASS |
| Claimable cleared | PASS |
| Finalized outbound 1 GEN message | PASS |
| Finalized-state readback | PASS |

## What This Proves

The Bradbury run provides evidence that the verified ProofSLA contract can complete the intended happy path:

`CREATED -> ACTIVE -> COMPLETED -> RESOLVED`

with escrowed GEN, hash-bound evidence retrieval, LLM SLA evaluation, validator consensus, deterministic settlement, pull-payment accounting, and finalized external GEN withdrawal.


## Remaining Limitations and Reviewer-Readiness Work

The successful Bradbury happy path does not by itself close every product or reviewer risk.

### Evidence-source independence

The contract currently requires distinct primary and corroboration URLs but does not prove organizational independence between the two evidence publishers.

The Bradbury run used two distinct commit-pinned records in the same public GitHub repository.

This proves the two-reference fetch/hash/consensus path, but it must not be represented as proof of organizationally independent corroboration.

### Evidence observation timestamp

`evidence_observed_at` is supplied by the provider and checked against freshness constraints.

It is not itself an independently authenticated timestamp supplied by the evidence publisher.

### Withdrawal failure semantics

The verified live withdrawal succeeded and the finalized transaction exposed the 1 GEN outbound message.

The contract clears claimable credit before emitting the finalized external transfer. Failure semantics for a future external-transfer failure remain an explicit design consideration and are not inferred from this successful run.

### Application/frontend

The Intelligent Contract happy path is live-proven, but a complete reviewer-ready GenLayer Project still requires a real frontend/application that interacts with the contract.

That application must be completed and tested against Bradbury before submission.

### Originality and overlap

A focused ecosystem sanity check for obvious functional overlap still needs to be completed before submission.

The goal is to verify that ProofSLA remains sufficiently distinctive and reusable, not to create an exhaustive ecosystem-wide duplicate catalogue.

## Deployment Policy

No additional contract deployment should be performed merely to repeat this already successful happy path.

Redeployment should occur only if a concrete contract change or defect requires a new source hash and a new live-verification cycle.
