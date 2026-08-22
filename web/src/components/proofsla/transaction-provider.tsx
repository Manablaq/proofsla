"use client";

import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProofSlaWriteClient,
  proofSlaReadClient,
} from "@/lib/proofsla/client";
import { PROOFSLA } from "@/lib/proofsla/config";
import { errorMessage } from "@/lib/proofsla/format";
import type {
  ContractWriteRequest,
  TransactionItem,
} from "@/lib/proofsla/types";
import { useWallet } from "@/components/proofsla/wallet-provider";

interface TransactionContextValue {
  transactions: TransactionItem[];
  isWriting: boolean;
  execute: (request: ContractWriteRequest) => Promise<`0x${string}`>;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const updateTransaction = useCallback(
    (id: string, patch: Partial<TransactionItem>) => {
      setTransactions((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const invalidateProofSla = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["proofsla"] });
  }, [queryClient]);

  const execute = useCallback(
    async (request: ContractWriteRequest): Promise<`0x${string}`> => {
      const provider = window.ethereum;
      if (!provider) {
        throw new Error("No browser wallet detected.");
      }

      if (!wallet.address) {
        throw new Error("Connect your wallet before submitting a transaction.");
      }

      if (!wallet.isCorrectNetwork) {
        await wallet.switchNetwork();
      }

      const id = crypto.randomUUID();
      const createdAt = Date.now();

      const initialTransaction: TransactionItem = {
        id,
        label: request.label,
        status: "awaiting_signature",
        createdAt,
        message: "Confirm this transaction in your wallet.",
      };

      setTransactions((current) =>
        [initialTransaction, ...current].slice(0, 12),
      );

      try {
        const client = createProofSlaWriteClient(wallet.address, provider);
        const writeArgs = [
          ...(request.args ?? []),
        ] as Parameters<typeof client.writeContract>[0]["args"];

        const hash = await client.writeContract({
          address: PROOFSLA.contractAddress as `0x${string}`,
          functionName: request.functionName,
          args: writeArgs,
          value: request.value ?? BigInt(0),
        });

        updateTransaction(id, {
          hash,
          status: "submitted",
          message: "Submitted. Waiting for GenLayer consensus.",
        });

        toast.info(`${request.label} submitted`, {
          description: "Waiting for GenLayer consensus.",
        });

        const acceptedReceipt =
          await proofSlaReadClient.waitForTransactionReceipt({
            hash,
            status: TransactionStatus.ACCEPTED,
          });

        if (
          acceptedReceipt.txExecutionResultName ===
          ExecutionResult.FINISHED_WITH_ERROR
        ) {
          throw new Error(
            "Consensus completed, but contract execution finished with an error.",
          );
        }

        if (
          acceptedReceipt.txExecutionResultName !==
          ExecutionResult.FINISHED_WITH_RETURN
        ) {
          throw new Error(
            `Unexpected execution result: ${String(
              acceptedReceipt.txExecutionResultName,
            )}`,
          );
        }

        updateTransaction(id, {
          status: "accepted",
          message:
            request.functionName === "withdraw"
              ? "Accepted. The external value transfer completes on finalization."
              : "Accepted. Contract state has been synchronized.",
        });

        await invalidateProofSla();

        toast.success(`${request.label} accepted`, {
          description:
            request.functionName === "withdraw"
              ? "Withdrawal is accepted; value transfer completes when the transaction finalizes."
              : "The latest contract state is now reflected in the app.",
        });

        void proofSlaReadClient
          .waitForTransactionReceipt({
            hash,
            status: TransactionStatus.FINALIZED,
          })
          .then(async (finalReceipt) => {
            if (
              finalReceipt.txExecutionResultName !==
              ExecutionResult.FINISHED_WITH_RETURN
            ) {
              return;
            }

            updateTransaction(id, {
              status: "finalized",
              message: "Finalized on Bradbury.",
            });
            await invalidateProofSla();
          })
          .catch(() => {
            // Accepted remains truthful if background finalization polling times out.
          });

        return hash;
      } catch (error) {
        const message = errorMessage(error);
        updateTransaction(id, {
          status: "failed",
          message,
        });

        toast.error(`${request.label} failed`, {
          description: message,
        });

        throw error;
      }
    },
    [invalidateProofSla, updateTransaction, wallet],
  );

  const value = useMemo<TransactionContextValue>(
    () => ({
      transactions,
      isWriting: transactions.some((item) =>
        ["awaiting_signature", "submitted"].includes(item.status),
      ),
      execute,
      clearTransactions: () => setTransactions([]),
    }),
    [execute, transactions],
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useProofSlaTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      "useProofSlaTransactions must be used inside TransactionProvider.",
    );
  }

  return context;
}
