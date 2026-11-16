/**
 * Valida o motor contra a planilha docs/cronogramas/GO.xlsx:
 * recria o cronograma seg–sáb pela regra e compara mapa a mapa, data a data.
 *   npx tsx scripts/validar-legado.ts
 */
import ExcelJS from "exceljs";
import { GO, slotDoMapa } from "../lib/plano/servicos";
import { calcularContinuidade, datasPorMapa, gerarDias, gerarLegado } from "../lib/plano/motor";
import { parseBr, fmtBr } from "../lib/plano/datas";

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("docs/cronogramas/GO.xlsx");
  const ws = wb.worksheets[0];
  const planilha: Record<string, Set<string>> = {};
  let fim = "0000-00-00";
  ws.eachRow((row, r) => {
    if (r === 1) return;
    const datas = ["F", "G"].flatMap((c) =>
      String(row.getCell(c).value ?? "").split(";").map((s) => parseBr(s)).filter((x): x is string => !!x),
    );
    for (const col of ["B", "C", "D", "E"]) {
      const cod = String(row.getCell(col).value ?? "").trim();
      if (!cod) continue;
      planilha[cod] = new Set(datas);
      for (const d of datas) if (d > fim) fim = d;
    }
  });

  const leg = gerarLegado(GO, fim);
  const gerado = datasPorMapa(GO, leg.dias);
  let erros = 0, conferidas = 0;
  for (const [cod, datas] of Object.entries(planilha)) {
    const g = new Set(gerado[cod] ?? []);
    for (const d of datas) { conferidas++; if (!g.has(d)) { erros++; console.log("FALTA no motor", cod, d); } }
    for (const d of g) if (!datas.has(d)) { erros++; console.log("SOBRA no motor", cod, d); }
  }
  console.log(`Mapas: ${Object.keys(planilha).length} | datas conferidas: ${conferidas} | divergências: ${erros}`);

  // Exemplo do dia: hoje 16/11/2026 ST20500GO0007 → amanhã ST20500GO0008
  const c = calcularContinuidade(GO, "2026-11-17", [leg]);
  console.log("Último dia antes de 17/11/2026:", fmtBr(c.ultimoDia?.data), "slot", c.ultimoDia?.slot, "→ slot inicial", c.slotInicial, "(ST20500GO0008 é slot", slotDoMapa(GO, "ST20500GO0008") + ")");
  const novo = gerarDias(GO, { dataInicio: "2026-11-17", dataFim: "2026-12-31", slotInicial: c.slotInicial, diasSemana: [1,2,3,4,5] });
  console.log(novo.dias.slice(0, 8).map((d) => `${fmtBr(d.data)}→${d.slot}`).join("  "));
  console.log("Pulados:", novo.pulados.map((p) => `${fmtBr(p.data)} ${p.motivo}`).join(" | "));
  process.exit(erros ? 1 : 0);
}
main();
