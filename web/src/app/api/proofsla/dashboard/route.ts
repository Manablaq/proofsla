import { NextResponse } from "next/server";

import {
  readClaimable,
  readRecentSlas,
} from "@/lib/proofsla/client";
import { isAddress } from "@/lib/proofsla/format";
import type { Address } from "@/lib/proofsla/types";

export const dynamic = "force-dynamic";

function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(jsonSafe);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, jsonSafe(item)]),
    );
  }

  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const addressParam = url.searchParams.get("address");

  let address: Address | null = null;

  if (addressParam) {
    if (!isAddress(addressParam)) {
      return NextResponse.json(
        { error: "Invalid wallet address." },
        { status: 400 },
      );
    }

    address = addressParam;
  }

  try {
    const [{ count, slas }, claimable] = await Promise.all([
      readRecentSlas(50),
      address ? readClaimable(address) : Promise.resolve(BigInt(0)),
    ]);

    return NextResponse.json(
      jsonSafe({
        count,
        slas,
        claimable,
      }),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bradbury read failed.";

    console.warn("ProofSLA server-side Bradbury read failed:", message);

    return NextResponse.json(
      {
        error: "Bradbury state is temporarily unavailable.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
