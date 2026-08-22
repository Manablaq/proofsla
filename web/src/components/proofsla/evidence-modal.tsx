"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";

import { Modal } from "@/components/proofsla/modal";
import { useProofSlaTransactions } from "@/components/proofsla/transaction-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SlaRecord } from "@/lib/proofsla/types";

const sha = /^[0-9a-fA-F]{64}$/;

const schema = z
  .object({
    primaryUrl: z
      .string()
      .url()
      .refine((value) => value.startsWith("https://"), "Use an HTTPS URL."),
    primarySha: z
      .string()
      .regex(sha, "Enter the 64-character SHA-256 digest."),
    corroborationUrl: z
      .string()
      .url()
      .refine((value) => value.startsWith("https://"), "Use an HTTPS URL."),
    corroborationSha: z
      .string()
      .regex(sha, "Enter the 64-character SHA-256 digest."),
    observedAt: z.string().min(1, "Choose the evidence observation time."),
  })
  .refine((value) => value.primaryUrl !== value.corroborationUrl, {
    path: ["corroborationUrl"],
    message: "Primary and corroboration URLs must be different.",
  });

type FormValues = z.infer<typeof schema>;

function defaultObservedAt() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export function EvidenceModal({
  sla,
  open,
  onClose,
}: {
  sla: SlaRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  const { execute, isWriting } = useProofSlaTransactions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryUrl: "",
      primarySha: "",
      corroborationUrl: "",
      corroborationSha: "",
      observedAt: defaultObservedAt(),
    },
  });

  if (!sla) return null;

  const submit = handleSubmit(async (values) => {
    const observedAt = Math.floor(new Date(values.observedAt).getTime() / 1000);

    if (!Number.isFinite(observedAt)) {
      throw new Error("Invalid evidence observation time.");
    }

    await execute({
      label: `Submit evidence for SLA #${sla.id.toString()}`,
      functionName: "submit_delivery_evidence",
      args: [
        sla.id,
        values.primaryUrl.trim(),
        values.primarySha.trim(),
        values.corroborationUrl.trim(),
        values.corroborationSha.trim(),
        observedAt,
      ],
    });

    reset({
      primaryUrl: "",
      primarySha: "",
      corroborationUrl: "",
      corroborationSha: "",
      observedAt: defaultObservedAt(),
    });
    onClose();
  });

  const busy = isSubmitting || isWriting;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Submit evidence · SLA #${sla.id.toString()}`}
      description="Both bodies are re-fetched and hash-verified by validators during adjudication."
      size="xl"
    >
      <form onSubmit={submit} className="space-y-6">
        <EvidenceField
          prefix="primary"
          title="Primary evidence"
          urlError={errors.primaryUrl?.message}
          hashError={errors.primarySha?.message}
          urlProps={register("primaryUrl")}
          hashProps={register("primarySha")}
        />

        <div className="border-t border-border/70" />

        <EvidenceField
          prefix="corroboration"
          title="Corroborating evidence"
          urlError={errors.corroborationUrl?.message}
          hashError={errors.corroborationSha?.message}
          urlProps={register("corroborationUrl")}
          hashProps={register("corroborationSha")}
        />

        <div className="space-y-2">
          <Label htmlFor="evidence-observed-at">Observed at</Label>
          <Input
            id="evidence-observed-at"
            type="datetime-local"
            {...register("observedAt")}
          />
          {errors.observedAt?.message ? (
            <p className="text-xs font-bold text-destructive">
              {errors.observedAt.message}
            </p>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">
              This timestamp is checked against the SLA freshness window.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full border border-border px-5 text-sm font-extrabold transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Submit bound evidence
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EvidenceField({
  prefix,
  title,
  urlError,
  hashError,
  urlProps,
  hashProps,
}: {
  prefix: "primary" | "corroboration";
  title: string;
  urlError?: string;
  hashError?: string;
  urlProps: UseFormRegisterReturn;
  hashProps: UseFormRegisterReturn;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-extrabold">{title}</legend>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-evidence-url`}>HTTPS URL</Label>
        <Input
          id={`${prefix}-evidence-url`}
          placeholder="https://…"
          {...urlProps}
        />
        {urlError ? (
          <p className="text-xs font-bold text-destructive">{urlError}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-evidence-sha256`}>SHA-256</Label>
        <Input
          id={`${prefix}-evidence-sha256`}
          placeholder="64 hexadecimal characters"
          className="font-mono text-xs"
          {...hashProps}
        />
        {hashError ? (
          <p className="text-xs font-bold text-destructive">{hashError}</p>
        ) : null}
      </div>
    </fieldset>
  );
}
