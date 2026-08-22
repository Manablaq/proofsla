import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

import { PROOFSLA } from "@/lib/proofsla/config";
import type { Address, SlaRecord } from "@/lib/proofsla/types";

type ClientConfig = NonNullable<Parameters<typeof createClient>[0]>;

export const proofSlaReadClient = createClient({
  chain: testnetBradbury,
});

const contractAddress = PROOFSLA.contractAddress as Address;

function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && /^-?\d+$/.test(value)) return BigInt(value);
  throw new Error(`Expected integer contract value, received ${String(value)}`);
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function toAddress(value: unknown): Address {
  const address = toStringValue(value);
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error(`Invalid address returned by contract: ${address}`);
  }
  return address as Address;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Unexpected get_sla response shape.");
  }
  return value as Record<string, unknown>;
}

export function createProofSlaWriteClient(
  address: Address,
  provider: EthereumProvider,
) {
  return createClient({
    chain: testnetBradbury,
    account: address,
    provider: provider as ClientConfig["provider"],
  });
}

export async function readSlaCount(): Promise<bigint> {
  const result = await proofSlaReadClient.readContract({
    address: contractAddress,
    functionName: "get_sla_count",
    args: [],
  });

  return toBigInt(result);
}

export async function readClaimable(account: Address): Promise<bigint> {
  const result = await proofSlaReadClient.readContract({
    address: contractAddress,
    functionName: "get_claimable",
    args: [account],
  });

  return toBigInt(result);
}

export async function readSla(slaId: bigint): Promise<SlaRecord> {
  const result = await proofSlaReadClient.readContract({
    address: contractAddress,
    functionName: "get_sla",
    args: [slaId],
  });

  const record = toRecord(result);

  return {
    id: slaId,
    client: toAddress(record.client),
    provider: toAddress(record.provider),
    serviceDescription: toStringValue(record.service_description),
    requirements: toStringValue(record.requirements),
    minorProviderBps: toBigInt(record.minor_provider_bps),
    majorProviderBps: toBigInt(record.major_provider_bps),
    maxEvidenceAgeSeconds: toBigInt(record.max_evidence_age_seconds),
    escrowAmount: toBigInt(record.escrow_amount),
    state: toStringValue(record.state),
    primaryEvidenceUrl: toStringValue(record.primary_evidence_url),
    primaryEvidenceSha256: toStringValue(record.primary_evidence_sha256),
    corroborationUrl: toStringValue(record.corroboration_url),
    corroborationSha256: toStringValue(record.corroboration_sha256),
    evidenceObservedAt: toBigInt(record.evidence_observed_at),
    createdAt: toStringValue(record.created_at),
    acceptedAt: toStringValue(record.accepted_at),
    completedAt: toStringValue(record.completed_at),
    resolvedAt: toStringValue(record.resolved_at),
    verdict: toStringValue(record.verdict),
    evidenceStatus: toStringValue(record.evidence_status),
    providerAward: toBigInt(record.provider_award),
    clientAward: toBigInt(record.client_award),
    reason: toStringValue(record.reason),
  };
}

export async function readRecentSlas(limit = 50): Promise<{
  count: bigint;
  slas: SlaRecord[];
}> {
  const count = await readSlaCount();

  if (count === BigInt(0)) {
    return { count, slas: [] };
  }

  const numericCount = Number(count);
  const first = Math.max(1, numericCount - limit + 1);
  const ids = Array.from(
    { length: numericCount - first + 1 },
    (_, index) => BigInt(first + index),
  );

  const slas = await Promise.all(ids.map((id) => readSla(id)));
  return { count, slas: slas.reverse() };
}
