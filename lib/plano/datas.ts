/**
 * Utilitários de data trabalhando SEMPRE com strings ISO "yyyy-MM-dd".
 * Toda a aritmética é feita em UTC para não sofrer com fuso/horário de verão.
 */

export type IsoDate = string; // "yyyy-MM-dd"

export const DIAS_SEMANA_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;
export const DIAS_SEMANA_LONGO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export function isIsoDate(v: unknown): v is IsoDate {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export function isoToUtc(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function utcToIso(d: Date): IsoDate {
  return d.toISOString().slice(0, 10);
}

export function makeIso(y: number, m: number, d: number): IsoDate {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function addDays(iso: IsoDate, n: number): IsoDate {
  const d = isoToUtc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return utcToIso(d);
}

/** 0 = domingo … 6 = sábado */
export function weekday(iso: IsoDate): number {
  return isoToUtc(iso).getUTCDay();
}

export function diffDays(a: IsoDate, b: IsoDate): number {
  return Math.round((isoToUtc(b).getTime() - isoToUtc(a).getTime()) / 86_400_000);
}

/** yyyy-MM-dd → dd/MM/yyyy */
export function fmtBr(iso?: IsoDate | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** dd/MM/yyyy → yyyy-MM-dd (ou null) */
export function parseBr(br: string): IsoDate | null {
  const m = br.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Data de hoje (horário local do navegador) em ISO. */
export function todayIso(): IsoDate {
  const d = new Date();
  return makeIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function* eachDay(start: IsoDate, end: IsoDate): Generator<IsoDate> {
  let cur = start;
  while (cur <= end) {
    yield cur;
    cur = addDays(cur, 1);
  }
}

export function yearsBetween(start: IsoDate, end: IsoDate): number[] {
  const a = Number(start.slice(0, 4));
  const b = Number(end.slice(0, 4));
  const out: number[] = [];
  for (let y = a; y <= b; y++) out.push(y);
  return out;
}
