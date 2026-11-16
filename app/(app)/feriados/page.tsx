"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowRight,
  CalendarHeart,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BTN_EMERALD, BTN_SECONDARY, FieldLabel, GLASS_CARD, PageHero, Pill, SectionTitle, StatCard } from "@/components/design/kit";
import { useLinhaTempo } from "@/hooks/useLinhaTempo";
import { DIAS_SEMANA_CURTO, DIAS_SEMANA_LONGO, fmtBr, todayIso, weekday, type IsoDate } from "@/lib/plano/datas";
import { feriadosOficiaisSP, pontosFacultativosSP, TIPO_FERIADO_LABEL, type Feriado, type TipoFeriado } from "@/lib/plano/feriados";
import { GO, mapasDoSlot } from "@/lib/plano/servicos";
import { baixarBlob, gerarCalendarioPdf } from "@/lib/calendario-pdf";
import { cn } from "@/lib/utils";

const TIPO_CLS: Record<TipoFeriado | "personalizado", string> = {
  nacional: "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300",
  estadual: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  municipal: "border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300",
  facultativo: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  personalizado: "border-teal-500/30 bg-teal-500/15 text-teal-700 dark:text-teal-300",
};

const TABS_CLS = "h-10 bg-muted/60 [&_[data-active-pill]]:bg-emerald-500 [&_[data-state=active]]:text-white";

export default function FeriadosPage() {
  const hoje = todayIso();
  const [ano, setAno] = useState(Number(hoje.slice(0, 4)));
  const { dias } = useLinhaTempo(GO);

  const lista = useMemo<Feriado[]>(
    () => [...feriadosOficiaisSP(ano), ...pontosFacultativosSP(ano)].sort((a, b) => a.data.localeCompare(b.data)),
    [ano],
  );
  const oficiais = lista.filter((f) => f.tipo !== "facultativo");
  const emDiaUtil = oficiais.filter((f) => weekday(f.data) >= 1 && weekday(f.data) <= 5);

  /** Para um feriado em dia de semana: qual posição do GO foi empurrada e para quando. */
  function impactoGO(data: IsoDate) {
    if (dias.some((d) => d.data === data)) return { tipo: "opera" as const };
    const prox = dias.find((d) => d.data > data);
    if (!prox) return null;
    return { tipo: "remaneja" as const, slot: prox.slot, para: prox.data };
  }

  // Comparar anos
  const anos = Array.from({ length: 5 }, (_, i) => ano + i);
  const matriz = useMemo(() => {
    const nomes = new Map<string, TipoFeriado>();
    const porAno = anos.map((a) => {
      const m = new Map<string, IsoDate>();
      for (const f of [...feriadosOficiaisSP(a), ...pontosFacultativosSP(a)]) {
        m.set(f.nome, f.data);
        nomes.set(f.nome, f.tipo);
      }
      return m;
    });
    const linhas = [...nomes.entries()].map(([nome, tipo]) => ({ nome, tipo, datas: porAno.map((m) => m.get(nome)) }));
    return linhas.sort((x, y) => (x.datas[0] ?? "").slice(5).localeCompare((y.datas[0] ?? "").slice(5)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano]);

  return (
    <>
      <PageHero
        icon={CalendarHeart}
        title="Feriados e calendário"
        subtitle="Feriados nacionais, estadual e municipais de São Paulo, quando caem e o que acontece com o cronograma."
        right={
          <div className="flex items-center gap-2">
            <Button className={cn("h-9 w-9 p-0", BTN_SECONDARY)} onClick={() => setAno((a) => a - 1)} aria-label="Ano anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-20 text-center text-3xl font-bold tabular-nums text-white">{ano}</span>
            <Button className={cn("h-9 w-9 p-0", BTN_SECONDARY)} onClick={() => setAno((a) => a + 1)} aria-label="Próximo ano">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarHeart} tone="rose" label="Feriados oficiais" value={oficiais.length} hint="nacionais + estadual + municipais" />
        <StatCard icon={CalendarRange} label="Em dia útil (seg–sex)" value={emDiaUtil.length} hint="dias em que o mapa é remanejado" />
        <StatCard icon={CalendarRange} tone="sky" label="Pontos facultativos" value={lista.length - oficiais.length} hint="só param a operação se marcados" />
      </div>

      <div className={cn("rounded-2xl p-4 sm:p-5", GLASS_CARD)}>
        <Tabs defaultValue="ano">
          <TabsList className={TABS_CLS}>
            <TabsTrigger value="ano">
              <CalendarHeart className="h-4 w-4" /> {ano}
            </TabsTrigger>
            <TabsTrigger value="comparar">
              <Table2 className="h-4 w-4" /> Comparar {anos[0]}–{anos.at(-1)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ano" className="mt-4">
            <div className="overflow-auto rounded-xl ring-1 ring-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Feriado</th>
                    <th className="px-3 py-2 font-medium">Tipo</th>
                    <th className="px-3 py-2 font-medium">Cata-bagulho (GO)</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((f) => {
                    const wd = weekday(f.data);
                    const fimDeSemana = wd === 0 || wd === 6;
                    const imp = !fimDeSemana && f.tipo !== "facultativo" ? impactoGO(f.data) : null;
                    return (
                      <tr key={f.data + f.nome} className={cn("border-t border-border/30", f.data < hoje && "opacity-55")}>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                          <span className="font-semibold">{fmtBr(f.data)}</span>{" "}
                          <span className={cn("text-xs", fimDeSemana ? "text-muted-foreground" : "font-medium text-foreground")}>
                            {DIAS_SEMANA_LONGO[wd]}
                          </span>
                        </td>
                        <td className="px-3 py-2">{f.nome}</td>
                        <td className="px-3 py-2">
                          <Pill className={TIPO_CLS[f.tipo]}>{TIPO_FERIADO_LABEL[f.tipo]}</Pill>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {f.tipo === "facultativo" ? (
                            <span className="text-muted-foreground">Opera normalmente (a menos que seja marcado no gerador)</span>
                          ) : wd === 0 ? (
                            <span className="text-muted-foreground">Domingo — sem impacto</span>
                          ) : imp?.tipo === "remaneja" ? (
                            <span className="inline-flex flex-wrap items-center gap-1.5">
                              Posição <b>{imp.slot}</b>
                              <span className="font-mono text-muted-foreground">
                                ({mapasDoSlot(GO, imp.slot).find((x) => x.sub === "CV")?.equipes.map((e) => e.codigo.slice(-4)).join("/")}…)
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                              {fmtBr(imp.para)} ({DIAS_SEMANA_CURTO[weekday(imp.para)]})
                            </span>
                          ) : imp?.tipo === "opera" ? (
                            <span className="text-amber-600">Consta como dia operado no cronograma vigente</span>
                          ) : (
                            <span className="text-muted-foreground">{wd === 6 ? "Sábado — fora da escala seg–sex" : "Mapa do dia vai para o próximo dia útil"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Feriado não pula mapa: o ciclo só avança em dia operado, então o mapa do feriado é feito no próximo dia útil e a sequência
              continua.
            </p>
          </TabsContent>

          <TabsContent value="comparar" className="mt-4">
            <div className="overflow-auto rounded-xl ring-1 ring-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Feriado</th>
                    {anos.map((a) => (
                      <th key={a} className="px-3 py-2 text-center font-medium tabular-nums">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matriz.map((l) => (
                    <tr key={l.nome} className="border-t border-border/30">
                      <td className="px-3 py-2">
                        <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", TIPO_CLS[l.tipo].split(" ").find((c) => c.startsWith("bg-")))} />
                        {l.nome}
                      </td>
                      {l.datas.map((d, i) => {
                        const wd = d ? weekday(d) : -1;
                        const util = wd >= 1 && wd <= 5;
                        return (
                          <td key={i} className="px-3 py-2 text-center tabular-nums">
                            {d ? (
                              <span className={cn("inline-flex flex-col leading-tight", !util && "text-muted-foreground")}>
                                <span className="font-medium">{fmtBr(d).slice(0, 5)}</span>
                                <span className={cn("text-[11px]", util && l.tipo !== "facultativo" && "font-semibold text-rose-600")}>
                                  {DIAS_SEMANA_CURTO[wd]}
                                </span>
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Em vermelho: feriado oficial que cai de segunda a sexta (afeta a operação).</p>
          </TabsContent>
        </Tabs>
      </div>

      <GeradorCalendario anoInicial={ano} />
    </>
  );
}

/* ------------------------------------------------------------------ */

function GeradorCalendario({ anoInicial }: { anoInicial: number }) {
  const [ano, setAno] = useState(anoInicial);
  const [titulo, setTitulo] = useState("Calendário");
  const [subtitulo, setSubtitulo] = useState("Feriados · São Paulo/SP · Limpebras Lote III");
  const [comFacultativos, setComFacultativos] = useState(true);
  const [extras, setExtras] = useState<{ data: IsoDate; nome: string }[]>([]);
  const [novaData, setNovaData] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [gerando, setGerando] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function gerar() {
    setGerando(true);
    try {
      const marcacoes = [
        ...feriadosOficiaisSP(ano),
        ...(comFacultativos ? pontosFacultativosSP(ano) : []),
        ...extras.filter((e) => e.data.startsWith(String(ano))).map((e) => ({ ...e, tipo: "personalizado" as const })),
      ];
      const b = await gerarCalendarioPdf({
        ano,
        titulo: titulo.trim() || "Calendário",
        subtitulo: subtitulo.trim(),
        marcacoes,
        logoUrl: `${window.location.origin}/logotipo-white.png`,
      });
      setBlob(b);
      setPreviewUrl(URL.createObjectURL(b));
    } catch (e) {
      toast.error(`Falha ao gerar o PDF: ${(e as Error).message}`);
    } finally {
      setGerando(false);
    }
  }

  return (
    <section className={cn("space-y-5 rounded-2xl p-5", GLASS_CARD)}>
      <SectionTitle icon={FileText} title="Calendário em PDF (A4)" desc="Calendário anual com a marca Limpebras e os feriados destacados, pronto para imprimir." />
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div>
              <FieldLabel>Ano</FieldLabel>
              <Input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value) || anoInicial)} />
            </div>
            <div>
              <FieldLabel>Título</FieldLabel>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
          </div>
          <div>
            <FieldLabel>Subtítulo</FieldLabel>
            <Input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={comFacultativos} onChange={(e) => setComFacultativos(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
            Incluir pontos facultativos (Carnaval, Cinzas, 24/12, 31/12)
          </label>
          <div>
            <FieldLabel hint="Aniversário da empresa, treinamentos, eventos…">Datas personalizadas</FieldLabel>
            <div className="flex flex-col gap-2">
              <DatePicker value={novaData} onChange={setNovaData} placeholder="Data" />
              <div className="flex gap-2">
                <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Descrição" />
                <Button
                  className={cn("h-9", BTN_SECONDARY)}
                  disabled={!novaData || !novoNome.trim()}
                  onClick={() => {
                    setExtras((p) => [...p.filter((x) => x.data !== novaData), { data: novaData, nome: novoNome.trim() }].sort((a, b) => a.data.localeCompare(b.data)));
                    setNovaData("");
                    setNovoNome("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {extras.length > 0 && (
              <ul className="mt-2 space-y-1">
                {extras.map((x) => (
                  <li key={x.data} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                    <span>
                      <span className="tabular-nums">{fmtBr(x.data)}</span> — {x.nome}
                      {!x.data.startsWith(String(ano)) && <span className="ml-1 text-xs text-amber-600">(outro ano)</span>}
                    </span>
                    <button type="button" onClick={() => setExtras((p) => p.filter((y) => y.data !== x.data))} className="text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className={cn("h-9", BTN_EMERALD)} disabled={gerando} onClick={() => void gerar()}>
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Gerar pré-visualização
            </Button>
            <Button className={cn("h-9", BTN_SECONDARY)} disabled={!blob} onClick={() => blob && baixarBlob(blob, `Calendario_Limpebras_${ano}.pdf`)}>
              <Download className="h-4 w-4" /> Baixar PDF
            </Button>
          </div>
        </div>
        <div className="min-h-[520px] overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border">
          {previewUrl ? (
            <iframe src={previewUrl} title="Pré-visualização do calendário" className="h-[760px] w-full" />
          ) : (
            <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-muted-foreground">
              Clique em “Gerar pré-visualização”.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
