"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, FolderClock, Loader2, Plus } from "lucide-react";
import { GLASS_CARD, PageHero } from "@/components/design/kit";
import { StatusBadge } from "@/components/cronograma/status-badge";
import { listarCronogramas, type CronogramaDoc } from "@/lib/cronogramas";
import { fmtBr } from "@/lib/plano/datas";
import { cn } from "@/lib/utils";

export default function CronogramasPage() {
  const [lista, setLista] = useState<CronogramaDoc[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarCronogramas("GO")
      .then(setLista)
      .catch((e: Error) => {
        setErro(e.message);
        setLista([]);
      });
  }, []);

  return (
    <>
      <PageHero
        icon={FolderClock}
        title="Cronogramas salvos"
        subtitle="Rascunhos, publicados e arquivados. Só os publicados entram no plano do dia."
        right={
          <Link
            href="/gerador/go"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" /> Novo cronograma GO
          </Link>
        }
      />
      {erro && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Erro ao ler o Firestore: {erro}
        </div>
      )}
      <div className={cn("overflow-hidden rounded-2xl", GLASS_CARD)}>
        {lista === null ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nenhum cronograma salvo ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/25">
              <tr className="text-left text-muted-foreground">
                <th className="h-12 px-4 font-medium">Título</th>
                <th className="px-4 font-medium">Período</th>
                <th className="px-4 font-medium">Pos. inicial</th>
                <th className="px-4 font-medium">Dias</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-t border-border/30 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`/cronogramas/${c.id}`} className="font-semibold hover:text-emerald-600 hover:underline">
                      {c.titulo}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 tabular-nums">
                    {fmtBr(c.dataInicio)} → {fmtBr(c.dataFim)}
                  </td>
                  <td className="px-4 font-mono">{c.slotInicial}</td>
                  <td className="px-4 tabular-nums">{c.dias?.length ?? 0}</td>
                  <td className="px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 text-xs text-muted-foreground">
                    {c.criadoEm?.toDate?.().toLocaleString("pt-BR") ?? "—"}
                    <br />
                    {c.criadoPor?.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
