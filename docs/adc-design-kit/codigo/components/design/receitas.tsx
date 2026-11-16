"use client";

/**
 * RECEITAS — blocos visuais do ADC Control prontos para copiar.
 * As classes são cópia 1:1 das telas de referência:
 *   - Dashboard (/)                       → PageHeroDashboard, KpiGradientCard
 *   - IPT > Bateria > Trocas de Bateria    → SectionHeader, HeroTotal, StatCardSolid, StatCardProgress,
 *                                            RankingCard, DiagnosticoCard, ListagemCard, ExpandedStat, HistStat
 *   - /indicadores/explicacao              → PageHeroExplicacao, FormulaBox, MemoriaBox, ResultadoBox, ScoreTable
 *
 * Dependências: tailwindcss v4, lucide-react, ./bateria-ui (botões/tooltip/badges), @/components/ui/*.
 * Os dados aqui são de exemplo — troque pelos seus.
 */

import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  BatteryCharging,
  CheckCircle2,
  CheckSquare,
  ChartPie,
  Download,
  LayoutDashboard,
  Percent,
  Repeat,
  Search,
  ShieldCheck,
  Table2,
  Trophy,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BTN_SECONDARY, GLASS_CARD, InfoTooltip } from "./bateria-ui";

/* =====================================================================
 * 1) CABEÇALHOS DE PÁGINA
 * ===================================================================== */

/** Cabeçalho fixo de módulo (aba Bateria): ícone colorido + título + subtítulo; ações à direita. */
export function SectionHeader({
  icon: Icon = Activity,
  title,
  subtitle,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-emerald-500" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
}

/** Hero do Dashboard: card claro (escuro com gradiente ciano no dark), grade + bolhas desfocadas. */
export function PageHeroDashboard({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow-xl shadow-zinc-900/12 dark:bg-linear-to-br dark:from-cyan-950/50 dark:via-zinc-900/60 dark:to-zinc-950 dark:shadow-2xl dark:shadow-black/40">
      <div className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full bg-linear-to-br from-primary/25 to-indigo-500/20 blur-3xl dark:from-cyan-500/20 dark:to-indigo-600/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-linear-to-tr from-cyan-400/20 to-transparent blur-2xl dark:from-cyan-600/15 dark:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:bg-linear-to-r dark:from-primary dark:to-indigo-400 dark:bg-clip-text dark:text-transparent">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {right ?? (
            <>
              <span className="select-none bg-linear-to-br from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text pr-8 text-3xl font-bold tracking-tight text-transparent dark:from-sky-400 dark:via-cyan-400 dark:to-emerald-400">
                Novembro de 2026
              </span>
              <div className="relative flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 via-indigo-500/12 to-cyan-500/15 shadow-md shadow-slate-900/10 dark:from-primary/25 dark:via-indigo-500/20 dark:to-cyan-950/40 dark:shadow-lg dark:shadow-black/30">
                <LayoutDashboard className="h-11 w-11 text-primary" strokeWidth={1.5} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Hero da Explicação: bloco verde sólido com ícone em quadrado teal e botão branco. */
export function PageHeroExplicacao({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 shadow-xl shadow-emerald-900/35 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950 dark:shadow-2xl dark:shadow-black/45">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-teal-950 shadow-lg" aria-hidden>
            <ChartPie className="h-11 w-11 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-lg text-emerald-50">{subtitle}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50">
          <Download className="h-4 w-4" /> Baixar PDF
        </button>
      </div>
    </div>
  );
}

/* =====================================================================
 * 2) CARDS DE INDICADOR
 * ===================================================================== */

/** Paletas dos 4 cards grandes do Dashboard (gradiente animado + brilho + grade). */
export const KPI_GRADIENTS = {
  azul: "border-blue-400/20 from-blue-700 via-indigo-600 to-cyan-600 shadow-blue-500/25 animate-[gradient_6s_ease_infinite] dark:from-blue-900 dark:via-blue-800 dark:to-blue-950 dark:border-blue-900/50 dark:hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]",
  verde: "border-emerald-400/20 from-emerald-700 via-teal-600 to-emerald-500 shadow-emerald-500/25 animate-[gradient_7s_ease_infinite] dark:from-emerald-900 dark:via-emerald-800 dark:to-emerald-950 dark:border-emerald-900/50 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  laranja: "border-amber-400/20 from-amber-600 via-orange-500 to-rose-500 shadow-amber-500/25 animate-[gradient_8s_ease_infinite] dark:from-amber-900 dark:via-amber-800 dark:to-amber-950 dark:border-amber-900/50 dark:hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  roxo: "border-purple-400/20 from-violet-700 via-purple-600 to-fuchsia-600 shadow-purple-500/25 animate-[gradient_6.5s_ease_infinite] dark:from-violet-900 dark:via-purple-800 dark:to-purple-950 dark:border-purple-900/50 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
} as const;

/** Card de KPI do Dashboard (IA/IRD/IF/IPT). Precisa dos @keyframes gradient e shimmer do globals.css. */
export function KpiGradientCard({
  title,
  subvalue,
  value,
  cor = "azul",
}: {
  title: string;
  subvalue: string;
  value: string;
  cor?: keyof typeof KPI_GRADIENTS;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[160px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-linear-to-br bg-[length:200%_200%] p-4 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:text-card-foreground dark:shadow-md",
        KPI_GRADIENTS[cor],
      )}
    >
      {/* brilho varrendo */}
      <div className="pointer-events-none absolute inset-0 animate-[shimmer_4s_linear_infinite] bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.18)_50%,transparent_65%)] bg-[length:200%_100%]" />
      {/* textura de grade */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      <p className="relative z-10 text-sm font-medium text-white/95">{title}</p>
      <div className="relative z-10">
        <div className="mb-1 text-lg font-semibold text-white/85">{subvalue}</div>
        <div className="text-4xl font-bold tracking-tight text-white drop-shadow-md">{value}</div>
      </div>
    </div>
  );
}

/**
 * Hero "total" (aba Trocas): número gigante à esquerda + 3 sub-cards de vidro à direita.
 * Paleta oficial: emerald → teal → cyan-950.
 */
export function HeroTotal({
  label = "Trocas de Bateria",
  title = "Total de trocas realizadas",
  total = 341,
  nota = "Trocas registradas no painel · 31 agendada(s) em aberto.",
  subcards = [
    { label: "Preventivas", value: 120, tip: "Baterias Críticas (1%-14%) ou\nBaixas (15%-29%)", Icon: ShieldCheck, cor: "text-sky-200/95" },
    { label: "Corretivas", value: 186, tip: "Baterias Desatualizadas\n(Sem comunicação)", Icon: AlertTriangle, cor: "text-amber-200/95" },
    { label: "Desnecessárias", value: 0, tip: "Trocas feitas em baterias ainda\nem bom estado", Icon: XCircle, cor: "text-rose-200/95" },
  ],
}: {
  label?: string;
  title?: string;
  total?: number | string;
  nota?: string;
  subcards?: Array<{ label: string; value: number | string; tip: string; Icon: LucideIcon; cor: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-linear-to-br from-emerald-600/95 via-teal-700 to-cyan-950 px-6 py-8 shadow-xl shadow-teal-950/30 ring-1 ring-white/15 sm:px-8">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-teal-400/15 blur-3xl dark:bg-emerald-500/25" aria-hidden />
      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-stretch xl:justify-between xl:gap-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-emerald-100/95">
            <Repeat className="size-9 shrink-0 text-white opacity-95" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/85">{label}</p>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
          </div>
          <p className="mt-6 text-center text-[clamp(3rem,8vw,4.25rem)] font-bold leading-none tracking-tight text-white tabular-nums drop-shadow-sm sm:text-left">
            {total}
          </p>
          <p className="mt-3 text-xs text-emerald-100/85">{nota}</p>
        </div>
        <div className="grid min-w-[220px] flex-1 grid-cols-1 gap-4 sm:grid-cols-3 xl:max-w-2xl">
          {subcards.map(({ label: l, value, tip, Icon, cor }) => (
            <div key={l} className="flex flex-col justify-between rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">{l}</p>
                <InfoTooltip text={tip}>
                  <Icon className={cn("size-6 shrink-0 cursor-help", cor)} aria-hidden />
                </InfoTooltip>
              </div>
              <p className="mt-4 font-mono text-3xl font-bold text-white tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Card de indicador sólido (verde = positivo, vermelho = negativo). */
export function StatCardSolid({
  title,
  value,
  note,
  tip,
  tom = "verde",
}: {
  title: string;
  value: number | string;
  note: string;
  tip?: string;
  tom?: "verde" | "vermelho";
}) {
  const Icon = tom === "verde" ? CheckCircle2 : XCircle;
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 text-white shadow-xl",
        tom === "verde"
          ? "bg-linear-to-br from-emerald-600 to-emerald-900 shadow-emerald-900/25"
          : "bg-linear-to-br from-rose-600 to-red-900 shadow-red-900/25",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-white/95">{title}</CardTitle>
        {tip ? (
          <InfoTooltip text={tip}>
            <Icon className="size-5 shrink-0 cursor-help text-white/85" />
          </InfoTooltip>
        ) : (
          <Icon className="size-5 shrink-0 text-white/85" />
        )}
      </CardHeader>
      <CardContent>
        <div className="font-mono text-4xl font-bold text-white tabular-nums">{value}</div>
        <p className="mt-2 text-sm font-medium text-white/90">{note}</p>
      </CardContent>
    </Card>
  );
}

/** Card neutro (vidro) com percentual grande e barra de progresso. */
export function StatCardProgress({
  title,
  pct,
  tom = "emerald",
  Icon = Percent,
}: {
  title: string;
  pct: number;
  tom?: "emerald" | "sky";
  Icon?: LucideIcon;
}) {
  const cores =
    tom === "emerald"
      ? { txt: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", ico: "text-emerald-500" }
      : { txt: "text-sky-600 dark:text-sky-400", bar: "bg-sky-500", ico: "text-sky-500" };
  return (
    <Card className={cn("border-border/50 shadow-sm backdrop-blur-sm", GLASS_CARD)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("size-5 shrink-0", cores.ico)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-4xl font-bold tabular-nums", cores.txt)}>{pct}%</div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", cores.bar)} style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

/** Linha de 4 indicadores como na aba Trocas. */
export function LinhaIndicadores() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardSolid title="Trocas com Sucesso" value={213} note="Sinal e bateria restabelecidos" tom="verde" />
      <StatCardSolid title="Trocas sem Sucesso" value={128} note="Permaneceram desatualizados" tom="vermelho" />
      <StatCardProgress title="Acertividade" pct={62} tom="emerald" Icon={Percent} />
      <StatCardProgress title="Média Bateria" pct={67} tom="sky" Icon={BatteryCharging} />
    </div>
  );
}

/* =====================================================================
 * 3) RANKING + DIAGNÓSTICO
 * ===================================================================== */

export function RankingCard({ rows }: { rows: Array<{ sub: string; setor: string; trocas: number; manut: number; duracao?: number | null }> }) {
  return (
    <Card className={cn("border-border/50 shadow-sm backdrop-blur-sm", GLASS_CARD)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Trophy className="h-5 w-5 text-amber-500" /> Ranking de Trocas
        </CardTitle>
        <CardDescription>Setores com maior quantidade de trocas</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/25 hover:bg-muted/25">
              <TableHead className="w-8">#</TableHead>
              <TableHead>Sub</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="text-center">Trocas</TableHead>
              <TableHead className="text-center">Manut.</TableHead>
              <TableHead className="text-center">Duração Bat.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.setor} className="border-border/30 hover:bg-muted/20">
                <TableCell className="font-bold text-muted-foreground tabular-nums">{i + 1}</TableCell>
                <TableCell className="font-medium">{r.sub}</TableCell>
                <TableCell className="font-mono text-xs sm:text-sm">{r.setor}</TableCell>
                <TableCell className="text-center font-bold text-emerald-600 tabular-nums dark:text-emerald-400">{r.trocas}</TableCell>
                <TableCell className="text-center text-muted-foreground tabular-nums">{r.manut}</TableCell>
                <TableCell className="text-center text-sky-600 tabular-nums dark:text-sky-400">{r.duracao != null ? `${r.duracao}d` : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/** Barras de diagnóstico: cabeçalhos verde/vermelho sólidos + linhas com valor colorido e nota lateral. */
export function DiagnosticoCard({
  linhas = [
    { kind: "head-green", label: "COM SINAL", value: 188 },
    { kind: "value", label: "B/ ALTA", value: 45, note: ">70%", text: "text-emerald-600 dark:text-emerald-400" },
    { kind: "value", label: "B/ REGULAR", value: 118, note: ">30%", text: "text-orange-600 dark:text-orange-400" },
    { kind: "value", label: "B/ BAIXA", value: 16, note: ">15%", text: "text-blue-600 dark:text-blue-400" },
    { kind: "value", label: "B/ CRÍTICA", value: 11, note: "<14%", text: "text-red-600 dark:text-red-500" },
    { kind: "head-red", label: "SEM SINAL", value: 174 },
    { kind: "value", label: "B/ DESATUALIZADA", value: 175, text: "text-red-600 dark:text-red-500" },
  ],
}: {
  linhas?: Array<{ kind: "head-green" | "head-red" | "value"; label: string; value: number; note?: string; text?: string }>;
}) {
  return (
    <Card className={cn("border-border/50 shadow-sm backdrop-blur-sm", GLASS_CARD)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Battery className="h-5 w-5 text-emerald-500" /> Diagnóstico de Baterias em operação
        </CardTitle>
        <CardDescription>Distribuição por sinal e nível de bateria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {linhas.map((row, i) => {
            const head = row.kind !== "value";
            const headBg = row.kind === "head-green" ? "bg-emerald-700" : "bg-red-600";
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="grid flex-1 grid-cols-[minmax(0,1fr)_72px] overflow-hidden rounded-md border border-border/60">
                  <div className={cn("px-3 py-2 text-xs font-semibold", head ? cn(headBg, "font-bold uppercase tracking-wide text-white") : "bg-muted/20 text-foreground")}>
                    {row.label}
                  </div>
                  <div className={cn("border-l px-3 py-2 text-right text-sm font-bold tabular-nums", head ? cn(headBg, "border-white/25 text-white") : cn("border-border/60", row.text))}>
                    {row.value}
                  </div>
                </div>
                <div className="w-10 shrink-0 text-[11px] font-semibold text-muted-foreground">{row.note ?? ""}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* =====================================================================
 * 4) LISTAGEM (tabela principal com filtros e ações)
 * ===================================================================== */

/**
 * Esqueleto da "Listagem Geral": título com ícone, ações à direita,
 * barra de filtros (busca 200px + selects h-9) e tabela em moldura arredondada.
 */
export function ListagemCard({ children, filtros }: { children: ReactNode; filtros?: ReactNode }) {
  return (
    <Card className={cn("border-border/50 shadow-sm backdrop-blur-sm", GLASS_CARD)}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Table2 className="h-5 w-5 text-emerald-500" /> Listagem Geral de Setores
            </CardTitle>
            <CardDescription>Base para seleção e agendamento</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className={cn("h-9 gap-1.5", BTN_SECONDARY)}>
              <Download className="h-4 w-4" /> Exportar Excel
            </Button>
            <Button size="sm" className={cn("h-9 gap-1.5", BTN_SECONDARY)}>
              <CheckSquare className="h-4 w-4" /> Selecionar
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar setor..." className="h-9 pl-9" />
          </div>
          {filtros /* MultiSelect compact / Select h-9 com ícone à esquerda */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl bg-muted/15 shadow-sm ring-1 ring-zinc-200/80 dark:ring-zinc-700/60">
          {/* <Table className="[&_tbody_tr]:border-b [&_tbody_tr]:border-border/30 [&_thead_tr]:border-b [&_thead_tr]:border-border/30">
                <TableHeader><TableRow className="bg-muted/25 hover:bg-muted/25 [&>th]:h-16"> ...
                Linha clicável: className="border-border/30 hover:bg-muted/20"; expandida: EXPANDED_ROW
                Linha de detalhe: className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/5" */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/** Mini-card da linha expandida. */
export function ExpandedStat({ label, value, big }: { label: string; value: ReactNode; big?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className={cn("mt-1 block text-foreground", big ? "text-xl font-bold tabular-nums" : "font-semibold")}>{value}</span>
    </div>
  );
}

/** Célula "antes/depois" do histórico (rótulo em caps 10px). */
export function HistStat({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className="rounded-md bg-background/70 p-2">
      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("font-bold text-foreground", className)}>{value}</span>
    </div>
  );
}

/* =====================================================================
 * 5) BLOCOS DE DOCUMENTO (Explicação dos cálculos)
 * ===================================================================== */

export function FormulaBox({ children }: { children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">Fórmula</h3>
      <div className="rounded-lg bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-900">{children}</div>
    </div>
  );
}

export function MemoriaBox({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <h3 className="mb-2 text-sm font-semibold">{titulo}</h3>
      <p className="whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-200">{children}</p>
    </div>
  );
}

export function ResultadoBox({ titulo, children, pontos }: { titulo: string; children: ReactNode; pontos: string }) {
  return (
    <div className="space-y-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <p className="text-sm text-zinc-700 dark:text-zinc-200">{children}</p>
      <p className="text-sm">
        Pontuação: <strong className="text-violet-600 dark:text-violet-300">{pontos}</strong>
      </p>
    </div>
  );
}

/** Tabela de faixas com a linha atingida destacada em verde. */
export function ScoreTable({ linhas, ativa }: { linhas: Array<[string, string, string]>; ativa: number }) {
  const cell = "border border-zinc-300 p-2 dark:border-zinc-700";
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            <th className={cn(cell, "text-left")}>Faixa</th>
            <th className={cn(cell, "text-center")}>Pontuação</th>
            <th className={cn(cell, "text-left")}>Interpretação</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(([faixa, pts, interp], i) => (
            <tr key={faixa} className={i === ativa ? "bg-green-50 dark:bg-green-900/20" : ""}>
              <td className={cell}>{faixa}</td>
              <td className={cn(cell, "text-center font-bold", i === ativa && "text-green-600 dark:text-green-400")}>{pts}</td>
              <td className={cell}>{interp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
