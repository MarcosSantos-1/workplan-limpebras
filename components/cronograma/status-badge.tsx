import { Pill } from "@/components/design/kit";
import type { StatusCronograma } from "@/lib/cronogramas";

const MAP: Record<StatusCronograma, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  publicado: { label: "Publicado", cls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  arquivado: { label: "Arquivado", cls: "border-zinc-500/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-300" },
};

export function StatusBadge({ status }: { status: StatusCronograma }) {
  const s = MAP[status];
  return <Pill className={s.cls}>{s.label}</Pill>;
}
