"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Modal } from "@/components/proofsla/modal";
import { useProofSlaTransactions } from "@/components/proofsla/transaction-provider";
import { useWallet } from "@/components/proofsla/wallet-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAddress, parseGen, sameAddress } from "@/lib/proofsla/format";

const schema = z
  .object({
    provider: z
      .string()
      .refine((value) => Boolean(isAddress(value)), "Enter a valid 0x provider address."),
    serviceDescription: z
      .string()
      .min(8, "Describe the service in at least 8 characters.")
      .max(500, "Keep the service description under 500 characters."),
    requirements: z
      .string()
      .min(12, "Define measurable requirements in at least 12 characters.")
      .max(2_000, "Keep requirements under 2,000 characters."),
    escrowGen: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          return parseGen(value) > BigInt(0);
        } catch {
          return false;
        }
      }, "Enter a positive GEN escrow amount."),
    minorPercent: z.coerce.number().min(0).max(100),
    majorPercent: z.coerce.number().min(0).max(100),
    maxEvidenceAgeHours: z.coerce.number().min(1).max(24 * 365),
  })
  .refine((value) => value.majorPercent <= value.minorPercent, {
    path: ["majorPercent"],
    message: "Major-breach provider payout cannot exceed minor-breach payout.",
  });

type FormValues = z.infer<typeof schema>;

export function CreateSlaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wallet = useWallet();
  const { execute, isWriting } = useProofSlaTransactions();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceDescription: "",
      requirements: "",
      escrowGen: "",
      minorPercent: 80,
      majorPercent: 20,
      maxEvidenceAgeHours: 24,
    },
  });

  const submit = handleSubmit(async (values) => {
    if (!wallet.address) {
      await wallet.connect();
      return;
    }

    if (sameAddress(wallet.address, values.provider)) {
      setError("provider", {
        message: "Client and provider must be different addresses.",
      });
      return;
    }

    await execute({
      label: "Create SLA",
      functionName: "create_sla",
      args: [
        values.provider,
        values.serviceDescription.trim(),
        values.requirements.trim(),
        Math.round(values.minorPercent * 100),
        Math.round(values.majorPercent * 100),
        Math.round(values.maxEvidenceAgeHours * 60 * 60),
      ],
      value: parseGen(values.escrowGen),
    });

    reset();
    onClose();
  });

  const busy = isSubmitting || isWriting;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a service SLA"
      description="Terms and settlement rules become immutable once the provider accepts."
      size="xl"
    >
      <form onSubmit={submit} className="space-y-6">
        <Field
          htmlFor="provider"
          label="Provider address"
          error={errors.provider?.message}
        >
          <Input
            id="provider"
            placeholder="0x…"
            autoComplete="off"
            {...register("provider")}
          />
        </Field>

        <Field
          htmlFor="service-description"
          label="Service description"
          error={errors.serviceDescription?.message}
        >
          <Input
            id="service-description"
            placeholder="Example: Production API execution"
            {...register("serviceDescription")}
          />
        </Field>

        <Field
          htmlFor="requirements"
          label="Measurable requirements"
          error={errors.requirements?.message}
          hint="Be objective. Validators reason over these exact requirements."
        >
          <Textarea
            id="requirements"
            rows={5}
            placeholder="Example: Return HTTP 200 and include the exact success marker…"
            {...register("requirements")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="escrow-gen"
            label="Escrow (GEN)"
            error={errors.escrowGen?.message}
            hint="Enter the amount intentionally; ProofSLA does not prefill an escrow value."
          >
            <Input
              id="escrow-gen"
              inputMode="decimal"
              placeholder="0.01"
              {...register("escrowGen")}
            />
          </Field>
          <Field
            htmlFor="evidence-freshness"
            label="Evidence freshness (hours)"
            error={errors.maxEvidenceAgeHours?.message}
          >
            <Input
              id="evidence-freshness"
              type="number"
              min="1"
              {...register("maxEvidenceAgeHours", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="minor-provider-payout"
            label="Provider payout — minor breach (%)"
            error={errors.minorPercent?.message}
          >
            <Input
              id="minor-provider-payout"
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register("minorPercent", { valueAsNumber: true })}
            />
          </Field>
          <Field
            htmlFor="major-provider-payout"
            label="Provider payout — major breach (%)"
            error={errors.majorPercent?.message}
          >
            <Input
              id="major-provider-payout"
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register("majorPercent", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4 text-xs font-semibold leading-5 text-muted-foreground">
          MET pays the provider 100%. Insufficient evidence refunds the client
          100%. The two breach percentages above define the provider share for
          MINOR_BREACH and MAJOR_BREACH.
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
            {wallet.address ? "Create & lock GEN" : "Connect wallet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  htmlFor,
  label,
  error,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-xs font-medium leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-bold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
