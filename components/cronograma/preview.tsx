"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, CalendarX2, Map as MapIcon, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GLASS_CARD, Pill, SUB_CORES } from "@/components/design/kit";
import { DIAS_SEMANA_CURTO, fmtBr, todayIso, weekday } from "@/lib/plano/datas";
import { codigoMapa, numeroMapa, type ServicoConfig } from "@/lib/plano/servicos";
import type { DiaOperado, DiaPulado } from "@/lib/plano/motor";
import { cn } from "@/lib/utils";

const TABS_CLS =
  "h-10 bg-muted/60 [&_[data-active-pill]]:bg-emerald-500 [&_[data-state=active]]:text-white";

export function CronogramaPreview({
  servico,
  dias,
  pulados,
}: {
  servico: ServicoConfig;
  dias: DiaOperado[];
  pulados: DiaPulado[];
}) {
  const [busca, setBusca] = useState("");
  const hoje = todayIso();

  const porSlot = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const d of dias) m.set(d.slot, [...(m.get(d.slot) ?? []), d.data]);
    return m;
  }, [dias]);

  const linhasMapa = useMemo(() => {
    const out: { sub: string; turno: number; rotulo: string; codigo: string; slot: number; datas: string[] }[] = [];
    for (const sub of servico.subs)
      for (const eq of sub.equipes)
        for (let slot = 1; slot <= servico.ciclo; slot++)
          out.push({
            sub: sub.codigo,
            turno: eq.turno,
            rotulo: eq.rotulo,
            codigo: codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot)),
            slot,
            datas: porSlot.get(slot) ?? [],
          });
    const q = busca.trim().toUpperCase();
    return q ? out.filter((l) => l.codigo.includes(q) || l.sub === q) : out;
  }, [servico, porSlot, busca]);

  const diasFiltrados = useMemo(() => {
    const q = busca.trim();
    if (!q) return dias;
    const qU = q.toUpperCase();
    return dias.filter((d) => {
      if (fmtBr(d.data).includes(q)) return true;
      return servico.subs.some((s) =>
        s.equipes.some((eq) =>
          codigoMapa(s.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, d.slot)).includes(qU),
        ),
      );
    });
  }, [dias, busca, servico]);

  return (
    <div className={cn("rounded-2xl p-4 sm:p-5", GLASS_CARD)}>
      <Tabs defaultValue="diario">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className={TABS_CLS}>
            <TabsTrigger value="diario">
              <CalendarCheck2 className="h-4 w-4" /> Diário ({dias.length})
            </TabsTrigger>
            <TabsTrigger value="mapas">
              <MapIcon className="h-4 w-4" /> Por mapa
            </TabsTrigger>
            <TabsTrigger value="pulados">
              <CalendarX2 className="h-4 w-4" /> Sem operação ({pulados.length})
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar mapa ou data (dd/mm/aaaa)" className="pl-8" />
          </div>
        </div>

        <TabsContent value="diario" className="mt-4">
          <div className="max-h-[640px] overflow-auto rounded-xl ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Pos.</th>
                  {servico.subs.map((s) => (
                    <th key={s.codigo} className="px-3 py-2 font-medium">
                      <Pill className={SUB_CORES[s.codigo]}>{s.codigo}</Pill>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diasFiltrados.map((d) => (
                  <tr
                    key={d.data}
                    className={cn(
                      "border-t border-border/30 hover:bg-muted/40",
                      d.slot === 1 && "border-t-2 border-t-emerald-500/50",
                      d.data === hoje && "bg-emerald-500/10",
                    )}
                  >
                    <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">
                      <span className="font-medium">{fmtBr(d.data)}</span>{" "}
                      <span className="text-xs text-muted-foreground">{DIAS_SEMANA_CURTO[weekday(d.data)]}</span>
                    </td>
                    <td className="px-3 py-1.5 font-mono tabular-nums text-muted-foreground">{d.slot}</td>
                    {servico.subs.map((s) => (
                      <td key={s.codigo} className="px-3 py-1.5">
                        <div className="flex flex-col gap-0.5 font-mono text-xs">
                          {s.equipes.map((eq) => (
                            <span key={eq.id} title={eq.rotulo}>
                              {codigoMapa(s.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, d.slot))}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Linha verde mais grossa = início de um novo ciclo (posição 1).</p>
        </TabsContent>

        <TabsContent value="mapas" className="mt-4">
          <div className="max-h-[640px] overflow-auto rounded-xl ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Mapa</th>
                  <th className="px-3 py-2 font-medium">Equipe</th>
                  <th className="px-3 py-2 font-medium">Exec.</th>
                  <th className="px-3 py-2 font-medium">Datas</th>
                </tr>
              </thead>
              <tbody>
                {linhasMapa.map((l) => (
                  <tr key={l.codigo} className="border-t border-border/30 align-top hover:bg-muted/40">
                    <td className="whitespace-nowrap px-3 py-1.5">
                      <Pill className={cn("mr-2", SUB_CORES[l.sub])}>{l.sub}</Pill>
                      <span className="font-mono text-xs">{l.codigo}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-muted-foreground">{l.rotulo}</td>
                    <td className="px-3 py-1.5 tabular-nums">{l.datas.length}</td>
                    <td className="px-3 py-1.5 text-xs tabular-nums text-muted-foreground">
                      {l.datas.map((x) => (
                        <span key={x} className={cn("mr-2 inline-block", x === hoje && "font-semibold text-emerald-600")}>
                          {fmtBr(x)}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pulados" className="mt-4">
          {pulados.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum feriado ou dia extra no período.</p>
          ) : (
            <div className="overflow-auto rounded-xl ring-1 ring-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Motivo</th>
                    <th className="px-3 py-2 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {pulados.map((p) => (
                    <tr key={p.data} className="border-t border-border/30">
                      <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">
                        {fmtBr(p.data)} <span className="text-xs text-muted-foreground">{DIAS_SEMANA_CURTO[weekday(p.data)]}</span>
                      </td>
                      <td className="px-3 py-1.5">{p.motivo}</td>
                      <td className="px-3 py-1.5">
                        <Pill
                          className={
                            p.tipo === "feriado"
                              ? "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                              : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          }
                        >
                          {p.tipo === "feriado" ? "Feriado" : "Extra"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
