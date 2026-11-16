"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { normEmail, type Usuario } from "./usuarios";

interface AuthCtx {
  user: User | null;
  /** Cadastro em `usuarios` (null = sem cadastro). undefined enquanto carrega. */
  perfil: Usuario | null | undefined;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authPronto, setAuthPronto] = useState(false);
  const [perfil, setPerfil] = useState<Usuario | null | undefined>(undefined);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setPerfil(u ? undefined : null);
        setAuthPronto(true);
      }),
    [],
  );

  // Perfil em tempo real: bloqueio/troca de papel vale na hora.
  useEffect(() => {
    if (!user?.email) return;
    return onSnapshot(
      doc(db, "usuarios", normEmail(user.email)),
      (s) => setPerfil(s.exists() ? (s.data() as Usuario) : null),
      () => setPerfil(null),
    );
  }, [user]);

  const value: AuthCtx = {
    user,
    perfil,
    loading: !authPronto || (!!user && perfil === undefined),
    login: async (email, senha) => {
      await signInWithEmailAndPassword(auth, normEmail(email), senha);
    },
    logout: () => signOut(auth),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth fora do AuthProvider");
  return v;
}

export function traduzErroAuth(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/email-already-in-use":
      return "Este e-mail já tem senha criada. Use “Entrar” ou “Esqueci minha senha”.";
    case "auth/weak-password":
      return "Senha fraca: use pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos.";
    case "auth/network-request-failed":
      return "Sem conexão com o servidor.";
    case "auth/operation-not-allowed":
      return "Login por e-mail/senha não está habilitado no Firebase.";
    default:
      return "Não foi possível concluir. Tente novamente.";
  }
}
