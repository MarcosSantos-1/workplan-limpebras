/**
 * Controle de acessos.
 *
 * Coleção `usuarios` — id do documento = e-mail em minúsculas.
 *   { email, nome, papel, status, uid?, criadoEm, criadoPor, ativadoEm?, atualizadoEm? }
 *
 * Fluxo:
 *   1. Admin libera o e-mail (status "pendente").
 *   2. A pessoa abre "Primeiro acesso", informa o e-mail; se houver convite pendente,
 *      cria a própria senha (conta no Firebase Auth) e o convite vira "ativo".
 *   3. Daí em diante entra com e-mail/senha. "Esqueci a senha" manda e-mail de redefinição.
 *   Só usuários "ativo" passam do login (app e regras do Firestore).
 *
 * Primeiro administrador: enquanto `config/bootstrap` não existe, o primeiro usuário logado
 * pode se declarar admin (uma única vez).
 */

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type Papel = "admin" | "editor" | "leitor";
export type StatusUsuario = "pendente" | "ativo" | "bloqueado";

export interface Usuario {
  email: string;
  nome: string;
  papel: Papel;
  status: StatusUsuario;
  uid?: string | null;
  criadoEm?: Timestamp;
  criadoPor?: string | null;
  ativadoEm?: Timestamp | null;
  atualizadoEm?: Timestamp | null;
}

export const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Administrador",
  editor: "Editor",
  leitor: "Leitor",
};

export const PAPEL_DESCRICAO: Record<Papel, string> = {
  admin: "Tudo + gerencia acessos",
  editor: "Gera, salva e publica cronogramas",
  leitor: "Só consulta plano, cronogramas e feriados",
};

export const STATUS_LABEL: Record<StatusUsuario, string> = {
  pendente: "Aguardando 1º acesso",
  ativo: "Ativo",
  bloqueado: "Bloqueado",
};

const COL = "usuarios";

export function normEmail(e: string): string {
  return e.trim().toLowerCase();
}

export function podeEditar(p: Usuario | null | undefined): boolean {
  return !!p && p.status === "ativo" && (p.papel === "admin" || p.papel === "editor");
}

export function ehAdmin(p: Usuario | null | undefined): boolean {
  return !!p && p.status === "ativo" && p.papel === "admin";
}

/* ---------------- primeiro acesso ---------------- */

/** true se existe convite pendente para o e-mail. */
export async function temConvitePendente(email: string): Promise<boolean> {
  try {
    const s = await getDoc(doc(db, COL, normEmail(email)));
    return s.exists() && s.data().status === "pendente";
  } catch {
    // regras negam a leitura quando não há convite pendente
    return false;
  }
}

export async function ativarPrimeiroAcesso(email: string, senha: string): Promise<void> {
  const e = normEmail(email);
  const cred = await createUserWithEmailAndPassword(auth, e, senha);
  const ref = doc(db, COL, e);
  const convite = await getDoc(ref);
  await updateDoc(ref, { status: "ativo", uid: cred.user.uid, ativadoEm: serverTimestamp() });
  const nome = convite.exists() ? (convite.data().nome as string) : "";
  if (nome) await updateProfile(cred.user, { displayName: nome }).catch(() => undefined);
}

/* ---------------- recuperação de senha ---------------- */

export async function enviarRedefinicaoSenha(email: string): Promise<void> {
  auth.languageCode = "pt-BR";
  const e = normEmail(email);
  try {
    await sendPasswordResetEmail(auth, e, { url: `${window.location.origin}/login` });
  } catch (err) {
    // domínio ainda não autorizado no Firebase → envia sem link de retorno
    if ((err as { code?: string }).code === "auth/unauthorized-continue-uri") {
      await sendPasswordResetEmail(auth, e);
      return;
    }
    throw err;
  }
}

/* ---------------- administração ---------------- */

export async function listarUsuarios(): Promise<Usuario[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as Usuario).sort((a, b) => a.email.localeCompare(b.email));
}

export async function liberarAcesso(dados: { email: string; nome: string; papel: Papel }): Promise<void> {
  const e = normEmail(dados.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error("E-mail inválido.");
  const ref = doc(db, COL, e);
  const atual = await getDoc(ref);
  if (atual.exists()) throw new Error("Esse e-mail já está cadastrado.");
  await setDoc(ref, {
    email: e,
    nome: dados.nome.trim(),
    papel: dados.papel,
    status: "pendente",
    uid: null,
    criadoEm: serverTimestamp(),
    criadoPor: auth.currentUser?.email ?? null,
    ativadoEm: null,
  });
}

export async function atualizarUsuario(email: string, mudancas: Partial<Pick<Usuario, "papel" | "status" | "nome">>) {
  await updateDoc(doc(db, COL, normEmail(email)), { ...mudancas, atualizadoEm: serverTimestamp() });
}

/** Remove convite que ainda não foi usado. */
export async function removerConvite(email: string) {
  await deleteDoc(doc(db, COL, normEmail(email)));
}

/* ---------------- primeiro administrador ---------------- */

export async function bootstrapDisponivel(): Promise<boolean> {
  try {
    const s = await getDoc(doc(db, "config", "bootstrap"));
    return !s.exists();
  } catch {
    return false;
  }
}

export async function tornarPrimeiroAdmin(nome: string): Promise<void> {
  const u = auth.currentUser;
  if (!u?.email) throw new Error("Sem sessão.");
  const e = normEmail(u.email);
  const batch = writeBatch(db);
  batch.set(doc(db, COL, e), {
    email: e,
    nome: nome.trim() || u.displayName || e.split("@")[0],
    papel: "admin",
    status: "ativo",
    uid: u.uid,
    criadoEm: serverTimestamp(),
    criadoPor: e,
    ativadoEm: serverTimestamp(),
  });
  batch.set(doc(db, "config", "bootstrap"), { admin: e, em: serverTimestamp() });
  await batch.commit();
}
