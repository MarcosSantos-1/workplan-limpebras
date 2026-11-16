"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CalendarX2,
  Download,
  Link2,
  Loader2,
  Plus,
  Repeat,
  Save,
  Send,
  Sofa,
  Timer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  BTN_EMERALD,
  BTN_SECONDARY,
  BTN_SKY,
  FieldLabel,
  GLASS_CARD,
  PageHero,
  Pill,
  SectionTitle,
  StatCard,
  SUB_CORES,
} from "@/components/design/kit";
import { CronogramaPreview } from "@/components/cronograma/preview";
import { useLinhaTempo } from "@/hooks/useLinhaTempo";
import { addDays, DIAS_SEMANA_CURTO, fmtBr, makeIso, todayIso, weekday, type IsoDate } from "@/lib/plano/datas";
import { facultativosNoPeriodo } from "@/lib/plano/feriados";
import { calcularContinuidade, datasPorMapa, estatisticas, gerarDias } from "@/lib/plano/motor";
import { GO, mapasDoSlot, slotDoMapa } from "@/lib/plano/servicos";
import { salvarCronograma } from "@/lib/cronogramas";
import { baixarExcel } from "@/lib/excel";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { podeEditar } from "@/lib/usuarios";

const servico = GO;

function MapasDoSlotInline({ slot }: { slot: number }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {mapasDoSlot(servico, slot).map((s) => (
        <span key={s.sub} className="inline-flex items-center gap-1.5">
          <Pill className={SUB_CORES[s.sub]}>{s.sub}</Pill>
          <span className="font-mono text-xs">{s.equipes.map((e) => e.codigo.slice(-4)).join(" · ")}</span>
        </span>
      ))}
    </div>
  );
}

export default function GeradorGOPage() {
  const router = useRouter();
  const { perfil } = useAuth();
  const editor = podeEditar(perfil);
  const { segmentos, publicados, carregando, erro } = useLinhaTempo(servico);

  const amanha = addDays(todayIso(), 1);
  const [dataInicio, setDataInicio] = useState<IsoDate>(amanha);
  const [dataFim, setDataFim] = useState<IsoDate>(makeIso(Number(amanha.slice(0, 4)) + 1, 12, 31));
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5]);
  const [slotManual, setSlotManual] = useState<number | null>(null);
  const [mapaRef, setMapaRef] = useState("");
  const [facultMarcados, setFacultMarcados] = useState<string[]>([]);
  const [extras, setExtras] = useState<{ data: IsoDate; nome: string }[]>([]);
  const [novoExtraData, setNovoExtraData] = useState("");
  const [novoExtraNome, setNovoExtraNome] = useState("");
  const [titulo, setTitulo] = useState("");
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState<null | "rascunho" | "publicado">(null);

  const continuidade = useMemo(() => calcularContinuidade(servico, dataInicio, segmentos), [dataInicio, segmentos]);
  const slotInicial = slotManual ?? continuidade.slotInicial;

  const facultativos = useMemo(
    () => (dataFim >= dataInicio ? facultativosNoPeriodo(dataInicio, dataFim).filter((f) => diasSemana.includes(weekday(f.data))) : []),
    [dataInicio, dataFim, diasSemana],
  );

  const diasExtras = useMemo(
    () => [
      ...facultativos.filter((f) => facultMarcados.includes(f.data)).map((f) => ({ data: f.data, nome: f.nome })),
      ...extras,
    ],
    [facultativos, facultMarcados, extras],
  );

  const resultado = useMemo(() => {
    if (!dataInicio || !dataFim || dataFim < dataInicio || diasSemana.length === 0) return null;
    try {
      return gerarDias(servico, { dataInicio, dataFim, slotInicial, diasSemana, diasExtrasSemOperacao: diasExtras });
    } catch {
      return null;
    }
  }, [dataInicio, dataFim, slotInicial, diasSemana, diasExtras]);

  const stats = useMemo(() => (resultado ? estatisticas(servico, resultado.dias) : null), [resultado]);
  const tituloFinal =
    titulo.trim() ||
    `GO · ${diasSemana.map((d) => DIAS_SEMANA_CURTO[d]).join("/")} · ${fmtBr(dataInicio)} a ${fmtBr(dataFim)}`;

  const publicadoPosterior = publicados.find((p) => p.dataInicio >= dataInicio);
  const ultimo = continuidade.ultimoDia;
  const origemUltimo =
    ultimo?.origem === "legado" ? "cronograma antigo (planilha seg–sáb)" : publicados.find((p) => p.id === ultimo?.origem)?.titulo;
  const textoContinuidade = ultimo
    ? `Último dia antes do início: ${fmtBr(ultimo.data)} (posição ${ultimo.slot}, ${origemUltimo}) → começa na posição ${slotInicial}${slotManual ? " (manual)" : ""}`
    : `Sem histórico antes do início → posição ${slotInicial}`;

  function aplicarMapaRef(v: string) {
    setMapaRef(v);
    const s = slotDoMapa(servico, v);
    if (s) setSlotManual(s);
  }

  async function salvar(status: "rascunho" | "publicado") {
    if (!resultado) return;
    if (
      status === "publicado" &&
      !window.confirm(
        `Publicar "${tituloFinal}"?\n\nA partir de ${fmtBr(dataInicio)} o plano do dia passa a seguir este cronograma (posição inicial ${slotInicial}).`,
      )
    )
      return;
    setSalvando(status);
    try {
      const id = await salvarCronograma({
        servico: servico.codigo,
        frequencia: servico.frequencia,
        titulo: tituloFinal,
        observacoes: obs.trim(),
        dataInicio,
        dataFim,
        slotInicial,
        diasSemana,
        diasExtrasSemOperacao: diasExtras,
        dias: resultado.dias,
        mapas: datasPorMapa(servico, resultado.dias),
        pulados: resultado.pulados,
        continuidade: {
          ultimaData: ultimo?.data ?? null,
          ultimoSlot: ultimo?.slot ?? null,
          origem: ultimo?.origem ?? null,
          slotManual: slotManual !== null,
        },
        status,
        versaoMotor: 1,
      });
      toast.success(status === "publicado" ? "Cronograma publicado!" : "Rascunho salvo.");
      router.push(`/cronogramas/${id}`);
    } catch (e) {
      toast.error(`Não foi possível salvar: ${(e as Error).message}`);
    } finally {
      setSalvando(null);
    }
  }

  async function exportar() {
    if (!resultado) return;
    await baixarExcel(
      {
        servico,
        titulo: tituloFinal,
        dataInicio,
        dataFim,
        slotInicial,
        diasSemana,
        dias: resultado.dias,
        pulados: resultado.pulados,
        continuidade: textoContinuidade,
      },
      `Cronograma_GO_${dataInicio}_a_${dataFim}.xlsx`,
    );
  }

  return (
    <>
      <PageHero
        icon={Sofa}
        title="Gerador · Cata-bagulho (GO)"
        subtitle={
          <>
            Frequência {servico.frequencia} · ciclo de {servico.ciclo} posições · CV, JT e MG com 24 mapas, ST com 36. Os mapas não
            mudam — só as datas.
          </>
        }
      />

      {erro && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Não consegui ler os cronogramas publicados no Firestore ({erro}). A continuidade está sendo calculada só pelo cronograma
            antigo.
          </span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ------- Período ------- */}
        <section className={cn("space-y-5 rounded-2xl p-5", GLASS_CARD)}>
          <SectionTitle icon={CalendarRange} title="Período e dias de operação" desc="Feriados nacionais, estadual e municipais de SP são pulados automaticamente." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Data início</FieldLabel>
              <DatePicker value={dataInicio} onChange={(v) => v && setDataInicio(v)} />
            </div>
            <div>
              <FieldLabel>Data fim</FieldLabel>
              <DatePicker value={dataFim} onChange={(v) => v && setDataFim(v)} />
            </div>
          </div>
          {dataFim < dataInicio && <p className="text-sm text-red-600">A data fim precisa ser depois da data início.</p>}
          <div>
            <FieldLabel hint="Novo padrão (fim da escala 6x1): segunda a sexta.">Dias da semana</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const on = diasSemana.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiasSemana((p) => (on ? p.filter((x) => x !== d) : [...p, d].sort()))}
                    className={cn(
                      "h-9 w-12 rounded-lg border text-sm font-semibold capitalize transition",
                      on
                        ? "border-emerald-500/50 bg-emerald-500 text-white shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {DIAS_SEMANA_CURTO[d]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel hint="Não são feriados. Marque só se a operação não vai rodar.">Pontos facultativos no período</FieldLabel>
            {facultativos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum no período.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {facultativos.map((f) => {
                  const on = facultMarcados.includes(f.data);
                  return (
                    <button
                      key={f.data}
                      type="button"
                      onClick={() => setFacultMarcados((p) => (on ? p.filter((x) => x !== f.data) : [...p, f.data]))}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                        on
                          ? "border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-200"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {on ? "✕ " : ""}
                      {fmtBr(f.data)} · {f.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <FieldLabel hint="Decretos, eventos, paralisações… qualquer dia em que GO não roda.">Outros dias sem operação</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="sm:w-48">
                <DatePicker value={novoExtraData} onChange={setNovoExtraData} placeholder="Data" />
              </div>
              <Input value={novoExtraNome} onChange={(e) => setNovoExtraNome(e.target.value)} placeholder="Motivo" />
              <Button
                type="button"
                className={cn("h-9", BTN_SECONDARY)}
                disabled={!novoExtraData}
                onClick={() => {
                  setExtras((p) => [...p.filter((x) => x.data !== novoExtraData), { data: novoExtraData, nome: novoExtraNome.trim() || "Sem operação" }].sort((a, b) => a.data.localeCompare(b.data)));
                  setNovoExtraData("");
                  setNovoExtraNome("");
                }}
              >
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            {extras.length > 0 && (
              <ul className="mt-2 space-y-1">
                {extras.map((x) => (
                  <li key={x.data} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                    <span>
                      <span className="tabular-nums">{fmtBr(x.data)}</span> — {x.nome}
                    </span>
                    <button type="button" onClick={() => setExtras((p) => p.filter((y) => y.data !== x.data))} className="text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ------- Continuidade ------- */}
        <section className={cn("space-y-5 rounded-2xl p-5", GLASS_CARD)}>
          <SectionTitle
            icon={Link2}
            title="Continuidade com o cronograma em andamento"
            desc="O ciclo não reinicia: o novo cronograma começa no mapa seguinte ao último executado."
          />
          {carregando ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Lendo cronogramas publicados…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Último executado antes do início</p>
                {ultimo ? (
                  <>
                    <p className="mt-1 text-sm">
                      <span className="font-semibold tabular-nums">{fmtBr(ultimo.data)}</span>{" "}
                      <span className="text-muted-foreground">({DIAS_SEMANA_CURTO[weekday(ultimo.data)]}) · posição {ultimo.slot} · {origemUltimo}</span>
                    </p>
                    <div className="mt-2">
                      <MapasDoSlotInline slot={ultimo.slot} />
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Nenhum dia anterior encontrado.</p>
                )}
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 rotate-90 text-emerald-500" />
              </div>
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Primeiro dia do novo cronograma {resultado?.dias[0] && `· ${fmtBr(resultado.dias[0].data)}`}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Posição {slotInicial} {slotManual !== null && <span className="font-normal text-amber-600">(definida manualmente)</span>}
                </p>
                <div className="mt-2">
                  <MapasDoSlotInline slot={slotInicial} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel hint="Ex.: ST20500GO0008">Ajustar pelo mapa que deve rodar no 1º dia</FieldLabel>
                  <Input
                    value={mapaRef}
                    onChange={(e) => aplicarMapaRef(e.target.value)}
                    placeholder="Código do mapa"
                    className={cn("font-mono uppercase", mapaRef && !slotDoMapa(servico, mapaRef) && "border-red-500")}
                  />
                </div>
                <div>
                  <FieldLabel>Ou escolher a posição</FieldLabel>
                  <select
                    value={slotManual ?? ""}
                    onChange={(e) => {
                      setSlotManual(e.target.value ? Number(e.target.value) : null);
                      setMapaRef("");
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Automático (posição {continuidade.slotInicial})</option>
                    {Array.from({ length: servico.ciclo }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>
                        Posição {s} — CV1 {String(2 * s - 1).padStart(4, "0")} · ST2 {String(s).padStart(4, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {publicadoPosterior && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Já existe um cronograma publicado começando em {fmtBr(publicadoPosterior.dataInicio)} (“{publicadoPosterior.titulo}”). Ele
                  continua valendo a partir da data dele; arquive-o se este novo deve substituí-lo.
                </div>
              )}
              {dataInicio <= todayIso() && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  A data início é hoje ou já passou — publicar vai reescrever o plano de dias que já começaram.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ------- Resultado ------- */}
      {resultado && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={CalendarRange} label="Dias operados" value={stats.diasOperados} hint={`${fmtBr(resultado.dias[0]?.data)} → ${fmtBr(resultado.dias.at(-1)?.data)}`} />
            <StatCard icon={Repeat} tone="sky" label="Ciclos completos" value={stats.ciclosCompletos} hint={`cada ciclo = ${servico.ciclo} dias operados`} />
            <StatCard
              icon={Timer}
              tone="violet"
              label="Intervalo médio por mapa"
              value={stats.intervaloMedioDias ? `${stats.intervaloMedioDias.toFixed(1)} d` : "—"}
              hint={stats.intervaloMin !== null ? `mín. ${stats.intervaloMin} · máx. ${stats.intervaloMax} dias corridos` : "período curto demais"}
            />
            <StatCard icon={CalendarX2} tone="rose" label="Dias sem operação" value={resultado.pulados.length} hint="feriados + extras (em dias de semana)" />
          </div>

          <section className={cn("space-y-4 rounded-2xl p-5", GLASS_CARD)}>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <div>
                <FieldLabel>Título</FieldLabel>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={tituloFinal} />
              </div>
              <div>
                <FieldLabel>Observações</FieldLabel>
                <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={1} placeholder="Ex.: transição fim da escala 6x1" className="min-h-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className={cn("h-9", BTN_SECONDARY)} onClick={() => void exportar()}>
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button className={cn("h-9", BTN_SKY)} disabled={!!salvando || !editor} title={editor ? undefined : "Seu papel é somente leitura"} onClick={() => void salvar("rascunho")}>
                  {salvando === "rascunho" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar rascunho
                </Button>
                <Button className={cn("h-9", BTN_EMERALD)} disabled={!!salvando || !editor} title={editor ? undefined : "Seu papel é somente leitura"} onClick={() => void salvar("publicado")}>
                  {salvando === "publicado" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Salvar e publicar
                </Button>
              </div>
            </div>
          </section>

          <CronogramaPreview servico={servico} dias={resultado.dias} pulados={resultado.pulados} />
        </>
      )}
    </>
  );
}
