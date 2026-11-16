"use client";

import type { OpcoesCalendario } from "@/components/feriados/calendario-pdf";

/** Gera o PDF do calendário no navegador (bibliotecas carregadas sob demanda). */
export async function gerarCalendarioPdf(opcoes: OpcoesCalendario): Promise<Blob> {
  const [{ pdf }, { CalendarioPdf }, { createElement }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/feriados/calendario-pdf"),
    import("react"),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdf(createElement(CalendarioPdf, opcoes) as any).toBlob();
}

export function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
