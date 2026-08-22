export type Address = `0x${string}`;

export type SlaState =
  | "CREATED"
  | "ACTIVE"
  | "COMPLETED"
  | "RESOLVED"
  | "CANCELLED"
  | string;

export interface SlaRecord {
  id: bigint;
  client: Address;
  provider: Address;
  serviceDescription: string;
  requirements: string;
  minorProviderBps: bigint;
  majorProviderBps: bigint;
  maxEvidenceAgeSeconds: bigint;
  escrowAmount: bigint;
  state: SlaState;
  primaryEvidenceUrl: string;
  primaryEvidenceSha256: string;
  corroborationUrl: string;
  corroborationSha256: string;
  evidenceObservedAt: bigint;
  createdAt: string;
  acceptedAt: string;
  completedAt: string;
  resolvedAt: string;
  verdict: string;
  evidenceStatus: string;
  providerAward: bigint;
  clientAward: bigint;
  reason: string;
}

export type TransactionUiStatus =
  | "awaiting_signature"
  | "submitted"
  | "accepted"
  | "finalized"
  | "failed";

export interface TransactionItem {
  id: string;
  label: string;
  hash?: `0x${string}`;
  status: TransactionUiStatus;
  createdAt: number;
  message?: string;
}

export interface ContractWriteRequest {
  label: string;
  functionName:
    | "create_sla"
    | "accept_sla"
    | "cancel_unaccepted_sla"
    | "submit_delivery_evidence"
    | "accept_delivery"
    | "adjudicate"
    | "withdraw";
  args?: readonly unknown[];
  value?: bigint;
}
