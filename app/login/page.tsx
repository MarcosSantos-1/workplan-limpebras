"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BTN_EMERALD, BTN_SECONDARY } from "@/components/design/kit";
import { AuthCard, AuthErro, AuthScreen } from "@/components/layout/auth-card";
import { traduzErroAuth, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(email, senha);
    } catch (err) {
      setErro(traduzErroAuth((err as { code?: string }).code));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthCard titulo="WorkPlan" subtitulo="Plano de trabalho · Lote III">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-3">
          <Input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        <div className="-mt-1 text-right">
          <Link href={`/recuperar-senha${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Esqueci minha senha
          </Link>
        </div>
        {erro && <AuthErro>{erro}</AuthErro>}
        <Button type="submit" disabled={enviando} className={cn("h-10 w-full", BTN_EMERALD)}>
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Entrar
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> é sua primeira vez? <span className="h-px flex-1 bg-border" />
      </div>
      <Link href="/primeiro-acesso" className={cn("inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm", BTN_SECONDARY)}>
        <KeyRound className="h-4 w-4" /> Primeiro acesso
      </Link>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AuthScreen>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthScreen>
  );
}
