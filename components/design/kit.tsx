"use client";

/** Peças visuais do ADC Design Kit usadas no WorkPlan. */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const GLASS_CARD =
  "border border-border bg-card shadow-lg shadow-zinc-900/[0.06] dark:border-white/10 dark:bg-muted/60 dark:shadow-black/40";

export const BTN_EMERALD =
  "bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/10 border-0 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]";
export const BTN_SKY =
  "bg-linear-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500 shadow-md shadow-blue-950/10 border-0 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]";
export const BTN_AMBER =
  "bg-linear-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-md shadow-orange-950/10 border-0 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]";
export const BTN_RED =
  "bg-linear-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-rose-950/10 border-0 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]";
export const BTN_SECONDARY =
  "bg-linear-to-r from-zinc-200 to-slate-300 dark:from-zinc-800 dark:to-slate-700 text-zinc-800 dark:text-zinc-200 hover:from-zinc-300 hover:to-slate-400 dark:hover:from-zinc-700/80 dark:hover:to-slate-600/80 shadow-sm border-0 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]";

/** Cabeçalho de página verde com ícone em quadrado (estilo "Explicação"). */
export function PageHero({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 shadow-xl shadow-emerald-900/35 sm:p-8 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950 dark:shadow-2xl dark:shadow-black/45">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-teal-400/15 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-teal-950 shadow-lg" aria-hidden>
            <Icon className="h-9 w-9 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
            <div className="mt-2 max-w-3xl text-base text-emerald-50 sm:text-lg">{subtitle}</div>
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

/** Card de indicador neutro. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: "emerald" | "sky" | "amber" | "violet" | "rose";
}) {
  const tones = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  };
  return (
    <div className={cn("rounded-xl p-4", GLASS_CARD)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/** Título de seção dentro de card. */
export function SectionTitle({ icon: Icon, title, desc, right }: { icon: LucideIcon; title: string; desc?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {desc && <div className="text-sm text-muted-foreground">{desc}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

export const SUB_CORES: Record<string, string> = {
  CV: "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300",
  JT: "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300",
  MG: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  ST: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
};

export function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</div>
      {hint && <div className="text-[11px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}
