/**
 * Calendário anual A4 (retrato) com os feriados — gerado em PDF vetorial com @react-pdf/renderer.
 * Carregado só no navegador (import dinâmico em lib/calendario-pdf.ts).
 */

import { Document, Image, Page, StyleSheet, Svg, Defs, LinearGradient, Stop, Rect, Text, View } from "@react-pdf/renderer";
import { DIAS_SEMANA_CURTO, fmtBr, makeIso, weekday } from "@/lib/plano/datas";
import type { TipoFeriado } from "@/lib/plano/feriados";

export type TipoMarcacao = TipoFeriado | "personalizado";

export interface MarcacaoCalendario {
  data: string;
  nome: string;
  tipo: TipoMarcacao;
}

export interface OpcoesCalendario {
  ano: number;
  titulo: string;
  subtitulo: string;
  marcacoes: MarcacaoCalendario[];
  logoUrl: string;
  rodape?: string;
}

export const CORES_TIPO: Record<TipoMarcacao, string> = {
  nacional: "#e11d48",
  estadual: "#d97706",
  municipal: "#7c3aed",
  facultativo: "#0284c7",
  personalizado: "#0d9488",
};

export const ROTULO_TIPO: Record<TipoMarcacao, string> = {
  nacional: "Feriado nacional",
  estadual: "Feriado estadual",
  municipal: "Feriado municipal",
  facultativo: "Ponto facultativo",
  personalizado: "Data da empresa",
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const INICIAIS = ["D", "S", "T", "Q", "Q", "S", "S"];

const VERDE = "#047857";
const TEXTO = "#18181b";
const CINZA = "#71717a";
const BORDA = "#e4e4e7";

const s = StyleSheet.create({
  page: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 30, fontFamily: "Helvetica", color: TEXTO, fontSize: 8 },
  header: { height: 64, borderRadius: 10, overflow: "hidden", marginBottom: 14, position: "relative" },
  headerInner: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 },
  logo: { width: 128, height: 34, objectFit: "contain" },
  headerTitle: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 22, textAlign: "right" },
  headerSub: { color: "#d1fae5", fontSize: 8.5, textAlign: "right", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  month: { width: "31.8%", marginBottom: 10, borderWidth: 0.75, borderColor: BORDA, borderRadius: 8, padding: 6 },
  monthName: { fontFamily: "Helvetica-Bold", fontSize: 10, color: VERDE, marginBottom: 4, paddingLeft: 2 },
  row: { flexDirection: "row" },
  head: { width: "14.2857%", textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 7, color: CINZA, paddingBottom: 2 },
  cell: { width: "14.2857%", height: 15.5, alignItems: "center", justifyContent: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  day: { fontSize: 8 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: VERDE, marginBottom: 5 },
  legend: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 2 },
  legendSw: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  list: { flexDirection: "row", flexWrap: "wrap" },
  listItem: { width: "33.33%", flexDirection: "row", alignItems: "center", paddingVertical: 1.6, paddingRight: 6 },
  listDate: { fontFamily: "Helvetica-Bold", width: 36 },
  listWd: { color: CINZA, width: 20 },
  footer: { position: "absolute", bottom: 14, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: CINZA },
});

function Mes({ ano, mes, porData }: { ano: number; mes: number; porData: Map<string, MarcacaoCalendario> }) {
  const primeiro = makeIso(ano, mes, 1);
  const offset = weekday(primeiro);
  const total = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const celulas: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (celulas.length < 42) celulas.push(null);
  const semanas = Array.from({ length: 6 }, (_, i) => celulas.slice(i * 7, i * 7 + 7));

  return (
    <View style={s.month} wrap={false}>
      <Text style={s.monthName}>{MESES[mes - 1]}</Text>
      <View style={s.row}>
        {INICIAIS.map((l, i) => (
          <Text key={i} style={[s.head, i === 0 ? { color: "#e11d48" } : {}]}>
            {l}
          </Text>
        ))}
      </View>
      {semanas.map((sem, wi) => (
        <View key={wi} style={s.row}>
          {sem.map((d, di) => {
            if (!d) return <View key={di} style={s.cell} />;
            const m = porData.get(makeIso(ano, mes, d));
            const cor = m ? CORES_TIPO[m.tipo] : null;
            const contorno = m?.tipo === "facultativo";
            return (
              <View key={di} style={s.cell}>
                <View
                  style={[
                    s.dot,
                    cor && !contorno ? { backgroundColor: cor } : {},
                    cor && contorno ? { borderWidth: 1.2, borderColor: cor } : {},
                  ]}
                >
                  <Text
                    style={[
                      s.day,
                      di === 0 || di === 6 ? { color: di === 0 ? "#be123c" : CINZA } : {},
                      cor ? { color: contorno ? cor : "#ffffff", fontFamily: "Helvetica-Bold" } : {},
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function CalendarioPdf({ ano, titulo, subtitulo, marcacoes, logoUrl, rodape }: OpcoesCalendario) {
  const doAno = marcacoes.filter((m) => m.data.startsWith(String(ano))).sort((a, b) => a.data.localeCompare(b.data));
  const porData = new Map(doAno.map((m) => [m.data, m]));
  const tiposUsados = (Object.keys(CORES_TIPO) as TipoMarcacao[]).filter((t) => doAno.some((m) => m.tipo === t));

  return (
    <Document title={`${titulo} ${ano}`} author="Limpebras" creator="WorkPlan Limpebras">
      <Page size="A4" orientation="portrait" style={s.page}>
        <View style={s.header}>
          <Svg width="539" height="64" style={{ position: "absolute", top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#059669" />
                <Stop offset="0.55" stopColor="#047857" />
                <Stop offset="1" stopColor="#115e59" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="539" height="64" fill="url(#g)" />
          </Svg>
          <View style={s.headerInner}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logoUrl} style={s.logo} />
            <View>
              <Text style={s.headerTitle}>
                {titulo} {ano}
              </Text>
              <Text style={s.headerSub}>{subtitulo}</Text>
            </View>
          </View>
        </View>

        <View style={s.grid}>
          {Array.from({ length: 12 }, (_, i) => (
            <Mes key={i} ano={ano} mes={i + 1} porData={porData} />
          ))}
        </View>

        <View wrap={false}>
          <View style={s.legend}>
            {tiposUsados.map((t) => (
              <View key={t} style={s.legendItem}>
                <View
                  style={[
                    s.legendSw,
                    t === "facultativo" ? { borderWidth: 1.2, borderColor: CORES_TIPO[t] } : { backgroundColor: CORES_TIPO[t] },
                  ]}
                />
                <Text>{ROTULO_TIPO[t]}</Text>
              </View>
            ))}
          </View>
          <Text style={s.sectionTitle}>Datas de {ano}</Text>
        </View>
        <View style={s.list}>
          {doAno.map((m) => (
            <View key={m.data + m.nome} style={s.listItem} wrap={false}>
              <View style={[s.legendSw, m.tipo === "facultativo" ? { borderWidth: 1.2, borderColor: CORES_TIPO[m.tipo] } : { backgroundColor: CORES_TIPO[m.tipo] }]} />
              <Text style={s.listDate}>{fmtBr(m.data).slice(0, 5)}</Text>
              <Text style={s.listWd}>{DIAS_SEMANA_CURTO[weekday(m.data)]}</Text>
              <Text style={{ flex: 1 }}>{m.nome}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>{rodape ?? "Limpebras · Lote III — Zona Norte de São Paulo"}</Text>
          <Text render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${pageNumber}/${totalPages}` : "")} />
        </View>
      </Page>
    </Document>
  );
}
