"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  size = "lg",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;

  const width =
    size === "xl" ? "max-w-3xl" : size === "md" ? "max-w-lg" : "max-w-2xl";

  return (
    <div className="proofsla-modal-backdrop" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proofsla-modal-title"
        className={`proofsla-modal-panel ${width}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-border/70 px-6 py-5">
          <div>
            <h2
              id="proofsla-modal-title"
              className="text-xl font-extrabold tracking-[-0.035em]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-sm font-medium leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border/70 transition hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
