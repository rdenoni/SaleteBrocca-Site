import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/student/AuthCard";
import { RecoverPasswordForm } from "@/components/student/RecoverPasswordForm";
import { LOGIN_PATH, STUDENT_HOME } from "@/lib/auth-paths";
import { getStudentSession, isDemoMode } from "@/lib/content/student";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

const BACK_TO_LOGIN = <Link href={LOGIN_PATH}>Voltar para o login</Link>;

export default async function RecoverPasswordPage() {
  if (isDemoMode()) {
    return (
      <AuthCard
        title="Recuperar senha"
        lead="O login ainda não está ativo."
        note="A recuperação de senha será ativada junto com o login."
        footer={BACK_TO_LOGIN}
      />
    );
  }

  if (await getStudentSession()) redirect(STUDENT_HOME);

  return (
    <AuthCard
      title="Recuperar senha"
      lead="Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha."
      footer={BACK_TO_LOGIN}
    >
      <RecoverPasswordForm />
    </AuthCard>
  );
}
