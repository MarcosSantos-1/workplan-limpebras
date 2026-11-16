"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BTN_EMERALD, GLASS_CARD } from "@/components/design/kit";
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
    <form onSubmit={onSubmit} className={cn("w-full max-w-sm space-y-5 rounded-2xl p-8 backdrop-blur-md", GLASS_CARD, "bg-card/90")}>
      <div className="flex justify-center">
        <Image src="/logotipo.png" alt="Limpebras" width={180} height={48} className="h-10 w-auto dark:hidden" style={{ width: "auto" }} priority />
        <Image src="/logotipo-white.png" alt="Limpebras" width={180} height={48} className="hidden h-10 w-auto dark:block" style={{ width: "auto" }} priority />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold">WorkPlan</h1>
        <p className="text-sm text-muted-foreground">Plano de trabalho · Lote III</p>
      </div>
      <div className="space-y-3">
        <Input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
      </div>
      {erro && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{erro}</p>}
      <Button type="submit" disabled={enviando} className={cn("h-10 w-full", BTN_EMERALD)}>
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Entrar
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">Usuários são criados pelo administrador no Firebase.</p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <Image src="/login-bg.jpg" alt="" fill className="-z-10 object-cover" priority />
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-950/60 via-teal-900/40 to-cyan-950/60" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
