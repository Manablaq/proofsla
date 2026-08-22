import type { Address } from "@/lib/proofsla/types";

export function isAddress(value: string): value is Address {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

export function shortAddress(address: string, size = 4) {
  if (address.length < size * 2 + 4) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

export function sameAddress(a?: string | null, b?: string | null) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}

export function parseGen(value: string): bigint {
  const normalized = value.trim();

  if (!/^\d+(\.\d{0,18})?$/.test(normalized)) {
    throw new Error("Enter a valid GEN amount with up to 18 decimal places.");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const wei = `${whole}${fraction.padEnd(18, "0")}`.replace(/^0+(?=\d)/, "");
  return BigInt(wei || "0");
}

const WEI_PER_GEN = BigInt("1000000000000000000");

export function formatGen(value: bigint, maximumFractionDigits = 4): string {
  const negative = value < BigInt(0);
  const absolute = negative ? -value : value;
  const whole = absolute / WEI_PER_GEN;
  const fraction = (absolute % WEI_PER_GEN).toString().padStart(18, "0");
  const trimmed = fraction
    .slice(0, Math.max(0, maximumFractionDigits))
    .replace(/0+$/, "");

  return `${negative ? "-" : ""}${whole.toString()}${trimmed ? `.${trimmed}` : ""}`;
}

export function formatBps(value: bigint): string {
  const percent = Number(value) / 100;
  return `${percent.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}%`;
}

export function formatTimestamp(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    for (const key of ["shortMessage", "message", "details"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }

  return "Something went wrong. Please try again.";
}
