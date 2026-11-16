"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, todayIso } from "@/lib/plano/datas";
import { gerarLegado, linhaDoTempo, type SegmentoLinhaTempo } from "@/lib/plano/motor";
import type { ServicoConfig } from "@/lib/plano/servicos";
import { listarPublicados, paraSegmento, type CronogramaDoc } from "@/lib/cronogramas";

/**
 * Linha do tempo vigente de um serviço = cronograma legado (regra antiga)
 * + cronogramas PUBLICADOS no Firestore (o mais recente por data início prevalece).
 */
export function useLinhaTempo(servico: ServicoConfig) {
  const [publicados, setPublicados] = useState<CronogramaDoc[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => {
    setCarregando(true);
    setVersao((v) => v + 1);
  }, []);

  useEffect(() => {
    let vivo = true;
    listarPublicados(servico.codigo)
      .then((l) => {
        if (!vivo) return;
        setPublicados(l);
        setErro(null);
      })
      .catch((e: Error) => {
        if (!vivo) return;
        setErro(e.message || "Falha ao ler o Firestore");
        setPublicados([]);
      })
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [servico.codigo, versao]);

  const segmentos = useMemo<SegmentoLinhaTempo[]>(() => {
    const legado = gerarLegado(servico, addDays(todayIso(), 800));
    return [legado, ...publicados.map(paraSegmento)];
  }, [servico, publicados]);

  const dias = useMemo(() => linhaDoTempo(segmentos), [segmentos]);

  return { segmentos, dias, publicados, carregando, erro, recarregar };
}
