/**
 * Configuração dos serviços escalonados.
 *
 * Nomenclatura do mapa: CV10500GO0001 → CV | 1 | 0500 | GO | 0001
 *   sub-regional | turno | frequência | serviço | número do mapa
 *
 * Modelo de execução: o serviço roda num CICLO de N "posições" (slots).
 * Cada dia operado executa o slot seguinte do ciclo, em TODAS as subs ao mesmo tempo.
 * Cada equipe de cada sub transforma o slot em um número de mapa:  numero = passo × slot + offset.
 */

export type SubCodigo = "CV" | "JT" | "MG" | "ST";

export interface EquipeConfig {
  id: string;
  rotulo: string;
  turno: 1 | 2 | 3;
  /** numeroMapa = passo * slot + offset */
  passo: number;
  offset: number;
}

export interface SubConfig {
  codigo: SubCodigo;
  nome: string;
  equipes: EquipeConfig[];
}

export interface ServicoConfig {
  codigo: string;
  nome: string;
  frequencia: string;
  frequenciaDescricao: string;
  /** Quantidade de posições do ciclo (dias operados para passar por todos os mapas). */
  ciclo: number;
  subs: SubConfig[];
  /** Regra do cronograma que estava rodando antes do sistema (para dar continuidade). */
  legado: {
    descricao: string;
    ancora: string; // data em que o slot `slotAncora` foi executado
    slotAncora: number;
    diasSemana: number[]; // 0=dom … 6=sáb
    /** Dias que a planilha antiga pulou além dos feriados oficiais (pontos facultativos). */
    diasExtrasSemOperacao: string[];
  };
}

export const SUBS: Record<SubCodigo, string> = {
  CV: "Casa Verde / Cachoeirinha",
  JT: "Jaçanã / Tremembé",
  MG: "Vila Maria / Vila Guilherme",
  ST: "Santana / Tucuruvi",
};

const DUAS_EQUIPES: EquipeConfig[] = [
  { id: "T1", rotulo: "1º turno", turno: 1, passo: 2, offset: -1 }, // ímpares
  { id: "T2", rotulo: "2º turno", turno: 2, passo: 2, offset: 0 }, // pares
];

export const GO: ServicoConfig = {
  codigo: "GO",
  nome: "Coleta de grandes objetos (Cata-bagulho)",
  frequencia: "0500",
  frequenciaDescricao: "Quinzenal",
  ciclo: 12,
  subs: [
    { codigo: "CV", nome: SUBS.CV, equipes: DUAS_EQUIPES },
    { codigo: "JT", nome: SUBS.JT, equipes: DUAS_EQUIPES },
    { codigo: "MG", nome: SUBS.MG, equipes: DUAS_EQUIPES },
    {
      codigo: "ST",
      nome: SUBS.ST,
      equipes: [
        { id: "T1A", rotulo: "1º turno · equipe A", turno: 1, passo: 2, offset: -1 },
        { id: "T1B", rotulo: "1º turno · equipe B", turno: 1, passo: 2, offset: 0 },
        { id: "T2", rotulo: "2º turno", turno: 2, passo: 1, offset: 0 },
      ],
    },
  ],
  legado: {
    descricao: "Planilha GO.xlsx — segunda a sábado desde 01/09/2025",
    ancora: "2025-09-01",
    slotAncora: 1,
    diasSemana: [1, 2, 3, 4, 5, 6],
    diasExtrasSemOperacao: ["2026-12-31"],
  },
};

export const SERVICOS: Record<string, ServicoConfig> = { GO };

export function codigoMapa(sub: string, turno: number, frequencia: string, servico: string, numero: number): string {
  return `${sub}${turno}${frequencia}${servico}${String(numero).padStart(4, "0")}`;
}

export function numeroMapa(eq: EquipeConfig, slot: number): number {
  return eq.passo * slot + eq.offset;
}

/** Todos os mapas de uma sub (na ordem do ciclo). */
export function mapasDaSub(servico: ServicoConfig, sub: SubConfig) {
  const out: { codigo: string; slot: number; equipe: EquipeConfig }[] = [];
  for (let slot = 1; slot <= servico.ciclo; slot++) {
    for (const eq of sub.equipes) {
      out.push({
        codigo: codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot)),
        slot,
        equipe: eq,
      });
    }
  }
  return out;
}

/** Mapas executados por cada equipe de cada sub em um slot. */
export function mapasDoSlot(servico: ServicoConfig, slot: number) {
  return servico.subs.map((sub) => ({
    sub: sub.codigo,
    nome: sub.nome,
    equipes: sub.equipes.map((eq) => ({
      equipe: eq,
      codigo: codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot)),
    })),
  }));
}

/** Descobre o slot de um código de mapa (ex.: ST20500GO0008 → 8). */
export function slotDoMapa(servico: ServicoConfig, codigo: string): number | null {
  const c = codigo.trim().toUpperCase();
  for (const sub of servico.subs) {
    for (const m of mapasDaSub(servico, sub)) if (m.codigo === c) return m.slot;
  }
  return null;
}
