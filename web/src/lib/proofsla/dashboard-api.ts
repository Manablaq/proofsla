import type { Address, SlaRecord } from "@/lib/proofsla/types";

interface DashboardApiPayload {
  count: string;
  claimable: string;
  slas: Array<{
    id: string;
    client: Address;
    provider: Address;
    serviceDescription: string;
    requirements: string;
    minorProviderBps: string;
    majorProviderBps: string;
    maxEvidenceAgeSeconds: string;
    escrowAmount: string;
    state: string;
    primaryEvidenceUrl: string;
    primaryEvidenceSha256: string;
    corroborationUrl: string;
    corroborationSha256: string;
    evidenceObservedAt: string;
    createdAt: string;
    acceptedAt: string;
    completedAt: string;
    resolvedAt: string;
    verdict: string;
    evidenceStatus: string;
    providerAward: string;
    clientAward: string;
    reason: string;
  }>;
}

export interface DashboardSnapshot {
  count: bigint;
  claimable: bigint;
  slas: SlaRecord[];
}

function parsePayload(payload: DashboardApiPayload): DashboardSnapshot {
  return {
    count: BigInt(payload.count),
    claimable: BigInt(payload.claimable),
    slas: payload.slas.map((sla) => ({
      ...sla,
      id: BigInt(sla.id),
      minorProviderBps: BigInt(sla.minorProviderBps),
      majorProviderBps: BigInt(sla.majorProviderBps),
      maxEvidenceAgeSeconds: BigInt(sla.maxEvidenceAgeSeconds),
      escrowAmount: BigInt(sla.escrowAmount),
      evidenceObservedAt: BigInt(sla.evidenceObservedAt),
      providerAward: BigInt(sla.providerAward),
      clientAward: BigInt(sla.clientAward),
    })),
  };
}

export async function fetchDashboardSnapshot(
  address?: Address | null,
): Promise<DashboardSnapshot> {
  const params = new URLSearchParams();

  if (address) {
    params.set("address", address);
  }

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await fetch(`/api/proofsla/dashboard${suffix}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    throw new Error(
      body?.error ?? `Bradbury read failed with HTTP ${response.status}.`,
    );
  }

  return parsePayload((await response.json()) as DashboardApiPayload);
}
