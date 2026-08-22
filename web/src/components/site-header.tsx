"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Evidence", href: "#evidence" },
  { label: "Settlement", href: "#settlement" },
  { label: "Security", href: "#security" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-[0_12px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl md:px-5">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/app"
            className="hidden h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-bold text-background transition hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex"
          >
            Launch app
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            className="grid size-10 place-items-center rounded-full border border-border/70 md:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="mt-2 flex h-11 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background"
            >
              Launch app
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
