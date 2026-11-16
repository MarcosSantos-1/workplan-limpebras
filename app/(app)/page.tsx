"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CalendarOff, ChevronLeft, ChevronRight, Loader2, Sofa, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { BTN_SECONDARY, GLASS_CARD, PageHero, Pill, SectionTitle, SUB_CORES } from "@/components/design/kit";
import { useLinhaTempo } from "@/hooks/useLinhaTempo";
import { DIAS_SEMANA_CURTO, DIAS_SEMANA_LONGO, fmtBr, todayIso, weekday, type IsoDate } from "@/lib/plano/datas";
import { feriadosNoPeriodo } from "@/lib/plano/feriados";
import { GO, mapasDoSlot } from "@/lib/plano/servicos";
import { cn } from "@/lib/utils";

const servico = GO;

export default function PlanoDoDiaPage() {
  const [data, setData] = useState<IsoDate>(todayIso());
  const { dias, publicados, carregando, erro } = useLinhaTempo(servico);

  const idx = useMemo(() => dias.findIndex((d) => d.data >= data), [dias, data]);
  const doDia = idx >= 0 && dias[idx].data === data ? dias[idx] : null;
  const proximo = idx >= 0 ? dias[idx] : null;
  const anteriorOp = [...dias].reverse().find((d) => d.data < data) ?? null;
  const feriado = feriadosNoPeriodo(data, data)[0];
  const proximos = idx >= 0 ? dias.slice(idx, idx + 12) : [];

  const origem = (id: string) =>
    id === "legado" ? "Cronograma antigo (seg–sáb)" : publicados.find((p) => p.id === id)?.titulo ?? id;

  return (
    <>
      <PageHero
        icon={CalendarDays}
        title="Plano do dia"
        subtitle={
          <>
            Mapas programados para <b>{DIAS_SEMANA_LONGO[weekday(data)].toLowerCase()}, {fmtBr(data)}</b> — Cata-bagulho (GO)
          </>
        }
        right={
          <div className="flex items-center gap-2">
            <Button
              className={cn("h-9 w-9 p-0", BTN_SECONDARY)}
              disabled={!anteriorOp}
              onClick={() => anteriorOp && setData(anteriorOp.data)}
              aria-label="Dia operado anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-44 rounded-md bg-white/95 dark:bg-zinc-900">
              <DatePicker value={data} onChange={(v) => v && setData(v)} />
            </div>
            <Button
              className={cn("h-9 w-9 p-0", BTN_SECONDARY)}
              onClick={() => {
                const n = dias.find((d) => d.data > data);
                if (n) setData(n.data);
              }}
              aria-label="Próximo dia operado"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {erro && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Não consegui ler o Firestore ({erro}). Mostrando apenas o cronograma antigo.
        </div>
      )}

      {carregando ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando cronograma vigente…
        </div>
      ) : doDia ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Pill className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Posição {doDia.slot} de {servico.ciclo}</Pill>
            <span>Fonte: {origem(doDia.origem)}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {mapasDoSlot(servico, doDia.slot).map((s) => (
              <div key={s.sub} className={cn("rounded-2xl p-5", GLASS_CARD)}>
                <div className="flex items-center justify-between">
                  <Pill className={cn("text-sm", SUB_CORES[s.sub])}>{s.sub}</Pill>
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.nome}</p>
                <ul className="mt-4 space-y-2">
                  {s.equipes.map((e) => (
                    <li key={e.equipe.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">{e.equipe.rotulo}</span>
                      <span className="font-mono text-sm font-semibold">{e.codigo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={cn("flex items-start gap-4 rounded-2xl p-6", GLASS_CARD)}>
          <CalendarOff className="h-8 w-8 shrink-0 text-rose-500" />
          <div>
            <p className="text-lg font-semibold">Sem Cata-bagulho neste dia</p>
            <p className="text-sm text-muted-foreground">
              {feriado ? `Feriado: ${feriado.nome}.` : `${DIAS_SEMANA_LONGO[weekday(data)]} não é dia de operação no cronograma vigente.`}{" "}
              {proximo && (
                <button className="font-medium text-emerald-600 underline underline-offset-2" onClick={() => setData(proximo.data)}>
                  Próximo dia operado: {fmtBr(proximo.data)}
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      <section className={cn("space-y-4 rounded-2xl p-5", GLASS_CARD)}>
        <SectionTitle
          icon={Sofa}
          title="Próximos dias operados"
          desc="Sequência do ciclo a partir da data escolhida."
          right={
            <Link href="/gerador/go" className="text-sm font-medium text-emerald-600 hover:underline">
              Gerar novo cronograma →
            </Link>
          }
        />
        <div className="overflow-auto rounded-xl ring-1 ring-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Pos.</th>
                {servico.subs.map((s) => (
                  <th key={s.codigo} className="px-3 py-2 font-medium">
                    <Pill className={SUB_CORES[s.codigo]}>{s.codigo}</Pill>
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Fonte</th>
              </tr>
            </thead>
            <tbody>
              {proximos.map((d) => (
                <tr
                  key={d.data}
                  onClick={() => setData(d.data)}
                  className={cn("cursor-pointer border-t border-border/30 hover:bg-muted/40", d.data === data && "bg-emerald-500/10")}
                >
                  <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">
                    <span className="font-medium">{fmtBr(d.data)}</span>{" "}
                    <span className="text-xs text-muted-foreground">{DIAS_SEMANA_CURTO[weekday(d.data)]}</span>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">{d.slot}</td>
                  {mapasDoSlot(servico, d.slot).map((s) => (
                    <td key={s.sub} className="px-3 py-1.5 font-mono text-xs">
                      {s.equipes.map((e) => e.codigo.slice(-4)).join(" · ")}
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">{d.origem === "legado" ? "antigo" : "publicado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
