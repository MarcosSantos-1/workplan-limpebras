"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Archive, ArrowLeft, CalendarRange, CalendarX2, Download, Loader2, Send, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BTN_AMBER, BTN_EMERALD, BTN_SECONDARY, GLASS_CARD, PageHero, StatCard } from "@/components/design/kit";
import { CronogramaPreview } from "@/components/cronograma/preview";
import { StatusBadge } from "@/components/cronograma/status-badge";
import { alterarStatus, obterCronograma, type CronogramaDoc, type StatusCronograma } from "@/lib/cronogramas";
import { DIAS_SEMANA_CURTO, fmtBr } from "@/lib/plano/datas";
import { estatisticas } from "@/lib/plano/motor";
import { SERVICOS } from "@/lib/plano/servicos";
import { baixarExcel } from "@/lib/excel";
import { cn } from "@/lib/utils";

export default function CronogramaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [c, setC] = useState<CronogramaDoc | null | undefined>(undefined);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(() => {
    obterCronograma(id)
      .then(setC)
      .catch((e: Error) => {
        toast.error(e.message);
        setC(null);
      });
  }, [id]);
  useEffect(carregar, [carregar]);

  if (c === undefined)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
      </div>
    );
  if (c === null) return <p className="text-sm text-muted-foreground">Cronograma não encontrado.</p>;

  const servico = SERVICOS[c.servico];
  const stats = estatisticas(servico, c.dias);

  async function mudar(status: StatusCronograma) {
    const msg =
      status === "publicado"
        ? `Publicar? A partir de ${fmtBr(c!.dataInicio)} o plano do dia passa a seguir este cronograma.`
        : "Arquivar? Ele sai do plano do dia (o cronograma anterior volta a valer nessas datas).";
    if (!window.confirm(msg)) return;
    setOcupado(true);
    try {
      await alterarStatus(id, status);
      toast.success(status === "publicado" ? "Publicado." : "Arquivado.");
      carregar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const continuidade = c.continuidade?.ultimaData
    ? `Último dia antes do início: ${fmtBr(c.continuidade.ultimaData)} (posição ${c.continuidade.ultimoSlot}) → posição ${c.slotInicial}${c.continuidade.slotManual ? " (manual)" : ""}`
    : `Posição inicial ${c.slotInicial}`;

  return (
    <>
      <Link href="/cronogramas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Cronogramas
      </Link>
      <PageHero
        icon={Sofa}
        title={c.titulo}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status} />
            {fmtBr(c.dataInicio)} → {fmtBr(c.dataFim)} · {c.diasSemana.map((d) => DIAS_SEMANA_CURTO[d]).join("/")}
          </span>
        }
      />

      <div className={cn("flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between", GLASS_CARD)}>
        <div className="text-sm">
          <p>{continuidade}</p>
          {c.observacoes && <p className="text-muted-foreground">{c.observacoes}</p>}
          <p className="text-xs text-muted-foreground">
            Criado por {c.criadoPor?.email ?? "—"} em {c.criadoEm?.toDate?.().toLocaleString("pt-BR") ?? "—"}
            {c.publicadoEm && ` · publicado em ${c.publicadoEm.toDate().toLocaleString("pt-BR")}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className={cn("h-9", BTN_SECONDARY)}
            onClick={() =>
              void baixarExcel(
                {
                  servico,
                  titulo: c.titulo,
                  dataInicio: c.dataInicio,
                  dataFim: c.dataFim,
                  slotInicial: c.slotInicial,
                  diasSemana: c.diasSemana,
                  dias: c.dias,
                  pulados: c.pulados,
                  continuidade,
                },
                `Cronograma_${c.servico}_${c.dataInicio}_a_${c.dataFim}.xlsx`,
              )
            }
          >
            <Download className="h-4 w-4" /> Excel
          </Button>
          {c.status !== "publicado" && (
            <Button className={cn("h-9", BTN_EMERALD)} disabled={ocupado} onClick={() => void mudar("publicado")}>
              <Send className="h-4 w-4" /> Publicar
            </Button>
          )}
          {c.status !== "arquivado" && (
            <Button className={cn("h-9", BTN_AMBER)} disabled={ocupado} onClick={() => void mudar("arquivado")}>
              <Archive className="h-4 w-4" /> Arquivar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarRange} label="Dias operados" value={stats.diasOperados} />
        <StatCard
          icon={CalendarRange}
          tone="violet"
          label="Intervalo médio por mapa"
          value={stats.intervaloMedioDias ? `${stats.intervaloMedioDias.toFixed(1)} d` : "—"}
        />
        <StatCard icon={CalendarX2} tone="rose" label="Dias sem operação" value={c.pulados.length} />
      </div>

      <CronogramaPreview servico={servico} dias={c.dias} pulados={c.pulados} />
    </>
  );
}
