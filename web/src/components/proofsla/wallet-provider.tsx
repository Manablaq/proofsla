"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PROOFSLA } from "@/lib/proofsla/config";
import { errorMessage, isAddress } from "@/lib/proofsla/format";
import type { Address } from "@/lib/proofsla/types";

interface WalletContextValue {
  address: Address | null;
  chainId: number | null;
  hasProvider: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const BRADBURY_CHAIN_HEX = "0x107d";

function parseChainId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstAddress(value: unknown): Address | null {
  if (!Array.isArray(value)) return null;
  const candidate = value[0];
  return typeof candidate === "string" && isAddress(candidate)
    ? candidate
    : null;
}

function providerErrorCode(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;

  const code = (error as { code?: unknown }).code;

  if (typeof code === "number") return code;
  if (typeof code === "string" && /^-?\d+$/.test(code)) return Number(code);

  return null;
}

async function switchProviderToBradbury(provider: EthereumProvider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BRADBURY_CHAIN_HEX }],
    });
    return;
  } catch (error) {
    if (providerErrorCode(error) !== 4902) {
      throw error;
    }
  }

  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: BRADBURY_CHAIN_HEX,
        chainName: PROOFSLA.network,
        nativeCurrency: {
          name: "GEN Token",
          symbol: "GEN",
          decimals: 18,
        },
        rpcUrls: [PROOFSLA.rpcUrl],
        blockExplorerUrls: [PROOFSLA.explorerUrl],
      },
    ],
  });
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const hasProvider = typeof window !== "undefined" && Boolean(window.ethereum);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => setAddress(firstAddress(accounts)))
      .catch(() => undefined);

    provider
      .request({ method: "eth_chainId" })
      .then((value) => setChainId(parseChainId(value)))
      .catch(() => undefined);

    const onAccountsChanged = (payload: unknown) => {
      setAddress(firstAddress(payload));
    };

    const onChainChanged = (payload: unknown) => {
      setChainId(parseChainId(payload));
    };

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const refreshChain = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) return;

    const value = await provider.request({ method: "eth_chainId" });
    setChainId(parseChainId(value));
  }, []);

  const connect = useCallback(async () => {
    const provider = window.ethereum;

    if (!provider) {
      toast.error("No browser wallet detected", {
        description: "Install MetaMask or another injected EVM wallet to continue.",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const nextAddress = firstAddress(accounts);

      if (!nextAddress) {
        throw new Error("The wallet did not return a usable account.");
      }

      setAddress(nextAddress);
      await refreshChain();

      toast.success("Wallet connected", {
        description: "Account connected. Bradbury is required before writes.",
      });
    } catch (error) {
      toast.error("Wallet connection failed", {
        description: errorMessage(error),
      });
    } finally {
      setIsConnecting(false);
    }
  }, [refreshChain]);

  const switchNetwork = useCallback(async () => {
    const provider = window.ethereum;

    if (!provider) {
      throw new Error("No browser wallet detected.");
    }

    try {
      await switchProviderToBradbury(provider);
      await refreshChain();

      toast.success("Bradbury selected", {
        description: `Wallet network switched to ${PROOFSLA.network}.`,
      });
    } catch (error) {
      const message = errorMessage(error);

      toast.error("Could not switch network", {
        description: message,
      });

      throw error;
    }
  }, [refreshChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      hasProvider,
      isConnecting,
      isCorrectNetwork: chainId === PROOFSLA.chainId,
      connect,
      switchNetwork,
      disconnect,
    }),
    [
      address,
      chainId,
      connect,
      disconnect,
      hasProvider,
      isConnecting,
      switchNetwork,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider.");
  }

  return context;
}
