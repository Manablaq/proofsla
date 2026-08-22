import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Check,
  CircleDollarSign,
  FileCheck2,
  Fingerprint,
  Gauge,
  LockKeyhole,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

const lifecycle = [
  {
    number: "01",
    title: "Create the SLA",
    copy: "Define the service, immutable success requirements, evidence freshness window and breach payout rules.",
  },
  {
    number: "02",
    title: "Provider accepts",
    copy: "The provider accepts the terms before work begins, creating an explicit onchain agreement.",
  },
  {
    number: "03",
    title: "Submit evidence",
    copy: "Primary and corroborating HTTPS evidence are bound to SHA-256 digests and an observation timestamp.",
  },
  {
    number: "04",
    title: "Validators adjudicate",
    copy: "GenLayer validators independently fetch, verify and reason over the evidence before consensus.",
  },
  {
    number: "05",
    title: "Settlement becomes deterministic",
    copy: "The agreed verdict maps to predefined provider and client awards, then each party can withdraw.",
  },
];

const evidenceFeatures: Array<{
  icon: LucideIcon;
  title: string;
  copy: string;
}> = [
  {
    icon: Fingerprint,
    title: "Digest-bound",
    copy: "Each evidence body must match its declared SHA-256 digest.",
  },
  {
    icon: RefreshCcw,
    title: "Validator refetch",
    copy: "Validators independently retrieve and verify evidence during adjudication.",
  },
  {
    icon: Blocks,
    title: "Two evidence references",
    copy: "Primary and corroborating references must use distinct HTTPS URLs.",
  },
  {
    icon: ShieldCheck,
    title: "Prompt isolation",
    copy: "Fetched evidence is explicitly framed as untrusted data before LLM reasoning.",
  },
];

const verdicts = [
  ["MET", "100%", "Provider"],
  ["MINOR BREACH", "Configured", "Split"],
  ["MAJOR BREACH", "Configured", "Split"],
  ["INSUFFICIENT", "100%", "Client"],
];

const securityFeatures: Array<[LucideIcon, string]> = [
  [LockKeyhole, "Terms persist onchain"],
  [BadgeCheck, "Evidence hashes persist"],
  [Scale, "Verdict and evidence status reach consensus"],
  [CircleDollarSign, "Withdrawals use pull-payment accounting"],
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <SiteHeader />

      <section className="relative min-h-[94svh] pt-36">
        <div className="hero-grid absolute inset-0 -z-20" />
        <div className="hero-glow absolute left-1/2 top-[-14rem] -z-10 h-[42rem] w-[58rem] max-w-[95vw] -translate-x-1/2 rounded-full blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                <Sparkles className="size-3.5" />
                Evidence-bound settlement on GenLayer
              </div>

              <h1 className="text-balance text-[clamp(3.4rem,8vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.075em]">
                Service promises,
                <span className="mt-1 block font-serif font-normal italic tracking-[-0.045em] text-primary">
                  made provable.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-pretty text-lg font-medium leading-8 text-muted-foreground md:text-xl">
                ProofSLA turns service-level agreements into evidence-bound
                settlements. Lock value, define measurable requirements,
                verify execution evidence and settle through GenLayer
                consensus.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-extrabold text-background shadow-lg transition hover:-translate-y-0.5"
                >
                  Launch ProofSLA
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border/80 bg-background/70 px-6 text-sm font-extrabold backdrop-blur transition hover:bg-muted"
                >
                  See how it works
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-muted-foreground">
                {["Immutable SLA terms", "Hash-bound evidence", "Validator consensus"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto w-full max-w-[590px]">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl" />
              <div className="premium-panel overflow-hidden rounded-[2rem] p-3">
                <div className="rounded-[1.55rem] border border-border/60 bg-card/90 p-5 shadow-2xl md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Active agreement</p>
                      <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em]">
                        API execution SLA
                      </h2>
                    </div>
                    <span className="status-pill status-active">ACTIVE</span>
                  </div>

                  <div className="mt-8 rounded-2xl border border-border/60 bg-muted/45 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Success requirement
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6">
                      Return HTTP 200 and response body containing the agreed
                      success marker.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="metric-card">
                      <FileCheck2 className="size-5 text-primary" />
                      <div>
                        <span>Evidence</span>
                        <strong>2 records bound</strong>
                      </div>
                    </div>
                    <div className="metric-card">
                      <Gauge className="size-5 text-primary" />
                      <div>
                        <span>Freshness</span>
                        <strong>24-hour window</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted-foreground">
                        Agreement lifecycle
                      </span>
                      <span>2 / 4</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/2 rounded-full bg-primary" />
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-1 text-center text-[10px] font-extrabold tracking-wide text-muted-foreground">
                      <span>CREATED</span>
                      <span className="text-primary">ACTIVE</span>
                      <span>COMPLETED</span>
                      <span>RESOLVED</span>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/10 p-4">
                    <ShieldCheck className="size-5 shrink-0 text-primary" />
                    <p className="text-xs font-semibold leading-5 text-muted-foreground">
                      Settlement logic is defined before execution, not after a
                      dispute begins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-2 border-y border-border/60 px-5 sm:grid-cols-4 md:px-8 lg:px-10">
          {[
            ["2", "Evidence records"],
            ["4", "Verdict classes"],
            ["SHA-256", "Digest binding"],
            ["Bradbury", "Live network"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border-border/60 px-3 py-7 first:border-l sm:border-r"
            >
              <strong className="block text-xl font-extrabold tracking-[-0.04em]">
                {value}
              </strong>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="section-shell">
        <Reveal>
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>
              From service promise to
              <span className="font-serif font-normal italic text-primary">
                {" "}
                verifiable outcome.
              </span>
            </h2>
            <p>
              Every important decision is defined before execution: terms,
              evidence requirements, breach severity and payout logic.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-3">
          {lifecycle.map((item, index) => (
            <Reveal key={item.number} delay={index * 0.04}>
              <div className="group grid gap-5 rounded-3xl border border-border/70 bg-card/60 p-6 transition hover:border-primary/25 hover:bg-card md:grid-cols-[90px_1fr_1.35fr] md:items-center md:p-8">
                <span className="font-serif text-4xl italic text-primary/70">
                  {item.number}
                </span>
                <h3 className="text-xl font-extrabold tracking-[-0.035em]">
                  {item.title}
                </h3>
                <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="evidence" className="section-shell">
        <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="eyebrow">Evidence architecture</p>
              <h2 className="section-title">
                Evidence is treated as
                <span className="font-serif font-normal italic text-primary">
                  {" "}
                  untrusted data.
                </span>
              </h2>
              <p className="section-copy">
                ProofSLA does not ask validators to blindly trust a webpage.
                Evidence references are hash-bound, independently fetched and
                checked before reasoning occurs.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {evidenceFeatures.map(({ icon: Icon, title, copy }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <article className="feature-card">
                  <span className="feature-icon">
                    <Icon className="size-5" />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="settlement" className="section-shell">
        <Reveal>
          <div className="section-heading">
            <p className="eyebrow">Deterministic settlement</p>
            <h2>
              AI reasons about evidence.
              <span className="font-serif font-normal italic text-primary">
                {" "}
                Code controls the money.
              </span>
            </h2>
            <p>
              Validator consensus determines the verdict class. The contract
              then applies payout rules that were already agreed by the
              parties.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-hidden rounded-[2rem] border border-border/70 bg-card/70">
            <div className="grid grid-cols-[1.35fr_.8fr_.8fr] border-b border-border/70 bg-muted/45 px-5 py-4 text-xs font-extrabold uppercase tracking-[0.1em] text-muted-foreground md:px-8">
              <span>Verdict</span>
              <span>Payout</span>
              <span>Recipient</span>
            </div>
            {verdicts.map(([verdict, payout, recipient]) => (
              <div
                key={verdict}
                className="grid grid-cols-[1.35fr_.8fr_.8fr] items-center border-b border-border/60 px-5 py-5 last:border-b-0 md:px-8"
              >
                <span className="text-xs font-extrabold tracking-[0.05em] md:text-sm">
                  {verdict}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {payout}
                </span>
                <span className="text-sm font-bold">{recipient}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="security" className="section-shell">
        <div className="security-panel grid gap-10 overflow-hidden rounded-[2.5rem] p-7 md:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-14">
          <Reveal>
            <div>
              <p className="eyebrow text-primary-foreground/60">
                Designed for accountable automation
              </p>
              <h2 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] text-primary-foreground md:text-5xl">
                Trust the process,
                <span className="font-serif font-normal italic">
                  {" "}
                  verify the proof.
                </span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid gap-3 sm:grid-cols-2">
              {securityFeatures.map(([Icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm font-bold text-primary-foreground/85"
                >
                  <Icon className="size-5 shrink-0 text-white" />
                  {text}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-shell pb-28">
        <Reveal>
          <div className="rounded-[2.5rem] border border-border/70 bg-card px-6 py-16 text-center shadow-sm md:px-12">
            <p className="eyebrow">Ready when the evidence is</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1] tracking-[-0.055em] md:text-6xl">
              Build agreements that know
              <span className="font-serif font-normal italic text-primary">
                {" "}
                how to settle.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm font-medium leading-7 text-muted-foreground md:text-base">
              Create an SLA, lock settlement value and follow every stage from
              acceptance to evidence-backed resolution.
            </p>
            <Link
              href="/app"
              className="group mx-auto mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-sm font-extrabold text-background transition hover:-translate-y-0.5"
            >
              Launch ProofSLA
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>ProofSLA · Evidence-bound service settlement</span>
          <span>Built on GenLayer · Bradbury Testnet</span>
        </div>
      </footer>
    </main>
  );
}
