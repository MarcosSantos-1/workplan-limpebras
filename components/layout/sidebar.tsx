"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CalendarHeart, FolderClock, ShieldCheck, Sofa, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ehAdmin, PAPEL_LABEL, STATUS_LABEL } from "@/lib/usuarios";
import { UserToolbar } from "@/components/motion-ui/user-toolbar";

type Item = { href: string; label: string; icon: LucideIcon; dot?: string; match?: "exact" | "prefix"; disabled?: boolean };

const principais: Item[] = [
  { href: "/", label: "Plano do dia", icon: CalendarDays, match: "exact" },
  { href: "/cronogramas", label: "Cronogramas salvos", icon: FolderClock },
  { href: "/feriados", label: "Feriados e calendário", icon: CalendarHeart },
];

const servicos: Item[] = [
  { href: "/gerador/go", label: "GO · Cata-bagulho", icon: Sofa, dot: "bg-emerald-500 shadow-emerald-500/40" },
  ...["CV", "CA", "LE", "NH", "LF", "VM", "MT", "BL", "VJ", "VL", "VP", "VF"].map((s) => ({
    href: `/gerador/${s.toLowerCase()}`,
    label: s,
    icon: Sofa,
    dot: "bg-zinc-400",
    disabled: true,
  })),
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { user, perfil, logout } = useAuth();
  const admin = ehAdmin(perfil);

  const ativo = (i: Item) =>
    i.match === "exact" ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`);

  const item = (i: Item, compact = false) => {
    const Icon = i.icon;
    const isActive = !i.disabled && ativo(i);
    const cls = cn(
      "group flex items-center gap-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200",
      compact ? "px-2.5 py-1.5" : "px-3 py-2.5",
      i.disabled
        ? "cursor-not-allowed border border-transparent text-muted-foreground/60 opacity-70"
        : isActive
          ? "bg-linear-to-r from-indigo-600/20 to-cyan-500/20 text-foreground border border-indigo-500/35 shadow-sm"
          : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground border border-transparent hover:border-violet-500/15",
    );
    const content = (
      <>
        {i.dot && <span className={cn("h-2 w-2 shrink-0 rounded-full shadow-sm", i.dot)} />}
        {!i.dot && <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", isActive && "text-blue-500")} />}
        <span className="truncate">{i.label}</span>
        {i.disabled && (
          <span className="ml-auto rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            Em breve
          </span>
        )}
      </>
    );
    return i.disabled ? (
      <span key={i.href} className={cls} aria-disabled="true">
        {content}
      </span>
    ) : (
      <Link key={i.href} href={i.href} className={cls}>
        {content}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "app-sidebar fixed left-0 top-0 z-40 h-screen border-r border-border/70 transition-all duration-300",
        "bg-linear-to-b from-blue-600/8 via-background to-cyan-600/5 dark:from-cyan-500/15 dark:via-background dark:to-cyan-500/10",
        "backdrop-blur-sm shadow-[0_0_50px_-25px_rgba(99,102,241,0.55)]",
        collapsed ? "w-0 -translate-x-full opacity-0 pointer-events-none" : "w-72 max-[1440px]:w-60",
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-24 items-start border-b border-border/70 px-6 pb-3 pt-8 max-[1440px]:h-20 max-[1440px]:px-4 max-[1440px]:pt-6">
          <Link href="/" className="ml-6 flex shrink-0 items-center max-[1440px]:ml-2" aria-label="Limpebras — início">
            <Image src="/logotipo.png" alt="Limpebras" width={180} height={48} className="h-10 w-auto object-contain dark:hidden" style={{ width: "auto" }} priority />
            <Image src="/logotipo-white.png" alt="Limpebras" width={230} height={55} className="hidden h-10 w-auto object-contain dark:block" style={{ width: "auto" }} priority />
          </Link>
        </div>

        <nav className="flex-1 min-h-0 space-y-1.5 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {principais.map((i) => item(i))}
          {admin && item({ href: "/acessos", label: "Acessos", icon: ShieldCheck })}
          <div className="rounded-2xl border border-border/60 bg-background/40 p-1.5 shadow-sm">
            <div className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Gerador de cronograma
            </div>
            <div className="space-y-0.5">{servicos.map((i) => item(i, true))}</div>
          </div>
        </nav>

        <div className="border-t border-border/70 bg-background/50 p-4">
          <UserToolbar
            displayName={perfil?.nome || user?.displayName || user?.email?.split("@")[0] || "Sem sessão"}
            username={user?.email || "—"}
            roleLabel={perfil ? PAPEL_LABEL[perfil.papel] : "—"}
            statusLabel={perfil ? STATUS_LABEL[perfil.status] : "—"}
            menuItems={admin ? [{ href: "/acessos", label: "Gerenciar acessos", icon: ShieldCheck }] : []}
            onLogout={() => void logout()}
          />
        </div>
      </div>
    </aside>
  );
}
