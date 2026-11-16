"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BTN_EMERALD } from "@/components/design/kit";
import { AuthCard, AuthErro, AuthOk, AuthScreen } from "@/components/layout/auth-card";
import { traduzErroAuth } from "@/lib/auth";
import { ativarPrimeiroAcesso, temConvitePendente } from "@/lib/usuarios";
import { cn } from "@/lib/utils";

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"email" | "senha">("email");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      if (await temConvitePendente(email)) setEtapa("senha");
      else
        setErro(
          "Não há primeiro acesso liberado para este e-mail. Confira o endereço com o administrador — se você já criou sua senha, use “Entrar” ou “Esqueci minha senha”.",
        );
    } finally {
      setOcupado(false);
    }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirma) return setErro("As senhas não conferem.");
    setOcupado(true);
    try {
      await ativarPrimeiroAcesso(email, senha);
      router.replace("/");
    } catch (err) {
      setErro(traduzErroAuth((err as { code?: string }).code));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <AuthScreen>
      <AuthCard
        titulo="Primeiro acesso"
        subtitulo={etapa === "email" ? "Informe o e-mail que o administrador liberou." : "Crie a senha que você vai usar para entrar."}
      >
        {etapa === "email" ? (
          <form onSubmit={verificar} className="space-y-4">
            <Input type="email" placeholder="Seu e-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            {erro && <AuthErro>{erro}</AuthErro>}
            <Button type="submit" disabled={ocupado} className={cn("h-10 w-full", BTN_EMERALD)}>
              {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Continuar
            </Button>
          </form>
        ) : (
          <form onSubmit={criar} className="space-y-4">
            <AuthOk>
              <span className="inline-flex items-center gap-1.5">
                <MailCheck className="h-4 w-4" /> {email.trim().toLowerCase()}
              </span>
            </AuthOk>
            <div className="space-y-3">
              <Input type="password" placeholder="Nova senha (mín. 6 caracteres)" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoFocus />
              <Input type="password" placeholder="Repita a senha" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} required />
            </div>
            {erro && <AuthErro>{erro}</AuthErro>}
            <Button type="submit" disabled={ocupado} className={cn("h-10 w-full", BTN_EMERALD)}>
              {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Criar senha e entrar
            </Button>
            <button type="button" onClick={() => setEtapa("email")} className="w-full text-xs text-muted-foreground hover:text-foreground">
              Usar outro e-mail
            </button>
          </form>
        )}
        <Link href="/login" className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      </AuthCard>
    </AuthScreen>
  );
}
