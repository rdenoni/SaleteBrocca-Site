import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/student/AuthCard";
import { SetPasswordForm } from "@/components/student/SetPasswordForm";
import { LOGIN_PATH, SET_PASSWORD_PATH } from "@/lib/auth-paths";
import { isDemoMode, requireStudentSession } from "@/lib/content/student";

export const metadata: Metadata = {
  title: "Definir senha",
};

export default async function SetPasswordPage() {
  if (isDemoMode()) {
    return (
      <AuthCard
        title="Definir senha"
        lead="O login ainda não está ativo."
        note="A criação de senha será ativada junto com o login."
        footer={<Link href={LOGIN_PATH}>Voltar para o login</Link>}
      />
    );
  }

  /* Só chega aqui com a sessão aberta pelo link do e-mail (/auth/confirmar). */
  await requireStudentSession(SET_PASSWORD_PATH);

  return (
    <AuthCard title="Definir senha" lead="Escolha a senha que você vai usar para entrar na Área do Aluno.">
      <SetPasswordForm />
    </AuthCard>
  );
}
