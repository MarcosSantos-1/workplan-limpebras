"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { GLASS_CARD } from "@/components/design/kit";
import { cn } from "@/lib/utils";

/** Fundo + cartão das telas de login / primeiro acesso / recuperação. */
export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <Image src="/login-bg.jpg" alt="" fill className="-z-10 object-cover" priority />
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-950/60 via-teal-900/40 to-cyan-950/60" />
      {children}
    </div>
  );
}

export function AuthCard({ titulo, subtitulo, children }: { titulo: string; subtitulo: ReactNode; children: ReactNode }) {
  return (
    <div className={cn("w-full max-w-sm space-y-5 rounded-2xl bg-card/90 p-8 backdrop-blur-md", GLASS_CARD)}>
      <div className="flex justify-center">
        <Image src="/logotipo.png" alt="Limpebras" width={180} height={48} className="h-10 w-auto dark:hidden" style={{ width: "auto" }} priority />
        <Image src="/logotipo-white.png" alt="Limpebras" width={180} height={48} className="hidden h-10 w-auto dark:block" style={{ width: "auto" }} priority />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold">{titulo}</h1>
        <div className="text-sm text-muted-foreground">{subtitulo}</div>
      </div>
      {children}
    </div>
  );
}

export function AuthErro({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{children}</p>;
}

export function AuthOk({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{children}</p>
  );
}
