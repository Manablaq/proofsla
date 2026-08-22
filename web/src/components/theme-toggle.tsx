"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const currentTheme = resolvedTheme ?? theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={toggleTheme}
      className="group grid size-10 place-items-center rounded-full border border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted"
    >
      <Sun className="hidden size-4 transition-transform group-hover:rotate-12 dark:block" />
      <Moon className="size-4 transition-transform group-hover:-rotate-12 dark:hidden" />
    </button>
  );
}
