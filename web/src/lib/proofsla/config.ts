export const PROOFSLA = {
  name: "ProofSLA",
  network: "Bradbury Testnet",
  chainId: 4221,
  rpcUrl: "https://rpc-bradbury.genlayer.com",
  explorerUrl: "https://explorer-bradbury.genlayer.com",
  contractAddress:
    process.env.NEXT_PUBLIC_PROOFSLA_CONTRACT_ADDRESS ??
    "0xae2D66829A07B6B9FD8191f6977C7a36E91B36C8",
} as const;

export const SLA_STATES = [
  "CREATED",
  "ACTIVE",
  "COMPLETED",
  "RESOLVED",
] as const;

export const VERDICTS = [
  "MET",
  "MINOR_BREACH",
  "MAJOR_BREACH",
  "INSUFFICIENT_EVIDENCE",
] as const;
