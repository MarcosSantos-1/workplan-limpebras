/**
 * Feriados que valem para a cidade de São Paulo (Lote III).
 *
 * Nacionais (Lei 662/1949, 6.802/1980, 14.759/2023):
 *   01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11, 25/12
 * Estadual SP (Lei 9.497/1997):
 *   09/07 — Revolução Constitucionalista
 * Municipais São Paulo (Lei 14.485/2007):
 *   25/01 — Aniversário de São Paulo
 *   Sexta-feira Santa (Paixão de Cristo) — Páscoa − 2
 *   Corpus Christi — Páscoa + 60
 *   (20/11 também é municipal, mas já é nacional desde 2024)
 *
 * Pontos facultativos (NÃO são feriados; só entram se marcados manualmente):
 *   Carnaval (seg/ter), Quarta-feira de Cinzas, 24/12, 31/12.
 *
 * Conferido contra o cronograma vigente de GO (set/2025 → mar/2027):
 * todos os dias pulados batem com esta lista, exceto 31/12/2026, que a planilha
 * pulou como ponto facultativo.
 */

import { addDays, makeIso, yearsBetween, type IsoDate } from "./datas";

export type TipoFeriado = "nacional" | "estadual" | "municipal" | "facultativo";

export interface Feriado {
  data: IsoDate;
  nome: string;
  tipo: TipoFeriado;
}

/** Domingo de Páscoa — algoritmo de Meeus/Jones/Butcher (calendário gregoriano). */
export function pascoa(ano: number): IsoDate {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return makeIso(ano, mes, dia);
}

/** Feriados oficiais (nacionais + estadual + municipais) de um ano. */
export function feriadosOficiaisSP(ano: number): Feriado[] {
  const p = pascoa(ano);
  const lista: Feriado[] = [
    { data: makeIso(ano, 1, 1), nome: "Confraternização Universal", tipo: "nacional" },
    { data: makeIso(ano, 1, 25), nome: "Aniversário de São Paulo", tipo: "municipal" },
    { data: addDays(p, -2), nome: "Sexta-feira Santa (Paixão de Cristo)", tipo: "municipal" },
    { data: makeIso(ano, 4, 21), nome: "Tiradentes", tipo: "nacional" },
    { data: makeIso(ano, 5, 1), nome: "Dia do Trabalho", tipo: "nacional" },
    { data: addDays(p, 60), nome: "Corpus Christi", tipo: "municipal" },
    { data: makeIso(ano, 7, 9), nome: "Revolução Constitucionalista", tipo: "estadual" },
    { data: makeIso(ano, 9, 7), nome: "Independência do Brasil", tipo: "nacional" },
    { data: makeIso(ano, 10, 12), nome: "Nossa Senhora Aparecida", tipo: "nacional" },
    { data: makeIso(ano, 11, 2), nome: "Finados", tipo: "nacional" },
    { data: makeIso(ano, 11, 15), nome: "Proclamação da República", tipo: "nacional" },
  ];
  // Consciência Negra: municipal em SP desde 2004, nacional desde 2024.
  lista.push({
    data: makeIso(ano, 11, 20),
    nome: "Dia Nacional de Zumbi e da Consciência Negra",
    tipo: ano >= 2024 ? "nacional" : "municipal",
  });
  lista.push({ data: makeIso(ano, 12, 25), nome: "Natal", tipo: "nacional" });
  return lista.sort((a, b) => a.data.localeCompare(b.data));
}

/** Pontos facultativos comuns (opcionais — não pulam por padrão). */
export function pontosFacultativosSP(ano: number): Feriado[] {
  const p = pascoa(ano);
  return [
    { data: addDays(p, -48), nome: "Carnaval (segunda)", tipo: "facultativo" as const },
    { data: addDays(p, -47), nome: "Carnaval (terça)", tipo: "facultativo" as const },
    { data: addDays(p, -46), nome: "Quarta-feira de Cinzas", tipo: "facultativo" as const },
    { data: makeIso(ano, 12, 24), nome: "Véspera de Natal", tipo: "facultativo" as const },
    { data: makeIso(ano, 12, 31), nome: "Véspera de Ano-Novo", tipo: "facultativo" as const },
  ].sort((a, b) => a.data.localeCompare(b.data));
}

export function feriadosNoPeriodo(inicio: IsoDate, fim: IsoDate): Feriado[] {
  return yearsBetween(inicio, fim)
    .flatMap(feriadosOficiaisSP)
    .filter((f) => f.data >= inicio && f.data <= fim);
}

export function facultativosNoPeriodo(inicio: IsoDate, fim: IsoDate): Feriado[] {
  return yearsBetween(inicio, fim)
    .flatMap(pontosFacultativosSP)
    .filter((f) => f.data >= inicio && f.data <= fim);
}

export const TIPO_FERIADO_LABEL: Record<TipoFeriado, string> = {
  nacional: "Nacional",
  estadual: "Estadual",
  municipal: "Municipal",
  facultativo: "Ponto facultativo",
};
