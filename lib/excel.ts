/**
 * Exportação do cronograma para Excel (roda no navegador).
 *
 * Abas:
 *   CRONOGRAMA — mesmo layout da planilha GO.xlsx (Turno | CV | ST | JT | MG | CRONOGRAMA1..N),
 *                datas separadas por ";" e quebradas em várias colunas para não estourar o limite de caracteres.
 *   DIARIO     — um dia por linha, com o mapa de cada equipe de cada sub.
 *   MAPAS      — um mapa por linha, com quantidade, primeira/última data e intervalo médio.
 *   DIAS SEM OPERACAO — feriados e dias extras pulados.
 *   PARAMETROS — dados de geração (início, fim, continuidade…).
 */

import ExcelJS from "exceljs";
import { DIAS_SEMANA_CURTO, fmtBr, weekday, type IsoDate } from "./plano/datas";
import { codigoMapa, numeroMapa, type ServicoConfig } from "./plano/servicos";
import type { DiaOperado, DiaPulado } from "./plano/motor";

export interface DadosExportacao {
  servico: ServicoConfig;
  titulo: string;
  dataInicio: IsoDate;
  dataFim: IsoDate;
  slotInicial: number;
  diasSemana: number[];
  dias: DiaOperado[];
  pulados: DiaPulado[];
  continuidade?: string;
  datasPorColuna?: number;
}

const VERDE = "FF047857";
const VERDE_CLARO = "FFD1FAE5";

function estilizarCabecalho(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.height = 22;
  row.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: VERDE } };
    c.border = { bottom: { style: "thin", color: { argb: "FF065F46" } } };
  });
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export async function gerarWorkbook(d: DadosExportacao): Promise<ExcelJS.Workbook> {
  const { servico } = d;
  const porColuna = d.datasPorColuna ?? 25;
  const wb = new ExcelJS.Workbook();
  wb.creator = "WorkPlan Limpebras";
  wb.created = new Date();

  const datasDoSlot = new Map<number, IsoDate[]>();
  for (const dia of d.dias) {
    const l = datasDoSlot.get(dia.slot) ?? [];
    l.push(dia.data);
    datasDoSlot.set(dia.slot, l);
  }

  // ---------------- CRONOGRAMA (layout legado) ----------------
  const ordemSubs = ["CV", "ST", "JT", "MG"].filter((s) => servico.subs.some((x) => x.codigo === s));
  const subs = ordemSubs.map((c) => servico.subs.find((s) => s.codigo === c)!);
  const minEquipes = Math.min(...subs.map((s) => s.equipes.length));
  const maxEquipes = Math.max(...subs.map((s) => s.equipes.length));

  type Linha = { turno: string; codigos: (string | "")[]; slot: number };
  const linhas: Linha[] = [];
  const cod = (subIdx: number, eqIdx: number, slot: number) => {
    const sub = subs[subIdx];
    const eq = sub.equipes[eqIdx];
    return eq ? codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot)) : "";
  };
  for (let slot = 1; slot <= servico.ciclo; slot++) {
    for (let i = 0; i < minEquipes; i++) {
      const turno = subs[0].equipes[i].turno;
      linhas.push({ turno: `${turno}°`, codigos: subs.map((_, si) => cod(si, i, slot)), slot });
    }
  }
  for (let i = minEquipes; i < maxEquipes; i++) {
    for (let slot = 1; slot <= servico.ciclo; slot++) {
      const ref = subs.find((s) => s.equipes[i])!;
      linhas.push({ turno: `${ref.equipes[i].turno}°`, codigos: subs.map((_, si) => cod(si, i, slot)), slot });
    }
  }

  const maxBlocos = Math.max(1, ...[...datasDoSlot.values()].map((l) => Math.ceil(l.length / porColuna)));
  const wsC = wb.addWorksheet("CRONOGRAMA", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
  wsC.addRow(["Turno", ...ordemSubs, ...Array.from({ length: maxBlocos }, (_, i) => `CRONOGRAMA${i + 1}`)]);
  estilizarCabecalho(wsC.getRow(1));
  for (const l of linhas) {
    const blocos = chunk((datasDoSlot.get(l.slot) ?? []).map(fmtBr), porColuna).map((b) => b.join(";"));
    wsC.addRow([l.turno, ...l.codigos.map((c) => (c ? ` ${c}` : "")), ...blocos]);
  }
  wsC.getColumn(1).width = 8;
  ordemSubs.forEach((_, i) => (wsC.getColumn(i + 2).width = 18));
  for (let i = 0; i < maxBlocos; i++) wsC.getColumn(ordemSubs.length + 2 + i).width = 60;

  // ---------------- DIARIO ----------------
  const wsD = wb.addWorksheet("DIARIO", { views: [{ state: "frozen", xSplit: 3, ySplit: 1 }] });
  const colunasEquipe = servico.subs.flatMap((s) => s.equipes.map((eq) => ({ sub: s, eq })));
  wsD.addRow(["Data", "Dia", "Posição do ciclo", ...colunasEquipe.map((c) => `${c.sub.codigo} · ${c.eq.rotulo}`)]);
  estilizarCabecalho(wsD.getRow(1));
  d.dias.forEach((dia, idx) => {
    const r = wsD.addRow([
      fmtBr(dia.data),
      DIAS_SEMANA_CURTO[weekday(dia.data)],
      dia.slot,
      ...colunasEquipe.map((c) =>
        codigoMapa(c.sub.codigo, c.eq.turno, servico.frequencia, servico.codigo, numeroMapa(c.eq, dia.slot)),
      ),
    ]);
    if (dia.slot === 1 && idx > 0) r.border = { top: { style: "medium", color: { argb: VERDE } } };
  });
  wsD.columns.forEach((c, i) => (c.width = i < 3 ? 14 : 19));
  wsD.autoFilter = { from: "A1", to: { row: 1, column: 3 + colunasEquipe.length } };

  // ---------------- MAPAS ----------------
  const wsM = wb.addWorksheet("MAPAS", { views: [{ state: "frozen", ySplit: 1 }] });
  wsM.addRow(["Sub", "Turno", "Equipe", "Mapa", "Posição", "Execuções", "Primeira", "Última", "Intervalo médio (dias)", "Datas"]);
  estilizarCabecalho(wsM.getRow(1));
  for (const sub of servico.subs) {
    for (const eq of sub.equipes) {
      for (let slot = 1; slot <= servico.ciclo; slot++) {
        const datas = datasDoSlot.get(slot) ?? [];
        const intervalos = datas.slice(1).map((x, i) => (Date.parse(x) - Date.parse(datas[i])) / 86_400_000);
        const media = intervalos.length ? intervalos.reduce((a, b) => a + b, 0) / intervalos.length : null;
        wsM.addRow([
          sub.codigo,
          `${eq.turno}°`,
          eq.rotulo,
          codigoMapa(sub.codigo, eq.turno, servico.frequencia, servico.codigo, numeroMapa(eq, slot)),
          slot,
          datas.length,
          fmtBr(datas[0]),
          fmtBr(datas[datas.length - 1]),
          media === null ? "—" : Math.round(media * 10) / 10,
          datas.map(fmtBr).join(";"),
        ]);
      }
    }
  }
  [6, 8, 18, 18, 9, 11, 12, 12, 14, 120].forEach((w, i) => (wsM.getColumn(i + 1).width = w));
  wsM.autoFilter = { from: "A1", to: "J1" };

  // ---------------- DIAS SEM OPERACAO ----------------
  const wsP = wb.addWorksheet("DIAS SEM OPERACAO");
  wsP.addRow(["Data", "Dia", "Motivo", "Tipo"]);
  estilizarCabecalho(wsP.getRow(1));
  for (const p of d.pulados) {
    wsP.addRow([fmtBr(p.data), DIAS_SEMANA_CURTO[weekday(p.data)], p.motivo, p.tipo === "feriado" ? "Feriado" : "Extra"]);
  }
  [14, 8, 50, 12].forEach((w, i) => (wsP.getColumn(i + 1).width = w));

  // ---------------- PARAMETROS ----------------
  const wsX = wb.addWorksheet("PARAMETROS");
  const nomesDias = d.diasSemana.map((x) => DIAS_SEMANA_CURTO[x]).join(", ");
  const params: [string, string | number][] = [
    ["Cronograma", d.titulo],
    ["Serviço", `${servico.codigo} — ${servico.nome}`],
    ["Frequência (código)", servico.frequencia],
    ["Data início", fmtBr(d.dataInicio)],
    ["Data fim", fmtBr(d.dataFim)],
    ["Dias da semana", nomesDias],
    ["Posição inicial do ciclo", d.slotInicial],
    ["Continuidade", d.continuidade ?? "—"],
    ["Dias operados", d.dias.length],
    ["Dias sem operação (feriados/extras)", d.pulados.length],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
  ];
  params.forEach(([k, v]) => {
    const r = wsX.addRow([k, v]);
    r.getCell(1).font = { bold: true };
    r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: VERDE_CLARO } };
  });
  wsX.getColumn(1).width = 36;
  wsX.getColumn(2).width = 70;

  return wb;
}

export async function baixarExcel(d: DadosExportacao, nomeArquivo: string) {
  const wb = await gerarWorkbook(d);
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
