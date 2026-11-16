/** Gera o legado pelo exportador e compara a aba CRONOGRAMA com docs/cronogramas/GO.xlsx. */
import ExcelJS from "exceljs";
import { GO } from "../lib/plano/servicos";
import { gerarLegado, gerarDias } from "../lib/plano/motor";
import { gerarWorkbook } from "../lib/excel";

const txt = (v: unknown) => String(v ?? "").trim();
const datas = (row: ExcelJS.Row, from: number) => {
  const out: string[] = [];
  for (let c = from; c <= row.cellCount; c++) out.push(...txt(row.getCell(c).value).split(";").map((s) => s.trim()).filter(Boolean));
  return out;
};

async function main() {
  const orig = new ExcelJS.Workbook();
  await orig.xlsx.readFile("docs/cronogramas/GO.xlsx");
  const wo = orig.worksheets[0];
  const leg = gerarLegado(GO, "2027-03-13");
  const wb = await gerarWorkbook({ servico: GO, titulo: "legado", dataInicio: "2025-09-01", dataFim: "2027-03-13", slotInicial: 1, diasSemana: GO.legado.diasSemana, dias: leg.dias, pulados: [] });
  const wn = wb.getWorksheet("CRONOGRAMA")!;
  let erros = 0;
  for (let r = 1; r <= wo.rowCount; r++) {
    const a = wo.getRow(r), b = wn.getRow(r);
    for (let c = 1; c <= 5; c++) if (txt(a.getCell(c).value) !== txt(b.getCell(c).value)) { erros++; console.log("cel", r, c, txt(a.getCell(c).value), "|", txt(b.getCell(c).value)); }
    if (r > 1) {
      const da = [...new Set(datas(a, 6))].sort(), db = datas(b, 6).sort();
      if (da.join() !== db.join()) { erros++; console.log("datas linha", r, da.length, db.length); }
    }
  }
  console.log("Linhas:", wo.rowCount, "vs", wn.rowCount, "| divergências:", erros);
  const novo = gerarDias(GO, { dataInicio: "2026-11-17", dataFim: "2027-12-31", slotInicial: 8, diasSemana: [1,2,3,4,5] });
  const wb2 = await gerarWorkbook({ servico: GO, titulo: "novo", dataInicio: "2026-11-17", dataFim: "2027-12-31", slotInicial: 8, diasSemana: [1,2,3,4,5], dias: novo.dias, pulados: novo.pulados });
  await wb2.xlsx.writeFile(process.argv[2]);
  console.log("Abas:", wb2.worksheets.map((w) => `${w.name}(${w.rowCount})`).join(", "));
}
main();
