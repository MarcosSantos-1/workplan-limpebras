"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BTN_EMERALD } from "@/components/design/kit";
import { AuthCard, AuthErro, AuthOk, AuthScreen } from "@/components/layout/auth-card";
import { traduzErroAuth } from "@/lib/auth";
import { enviarRedefinicaoSenha } from "@/lib/usuarios";
import { cn } from "@/lib/utils";

function Form() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      await enviarRedefinicaoSenha(email);
      setEnviado(true);
    } catch (err) {
      setErro(traduzErroAuth((err as { code?: string }).code));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <AuthCard titulo="Recuperar senha" subtitulo="Enviaremos um link para você criar uma nova senha.">
      {enviado ? (
        <AuthOk>
          Se <b>{email.trim().toLowerCase()}</b> tiver acesso ao WorkPlan, um e-mail com o link de redefinição chega em alguns minutos.
          Confira também a caixa de spam.
        </AuthOk>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <Input type="email" placeholder="Seu e-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          {erro && <AuthErro>{erro}</AuthErro>}
          <Button type="submit" disabled={ocupado} className={cn("h-10 w-full", BTN_EMERALD)}>
            {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar link
          </Button>
        </form>
      )}
      <Link href="/login" className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
      </Link>
    </AuthCard>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <AuthScreen>
      <Suspense>
        <Form />
      </Suspense>
    </AuthScreen>
  );
}
