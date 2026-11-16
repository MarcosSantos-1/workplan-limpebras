/**
 * Motor de cronograma.
 *
 * Ideia central ("trocar o pneu com o carro andando"):
 *   - O ciclo de mapas NUNCA reinicia. Cada dia operado executa o próximo slot.
 *   - Um cronograma novo começa na Data início com o slot seguinte ao último
 *     slot executado antes dela (pela linha do tempo vigente).
 *   - Mudam só as datas (seg–sex, sem feriados); a sequência de mapas é preservada.
 */

import { addDays, eachDay, weekday, type IsoDate } from "./datas";
import { facultativosNoPeriodo, feriadosNoPeriodo, type Feriado } from "./feriados";
import { codigoMapa, numeroMapa, type ServicoConfig } from "./servicos";

export interface ParametrosGeracao {
  dataInicio: IsoDate;
  dataFim: IsoDate;
  /** Slot executado no primeiro dia operado. */
  slotInicial: number;
  /** 0=dom … 6=sáb. Padrão novo: seg–sex. */
  diasSemana: number[];
  /** Datas adicionais sem operação (pontos facultativos marcados, decretos etc.). */
  diasExtrasSemOperacao?: { data: IsoDate; nome: string }[];
}

export interface DiaOperado {
  data: IsoDate;
  slot: number;
}

export interface DiaPulado {
  data: IsoDate;
  motivo: string;
  tipo: "feriado" | "extra";
}

export interface ResultadoGeracao {
  dias: DiaOperado[];
  pulados: DiaPulado[];
  feriados: Feriado[];
}

export function proximoSlot(slot: number, ciclo: number): number {
  return (slot % ciclo) + 1;
}

export function slotAnterior(slot: number, ciclo: number): number {
  return ((slot - 2 + ciclo) % ciclo) + 1;
}

/** Gera os dias operados com o slot de cada um. */
export function gerarDias(servico: ServicoConfig, p: ParametrosGeracao): ResultadoGeracao {
  if (p.dataFim < p.dataInicio) throw new Error("Data fim anterior à data início.");
  if (p.slotInicial < 1 || p.slotInicial > servico.ciclo) throw new Error("Slot inicial inválido.");

  const feriados = feriadosNoPeriodo(p.dataInicio, p.dataFim);
  const mapaFeriado = new Map(feriados.map((f) => [f.data, f]));
  const extras = new Map((p.diasExtrasSemOperacao ?? []).map((e) => [e.data, e]));

  const dias: DiaOperado[] = [];
  const pulados: DiaPulado[] = [];
  let slot = p.slotInicial;

  for (const d of eachDay(p.dataInicio, p.dataFim)) {
    if (!p.diasSemana.includes(weekday(d))) continue;
    const fer = mapaFeriado.get(d);
    if (fer) {
      pulados.push({ data: d, motivo: fer.nome, tipo: "feriado" });
      continue;
    }
    const ex = extras.get(d);
    if (ex) {
      pulados.push({ data: d, motivo: ex.nome || "Sem operação", tipo: "extra" });
      continue;
    }
    dias.push({ data: d, slot });
    slot = proximoSlot(slot, servico.ciclo);
  }
  return { dias, pulados, feriados };
}

/* ------------------------------------------------------------------ */
/* Linha do tempo: legado + cronogramas publicados                      */
/* ------------------------------------------------------------------ */

export interface SegmentoLinhaTempo {
  id: string;
  rotulo: string;
  dataInicio: IsoDate;
  dataFim: IsoDate;
  dias: DiaOperado[];
}

/** Recria o cronograma antigo (seg–sáb) pela regra, para qualquer período. */
export function gerarLegado(servico: ServicoConfig, ate: IsoDate): SegmentoLinhaTempo {
  const leg = servico.legado;
  const facultativos = facultativosNoPeriodo(leg.ancora, ate);
  const extras = leg.diasExtrasSemOperacao.map((data) => ({
    data,
    nome: facultativos.find((f) => f.data === data)?.nome ?? "Sem operação (planilha)",
  }));
  const r = gerarDias(servico, {
    dataInicio: leg.ancora,
    dataFim: ate,
    slotInicial: leg.slotAncora,
    diasSemana: leg.diasSemana,
    diasExtrasSemOperacao: extras,
  });
  return { id: "legado", rotulo: leg.descricao, dataInicio: leg.ancora, dataFim: ate, dias: r.dias };
}

/**
 * Monta a linha do tempo efetiva: cada segmento posterior substitui o anterior
 * a partir da sua data início. Retorna os dias operados em ordem.
 */
export function linhaDoTempo(segmentos: SegmentoLinhaTempo[]): (DiaOperado & { origem: string })[] {
  const ordenados = [...segmentos].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  const out: (DiaOperado & { origem: string })[] = [];
  ordenados.forEach((seg, i) => {
    const prox = ordenados[i + 1];
    const limite = prox ? addDays(prox.dataInicio, -1) : seg.dataFim;
    for (const d of seg.dias) {
      if (d.data >= seg.dataInicio && d.data <= limite) out.push({ ...d, origem: seg.id });
    }
  });
  return out;
}

export interface Continuidade {
  ultimoDia: (DiaOperado & { origem: string }) | null;
  slotInicial: number;
}

/** Slot que deve abrir um cronograma que começa em `dataInicio`. */
export function calcularContinuidade(
  servico: ServicoConfig,
  dataInicio: IsoDate,
  segmentos: SegmentoLinhaTempo[],
): Continuidade {
  const anteriores = segmentos.filter((s) => s.dataInicio < dataInicio);
  const tl = linhaDoTempo(anteriores).filter((d) => d.data < dataInicio);
  const ultimo = tl.length ? tl[tl.length - 1] : null;
  return {
    ultimoDia: ultimo,
    slotInicial: ultimo ? proximoSlot(ultimo.slot, servico.ciclo) : 1,
  };
}

/* ------------------------------------------------------------------ */
/* Visões derivadas                                                    */
/* ------------------------------------------------------------------ */

/** Datas de execução de cada mapa: { CV10500GO0001: [datas…] } */
export function datasPorMapa(servico: ServicoConfig, dias: DiaOperado[]): Record<string, IsoDate[]> {
  const out: Record<string, IsoDate[]> = {};
  for (const sub of servico.subs) {
    for (let slot = 1; slot <= servico.ciclo; slot++) {
      for (const eq of sub.equipes) {
        out[codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot))] = [];
      }
    }
  }
  for (const d of dias) {
    for (const sub of servico.subs) {
      for (const eq of sub.equipes) {
        out[codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, d.slot))].push(d.data);
      }
    }
  }
  return out;
}

export interface Estatisticas {
  diasOperados: number;
  ciclosCompletos: number;
  intervaloMedioDias: number | null;
  intervaloMin: number | null;
  intervaloMax: number | null;
}

export function estatisticas(servico: ServicoConfig, dias: DiaOperado[]): Estatisticas {
  const porSlot = new Map<number, IsoDate[]>();
  for (const d of dias) {
    const l = porSlot.get(d.slot) ?? [];
    l.push(d.data);
    porSlot.set(d.slot, l);
  }
  const intervalos: number[] = [];
  for (const datas of porSlot.values()) {
    for (let i = 1; i < datas.length; i++) {
      intervalos.push(Math.round((Date.parse(datas[i]) - Date.parse(datas[i - 1])) / 86_400_000));
    }
  }
  return {
    diasOperados: dias.length,
    ciclosCompletos: Math.floor(dias.length / servico.ciclo),
    intervaloMedioDias: intervalos.length ? intervalos.reduce((a, b) => a + b, 0) / intervalos.length : null,
    intervaloMin: intervalos.length ? Math.min(...intervalos) : null,
    intervaloMax: intervalos.length ? Math.max(...intervalos) : null,
  };
}
