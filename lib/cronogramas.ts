/**
 * Persistência dos cronogramas no Firestore.
 *
 * Coleção `cronogramas` — um documento por cronograma gerado:
 *   servico, frequencia, titulo, observacoes,
 *   dataInicio, dataFim, slotInicial, diasSemana, diasExtrasSemOperacao,
 *   dias:   [{ data, slot }]            ← dias operados (fonte da verdade)
 *   mapas:  { CV10500GO0001: [datas] }  ← visão por mapa, pronta p/ outros sistemas
 *   pulados, continuidade, status, criadoEm/Por, publicadoEm/Por
 *
 * Só cronogramas com status "publicado" entram na linha do tempo do plano online.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { DiaOperado, DiaPulado, SegmentoLinhaTempo } from "./plano/motor";
import type { IsoDate } from "./plano/datas";

export type StatusCronograma = "rascunho" | "publicado" | "arquivado";

export interface CronogramaDoc {
  id?: string;
  servico: string;
  frequencia: string;
  titulo: string;
  observacoes?: string;
  dataInicio: IsoDate;
  dataFim: IsoDate;
  slotInicial: number;
  diasSemana: number[];
  diasExtrasSemOperacao: { data: IsoDate; nome: string }[];
  dias: DiaOperado[];
  mapas: Record<string, IsoDate[]>;
  pulados: DiaPulado[];
  continuidade: { ultimaData: IsoDate | null; ultimoSlot: number | null; origem: string | null; slotManual: boolean };
  status: StatusCronograma;
  versaoMotor: number;
  criadoEm?: Timestamp;
  criadoPor?: { uid: string; email: string | null };
  publicadoEm?: Timestamp | null;
  publicadoPor?: { uid: string; email: string | null } | null;
}

const COL = "cronogramas";

function quem() {
  const u = auth.currentUser;
  return u ? { uid: u.uid, email: u.email } : { uid: "anon", email: null };
}

export async function salvarCronograma(
  c: Omit<CronogramaDoc, "id" | "criadoEm" | "criadoPor" | "publicadoEm" | "publicadoPor">,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...c,
    criadoEm: serverTimestamp(),
    criadoPor: quem(),
    publicadoEm: c.status === "publicado" ? serverTimestamp() : null,
    publicadoPor: c.status === "publicado" ? quem() : null,
  });
  return ref.id;
}

export async function listarCronogramas(servico: string): Promise<CronogramaDoc[]> {
  const snap = await getDocs(query(collection(db, COL), where("servico", "==", servico)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as CronogramaDoc) }))
    .sort((a, b) => (b.criadoEm?.toMillis?.() ?? 0) - (a.criadoEm?.toMillis?.() ?? 0));
}

export async function listarPublicados(servico: string): Promise<CronogramaDoc[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("servico", "==", servico), where("status", "==", "publicado")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CronogramaDoc) }));
}

export async function obterCronograma(id: string): Promise<CronogramaDoc | null> {
  const s = await getDoc(doc(db, COL, id));
  return s.exists() ? { id: s.id, ...(s.data() as CronogramaDoc) } : null;
}

export async function alterarStatus(id: string, status: StatusCronograma) {
  await updateDoc(doc(db, COL, id), {
    status,
    ...(status === "publicado" ? { publicadoEm: serverTimestamp(), publicadoPor: quem() } : {}),
  });
}

export function paraSegmento(c: CronogramaDoc): SegmentoLinhaTempo {
  return { id: c.id ?? c.titulo, rotulo: c.titulo, dataInicio: c.dataInicio, dataFim: c.dataFim, dias: c.dias };
}

