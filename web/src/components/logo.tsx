import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(76,89,255,0.22)]">
        <span className="font-semibold tracking-[-0.08em]">PS</span>
      </span>
      <span className="text-[15px] font-extrabold tracking-[-0.035em]">
        ProofSLA
      </span>
    </Link>
  );
}
