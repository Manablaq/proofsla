"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  FileCheck2,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CreateSlaModal } from "@/components/proofsla/create-sla-modal";
import { EvidenceModal } from "@/components/proofsla/evidence-modal";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useProofSlaTransactions } from "@/components/proofsla/transaction-provider";
import { useWallet } from "@/components/proofsla/wallet-provider";
import { PROOFSLA } from "@/lib/proofsla/config";
import { fetchDashboardSnapshot } from "@/lib/proofsla/dashboard-api";
import {
  formatBps,
  formatGen,
  formatTimestamp,
  sameAddress,
  shortAddress,
} from "@/lib/proofsla/format";
import type { ContractWriteRequest, SlaRecord } from "@/lib/proofsla/types";

export function ProofSlaDashboard() {
  const wallet = useWallet();
  const { execute, transactions, isWriting, clearTransactions } =
    useProofSlaTransactions();

  const [createOpen, setCreateOpen] = useState(false);
  const [evidenceSla, setEvidenceSla] = useState<SlaRecord | null>(null);

  const snapshotQuery = useQuery({
    queryKey: ["proofsla", "dashboard", wallet.address],
    queryFn: () => fetchDashboardSnapshot(wallet.address),
    refetchInterval: 15_000,
    retry: 2,
  });

  const mySlas = useMemo(() => {
    if (!wallet.address) return [];

    return (snapshotQuery.data?.slas ?? []).filter(
      (sla) =>
        sameAddress(wallet.address, sla.client) ||
        sameAddress(wallet.address, sla.provider),
    );
  }, [snapshotQuery.data?.slas, wallet.address]);

  const activeCount = mySlas.filter((sla) =>
    ["CREATED", "ACTIVE", "COMPLETED"].includes(sla.state),
  ).length;
  const resolvedCount = mySlas.filter((sla) => sla.state === "RESOLVED").length;
  const claimable = snapshotQuery.data?.claimable ?? BigInt(0);

  const refresh = async () => {
    await snapshotQuery.refetch();
    toast.success("Contract state refreshed");
  };

  const withdraw = async () => {
    if (claimable === BigInt(0)) return;
    await execute({
      label: "Withdraw claimable GEN",
      functionName: "withdraw",
    });
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex min-h-18 max-w-[1500px] items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div className="flex items-center gap-5">
            <Logo href="/app" />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-success sm:inline-flex">
              {PROOFSLA.network}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh contract state"
              className="grid size-10 place-items-center rounded-full border border-border/70 bg-background transition hover:bg-muted"
            >
              <RefreshCcw
                className={`size-4 ${
                  snapshotQuery.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
            <ThemeToggle />
            <WalletControl />
          </div>
        </div>
      </header>

      {!wallet.isCorrectNetwork && wallet.address ? (
        <div className="border-b border-amber-400/20 bg-amber-400/10">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-5 py-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between md:px-8">
            <span className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-amber-600" />
              Your wallet is on the wrong network.
            </span>
            <button
              type="button"
              onClick={() => void wallet.switchNetwork()}
              className="font-extrabold text-amber-700 dark:text-amber-300"
            >
              Switch to Bradbury
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-8 md:px-8 xl:grid-cols-[230px_1fr]">
        <aside className="hidden xl:block">
          <nav className="sticky top-28 space-y-1">
            <a href="#overview" className="nav-item nav-item-active">
              Overview
            </a>
            <a href="#agreements" className="nav-item">
              My SLAs
            </a>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="nav-item w-full"
            >
              Create SLA
            </button>
            <a href="#claimable" className="nav-item">
              Claimable
            </a>
            <a href="#activity" className="nav-item">
              Activity
            </a>

            <div className="my-5 border-t border-border/70" />

            <Link href="/" className="nav-item">
              <ArrowLeft className="size-4" />
              Landing page
            </Link>
          </nav>
        </aside>

        <section id="overview" className="min-w-0 scroll-mt-28">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] md:text-4xl">
                Your agreements
              </h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Live Bradbury state refreshes automatically after transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:-translate-y-0.5"
            >
              <Plus className="size-4" />
              Create SLA
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Your SLAs"
              value={wallet.address ? mySlas.length.toString() : "—"}
              icon={FileCheck2}
            />
            <Metric
              label="Active"
              value={wallet.address ? activeCount.toString() : "—"}
              icon={Clock3}
            />
            <Metric
              label="Resolved"
              value={wallet.address ? resolvedCount.toString() : "—"}
              icon={CheckCircle2}
            />
            <Metric
              id="claimable"
              label="Claimable"
              value={wallet.address ? `${formatGen(claimable)} GEN` : "— GEN"}
              icon={ShieldCheck}
            />
          </div>

          {claimable > BigInt(0) ? (
            <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-success/20 bg-success/8 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-success/12 text-success">
                  <CircleDollarSign className="size-5" />
                </span>
                <div>
                  <strong className="text-sm">
                    {formatGen(claimable, 6)} GEN ready to withdraw
                  </strong>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Withdrawal is accepted first; the external value transfer
                    executes when the transaction finalizes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isWriting}
                onClick={() => void withdraw()}
                className="h-10 rounded-full bg-foreground px-5 text-sm font-extrabold text-background disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
            <div id="agreements" className="dashboard-card min-h-[420px] scroll-mt-28">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold tracking-[-0.03em]">
                    Recent SLAs
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    Network total:{" "}
                    {snapshotQuery.data?.count?.toString() ??
                      (snapshotQuery.isLoading ? "…" : "—")}
                  </p>
                </div>
                {snapshotQuery.isError ? (
                  <button
                    type="button"
                    onClick={() => void snapshotQuery.refetch()}
                    className="text-xs font-extrabold text-primary"
                  >
                    Retry
                  </button>
                ) : null}
              </div>

              <div className="mt-6">
                {snapshotQuery.isError && snapshotQuery.data ? (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <TriangleAlert className="size-3.5 shrink-0" />
                    Showing the last successful Bradbury snapshot while the RPC recovers.
                  </div>
                ) : null}

                {!wallet.address ? (
                  <EmptyWallet onConnect={() => void wallet.connect()} />
                ) : snapshotQuery.isLoading ? (
                  <LoadingSlas />
                ) : snapshotQuery.isError ? (
                  <ErrorState />
                ) : mySlas.length === 0 ? (
                  <EmptySlas onCreate={() => setCreateOpen(true)} />
                ) : (
                  <div className="space-y-3">
                    {mySlas.map((sla) => (
                      <SlaRow
                        key={sla.id.toString()}
                        sla={sla}
                        walletAddress={wallet.address!}
                        busy={isWriting}
                        onEvidence={() => setEvidenceSla(sla)}
                        onAction={(request) => void execute(request)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="dashboard-card">
                <p className="eyebrow">Network</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-40" />
                    <span className="relative inline-flex size-3 rounded-full bg-success" />
                  </span>
                  <div>
                    <strong className="block text-sm">{PROOFSLA.network}</strong>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Chain ID {PROOFSLA.chainId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <p className="eyebrow">Contract</p>
                <div className="mt-4 flex items-start gap-2">
                  <p className="min-w-0 flex-1 break-all font-mono text-xs font-semibold leading-5 text-muted-foreground">
                    {PROOFSLA.contractAddress}
                  </p>
                  <button
                    type="button"
                    aria-label="Copy contract address"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        PROOFSLA.contractAddress,
                      );
                      toast.success("Contract address copied");
                    }}
                    className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-muted"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
                <a
                  href={`${PROOFSLA.explorerUrl}/address/${PROOFSLA.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary"
                >
                  Contract details
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>

              <TransactionActivity
                transactions={transactions}
                onClear={clearTransactions}
              />
            </div>
          </div>
        </section>
      </div>

      <CreateSlaModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EvidenceModal
        sla={evidenceSla}
        open={Boolean(evidenceSla)}
        onClose={() => setEvidenceSla(null)}
      />
    </main>
  );
}

function WalletControl() {
  const wallet = useWallet();

  if (!wallet.address) {
    return (
      <button
        type="button"
        disabled={wallet.isConnecting}
        onClick={() => void wallet.connect()}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-extrabold text-background disabled:opacity-60"
      >
        {wallet.isConnecting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Wallet className="size-4" />
        )}
        <span className="hidden sm:inline">
          {wallet.isConnecting ? "Connecting…" : "Connect wallet"}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-foreground p-1 pl-3 text-background">
      <span className="text-xs font-extrabold">
        {shortAddress(wallet.address)}
      </span>
      <button
        type="button"
        onClick={wallet.disconnect}
        aria-label="Disconnect wallet from app"
        className="grid size-8 place-items-center rounded-full bg-background/10 transition hover:bg-background/20"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  );
}

function Metric({
  id,
  label,
  value,
  icon: Icon,
}: {
  id?: string;
  label: string;
  value: string;
  icon: typeof FileCheck2;
}) {
  return (
    <div id={id} className="dashboard-card scroll-mt-28">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <strong className="mt-6 block text-2xl font-extrabold tracking-[-0.04em]">
        {value}
      </strong>
    </div>
  );
}

function SlaRow({
  sla,
  walletAddress,
  busy,
  onEvidence,
  onAction,
}: {
  sla: SlaRecord;
  walletAddress: string;
  busy: boolean;
  onEvidence: () => void;
  onAction: (request: ContractWriteRequest) => void;
}) {
  const isClient = sameAddress(walletAddress, sla.client);
  const isProvider = sameAddress(walletAddress, sla.provider);
  const role = isClient ? "Client" : isProvider ? "Provider" : "Observer";

  const action =
    sla.state === "CREATED" && isProvider
      ? {
          label: "Accept SLA",
          request: {
            label: `Accept SLA #${sla.id.toString()}`,
            functionName: "accept_sla" as const,
            args: [sla.id],
          },
        }
      : sla.state === "CREATED" && isClient
        ? {
            label: "Cancel",
            request: {
              label: `Cancel SLA #${sla.id.toString()}`,
              functionName: "cancel_unaccepted_sla" as const,
              args: [sla.id],
            },
          }
        : null;

  return (
    <article className="rounded-2xl border border-border/70 bg-background/65 p-4 transition hover:border-primary/25">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-muted-foreground">
              SLA #{sla.id.toString()}
            </span>
            <StateBadge state={sla.state} />
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              {role}
            </span>
          </div>
          <h3 className="mt-3 truncate text-base font-extrabold tracking-[-0.025em]">
            {sla.serviceDescription}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
            {sla.requirements}
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <strong className="block text-sm">
            {formatGen(sla.escrowAmount, 5)} GEN
          </strong>
          <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
            Created {formatTimestamp(sla.createdAt)}
          </span>
        </div>
      </div>

      {sla.state === "RESOLVED" ? (
        <div className="mt-4 grid gap-2 rounded-xl bg-muted/55 p-3 text-xs sm:grid-cols-3">
          <span>
            Verdict
            <strong className="mt-1 block">{sla.verdict || "—"}</strong>
          </span>
          <span>
            Evidence
            <strong className="mt-1 block">{sla.evidenceStatus || "—"}</strong>
          </span>
          <span>
            Provider award
            <strong className="mt-1 block">
              {formatGen(sla.providerAward, 5)} GEN
            </strong>
          </span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        {sla.state === "ACTIVE" && isProvider ? (
          <button
            type="button"
            disabled={busy}
            onClick={onEvidence}
            className="proofsla-action-primary"
          >
            Submit evidence
          </button>
        ) : null}

        {action ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(action.request)}
            className={
              action.label === "Cancel"
                ? "proofsla-action-secondary"
                : "proofsla-action-primary"
            }
          >
            {action.label}
          </button>
        ) : null}

        {sla.state === "COMPLETED" && isClient ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onAction({
                  label: `Adjudicate SLA #${sla.id.toString()}`,
                  functionName: "adjudicate",
                  args: [sla.id],
                })
              }
              className="proofsla-action-primary"
            >
              Adjudicate with validators
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const confirmed = window.confirm(
                  "Accept delivery without validator adjudication? This settles the SLA immediately as MET / CORROBORATED.",
                );

                if (!confirmed) return;

                onAction({
                  label: `Accept delivery for SLA #${sla.id.toString()}`,
                  functionName: "accept_delivery",
                  args: [sla.id],
                });
              }}
              className="proofsla-action-secondary"
            >
              Accept without review
            </button>

            <span className="basis-full text-[11px] font-semibold leading-5 text-muted-foreground">
              Adjudication verifies the submitted evidence through GenLayer
              consensus. Direct acceptance skips validator review and settles
              the delivery as MET.
            </span>
          </>
        ) : null}

        <div className="ml-auto text-[11px] font-semibold text-muted-foreground">
          Minor {formatBps(sla.minorProviderBps)} · Major{" "}
          {formatBps(sla.majorProviderBps)}
        </div>
      </div>
    </article>
  );
}

function StateBadge({ state }: { state: string }) {
  return (
    <span
      className={`proofsla-state-badge proofsla-state-${state.toLowerCase()}`}
    >
      {state}
    </span>
  );
}

function TransactionActivity({
  transactions,
  onClear,
}: {
  transactions: ReturnType<
    typeof useProofSlaTransactions
  >["transactions"];
  onClear: () => void;
}) {
  return (
    <div id="activity" className="dashboard-card scroll-mt-28">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Activity</p>
        {transactions.length ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-extrabold text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      {transactions.length === 0 ? (
        <p className="mt-4 text-xs font-medium leading-5 text-muted-foreground">
          Transactions from this session will appear here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex gap-3">
              <span
                className={`mt-1.5 size-2 shrink-0 rounded-full proofsla-tx-${tx.status}`}
              />
              <div className="min-w-0">
                <strong className="block truncate text-xs">{tx.label}</strong>
                <span className="mt-0.5 block text-[11px] font-semibold capitalize text-muted-foreground">
                  {tx.status.replace("_", " ")}
                </span>
                {tx.message ? (
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    {tx.message}
                  </p>
                ) : null}
                {tx.hash ? (
                  <a
                    href={`${PROOFSLA.explorerUrl}/transactions/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-primary"
                  >
                    {shortAddress(tx.hash, 6)}
                    <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyWallet({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="grid min-h-[300px] place-items-center text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-13 place-items-center rounded-2xl border border-border bg-muted/70">
          <Wallet className="size-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-extrabold">Connect your wallet</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Your client and provider agreements will load from Bradbury
          automatically.
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="mt-5 h-10 rounded-full bg-foreground px-5 text-xs font-extrabold text-background"
        >
          Connect wallet
        </button>
      </div>
    </div>
  );
}

function EmptySlas({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-[300px] place-items-center text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-13 place-items-center rounded-2xl border border-border bg-muted/70">
          <FileCheck2 className="size-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 font-extrabold">No agreements yet</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Create your first evidence-bound SLA or ask a client to use your
          connected address as provider.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-extrabold text-primary-foreground"
        >
          <Plus className="size-3.5" />
          Create SLA
        </button>
      </div>
    </div>
  );
}

function LoadingSlas() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted/55"
        />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid min-h-[300px] place-items-center text-center">
      <div className="max-w-sm">
        <TriangleAlert className="mx-auto size-6 text-destructive" />
        <h3 className="mt-4 font-extrabold">Could not read contract state</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          The app did not modify anything. Check your connection and retry.
        </p>
      </div>
    </div>
  );
}
