"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Crown, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BTN_EMERALD, BTN_SECONDARY } from "@/components/design/kit";
import { AuthCard, AuthScreen } from "./auth-card";
import { useAuth } from "@/lib/auth";
import { bootstrapDisponivel, tornarPrimeiroAdmin, type Usuario } from "@/lib/usuarios";
import { cn } from "@/lib/utils";

/** Tela para quem está logado no Firebase mas não tem acesso ativo ao WorkPlan. */
export function AcessoNegado({ perfil }: { perfil: Usuario | null }) {
  const { user, logout } = useAuth();
  const [bootstrap, setBootstrap] = useState<boolean | null>(perfil ? false : null);
  const [nome, setNome] = useState(user?.displayName ?? "");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (perfil) return;
    let vivo = true;
    bootstrapDisponivel().then((v) => vivo && setBootstrap(v));
    return () => {
      vivo = false;
    };
  }, [perfil]);

  async function virarAdmin() {
    setOcupado(true);
    try {
      await tornarPrimeiroAdmin(nome);
      toast.success("Pronto! Você é o administrador do WorkPlan.");
    } catch (e) {
      toast.error(`Não foi possível: ${(e as Error).message}`);
    } finally {
      setOcupado(false);
    }
  }

  const msg =
    perfil?.status === "bloqueado"
      ? "Seu acesso foi bloqueado. Fale com o administrador."
      : perfil?.status === "pendente"
        ? "Seu cadastro ainda está pendente. Faça o primeiro acesso ou fale com o administrador."
        : "Este e-mail ainda não foi liberado no WorkPlan. Peça ao administrador para liberar seu acesso.";

  return (
    <AuthScreen>
      <AuthCard titulo="Acesso não liberado" subtitulo={user?.email}>
        {bootstrap === null ? (
          <div className="flex justify-center py-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : bootstrap ? (
          <div className="space-y-3">
            <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              <Crown className="mt-0.5 h-4 w-4 shrink-0" />
              <span>O WorkPlan ainda não tem administrador. Como primeira configuração, você pode assumir esse papel (só acontece uma vez).</span>
            </div>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            <Button className={cn("h-10 w-full", BTN_EMERALD)} disabled={ocupado} onClick={() => void virarAdmin()}>
              {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />} Tornar-me administrador
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>{msg}</span>
          </div>
        )}
        <Button className={cn("h-10 w-full", BTN_SECONDARY)} onClick={() => void logout()}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </AuthCard>
    </AuthScreen>
  );
}
