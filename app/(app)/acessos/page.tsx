"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Ban,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BTN_EMERALD, BTN_SECONDARY, FieldLabel, GLASS_CARD, PageHero, Pill, SectionTitle, StatCard } from "@/components/design/kit";
import { useAuth } from "@/lib/auth";
import {
  atualizarUsuario,
  ehAdmin,
  enviarRedefinicaoSenha,
  liberarAcesso,
  listarUsuarios,
  normEmail,
  PAPEL_DESCRICAO,
  PAPEL_LABEL,
  removerConvite,
  STATUS_LABEL,
  type Papel,
  type StatusUsuario,
  type Usuario,
} from "@/lib/usuarios";
import { cn } from "@/lib/utils";

const STATUS_CLS: Record<StatusUsuario, string> = {
  ativo: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  pendente: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  bloqueado: "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const PAPEIS: Papel[] = ["leitor", "editor", "admin"];

export default function AcessosPage() {
  const { user, perfil } = useAuth();
  const admin = ehAdmin(perfil);
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel>("leitor");
  const [salvando, setSalvando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) return;
    let vivo = true;
    listarUsuarios()
      .then((l) => vivo && setLista(l))
      .catch((e: Error) => {
        if (!vivo) return;
        toast.error(`Erro ao listar: ${e.message}`);
        setLista([]);
      });
    return () => {
      vivo = false;
    };
  }, [admin, versao]);

  const contagem = useMemo(() => {
    const l = lista ?? [];
    return {
      total: l.length,
      ativo: l.filter((u) => u.status === "ativo").length,
      pendente: l.filter((u) => u.status === "pendente").length,
      bloqueado: l.filter((u) => u.status === "bloqueado").length,
    };
  }, [lista]);

  if (!admin)
    return (
      <div className={cn("rounded-2xl p-6 text-sm text-muted-foreground", GLASS_CARD)}>
        Somente administradores podem gerenciar acessos.
      </div>
    );

  const linkPrimeiroAcesso = typeof window !== "undefined" ? `${window.location.origin}/primeiro-acesso` : "/primeiro-acesso";
  const meuEmail = normEmail(user?.email ?? "");

  async function liberar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await liberarAcesso({ email, nome, papel });
      toast.success("Acesso liberado. Envie o link de primeiro acesso para a pessoa.");
      setEmail("");
      setNome("");
      setPapel("leitor");
      recarregar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function acao(u: Usuario, fn: () => Promise<void>, ok: string) {
    setOcupado(u.email);
    try {
      await fn();
      toast.success(ok);
      recarregar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  function copiarLink() {
    void navigator.clipboard.writeText(linkPrimeiroAcesso).then(() => toast.success("Link copiado."));
  }

  return (
    <>
      <PageHero
        icon={ShieldCheck}
        title="Acessos"
        subtitle="Libere e-mails, defina o papel de cada pessoa e bloqueie quem não deve mais entrar."
        right={
          <button
            onClick={copiarLink}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
          >
            <Copy className="h-4 w-4" /> Copiar link de primeiro acesso
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Cadastrados" value={contagem.total} />
        <StatCard icon={UserCheck} tone="emerald" label="Ativos" value={contagem.ativo} />
        <StatCard icon={Hourglass} tone="amber" label="Aguardando 1º acesso" value={contagem.pendente} />
        <StatCard icon={Ban} tone="rose" label="Bloqueados" value={contagem.bloqueado} />
      </div>

      <section className={cn("space-y-4 rounded-2xl p-5", GLASS_CARD)}>
        <SectionTitle
          icon={UserPlus}
          title="Liberar novo acesso"
          desc={
            <>
              A pessoa entra em <span className="font-mono text-xs">{linkPrimeiroAcesso}</span>, informa este e-mail e cria a própria senha.
            </>
          }
        />
        <form onSubmit={liberar} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          <div>
            <FieldLabel>E-mail</FieldLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com.br" required />
          </div>
          <div>
            <FieldLabel>Nome</FieldLabel>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome e sobrenome" required />
          </div>
          <div>
            <FieldLabel hint={PAPEL_DESCRICAO[papel]}>Papel</FieldLabel>
            <select
              value={papel}
              onChange={(e) => setPapel(e.target.value as Papel)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PAPEIS.map((p) => (
                <option key={p} value={p}>
                  {PAPEL_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={salvando} className={cn("h-9", BTN_EMERALD)}>
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Liberar
          </Button>
        </form>
      </section>

      <div className={cn("overflow-hidden rounded-2xl", GLASS_CARD)}>
        {lista === null ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/25">
                <tr className="text-left text-muted-foreground">
                  <th className="h-12 px-4 font-medium">Pessoa</th>
                  <th className="px-4 font-medium">Papel</th>
                  <th className="px-4 font-medium">Status</th>
                  <th className="px-4 font-medium">Liberado</th>
                  <th className="px-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => {
                  const eu = u.email === meuEmail;
                  const busy = ocupado === u.email;
                  return (
                    <tr key={u.email} className="border-t border-border/30 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {u.nome || "—"} {eu && <span className="text-xs font-normal text-muted-foreground">(você)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4">
                        {eu ? (
                          <span className="text-sm">{PAPEL_LABEL[u.papel]}</span>
                        ) : (
                          <select
                            value={u.papel}
                            disabled={busy}
                            onChange={(e) =>
                              void acao(u, () => atualizarUsuario(u.email, { papel: e.target.value as Papel }), "Papel atualizado.")
                            }
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                          >
                            {PAPEIS.map((p) => (
                              <option key={p} value={p}>
                                {PAPEL_LABEL[p]}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4">
                        <Pill className={STATUS_CLS[u.status]}>{STATUS_LABEL[u.status]}</Pill>
                      </td>
                      <td className="whitespace-nowrap px-4 text-xs text-muted-foreground">
                        {u.criadoEm?.toDate?.().toLocaleDateString("pt-BR") ?? "—"}
                        {u.criadoPor && <div>por {u.criadoPor}</div>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {busy && <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />}
                          {!eu && u.status === "ativo" && (
                            <>
                              <Button
                                className={cn("h-7 px-2 text-xs", BTN_SECONDARY)}
                                disabled={busy}
                                title="Enviar e-mail de redefinição de senha"
                                onClick={() => void acao(u, () => enviarRedefinicaoSenha(u.email), `Link de redefinição enviado para ${u.email}.`)}
                              >
                                <KeyRound className="h-3.5 w-3.5" /> Redefinir senha
                              </Button>
                              <Button
                                className={cn("h-7 px-2 text-xs", BTN_SECONDARY)}
                                disabled={busy}
                                onClick={() =>
                                  window.confirm(`Bloquear ${u.email}? A pessoa perde o acesso na hora.`) &&
                                  void acao(u, () => atualizarUsuario(u.email, { status: "bloqueado" }), "Acesso bloqueado.")
                                }
                              >
                                <Ban className="h-3.5 w-3.5 text-rose-600" /> Bloquear
                              </Button>
                            </>
                          )}
                          {u.status === "bloqueado" && (
                            <Button
                              className={cn("h-7 px-2 text-xs", BTN_SECONDARY)}
                              disabled={busy}
                              onClick={() =>
                                void acao(u, () => atualizarUsuario(u.email, { status: u.uid ? "ativo" : "pendente" }), "Acesso reativado.")
                              }
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> Reativar
                            </Button>
                          )}
                          {u.status === "pendente" && (
                            <>
                              <Button
                                className={cn("h-7 px-2 text-xs", BTN_SECONDARY)}
                                onClick={() => {
                                  const texto = `Olá${u.nome ? `, ${u.nome.split(" ")[0]}` : ""}! Seu acesso ao WorkPlan foi liberado. Entre em ${linkPrimeiroAcesso}, informe ${u.email} e crie sua senha.`;
                                  void navigator.clipboard.writeText(texto).then(() => toast.success("Convite copiado."));
                                }}
                              >
                                <Mail className="h-3.5 w-3.5" /> Copiar convite
                              </Button>
                              <Button
                                className={cn("h-7 px-2 text-xs", BTN_SECONDARY)}
                                disabled={busy}
                                onClick={() =>
                                  window.confirm(`Remover a liberação de ${u.email}?`) &&
                                  void acao(u, () => removerConvite(u.email), "Liberação removida.")
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Remover
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Papéis: <b>Leitor</b> consulta · <b>Editor</b> gera, salva e publica cronogramas · <b>Administrador</b> também gerencia acessos.
        Bloquear corta o acesso na hora (a conta continua existindo no Firebase Authentication).
      </p>
    </>
  );
}
