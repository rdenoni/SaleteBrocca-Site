import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/student/AuthCard";
import { LoginForm } from "@/components/student/LoginForm";
import { PasswordLoginForm } from "@/components/student/PasswordLoginForm";
import { safeNext } from "@/lib/auth-paths";
import { getStudentSession, isDemoMode } from "@/lib/content/student";

export const metadata: Metadata = {
  title: "Entrar na Área do Aluno",
};

type SearchParam = string | string[] | undefined;

interface LoginPageProps {
  searchParams: Promise<{ next?: SearchParam; aviso?: SearchParam }>;
}

const NOTICES: Readonly<Record<string, string>> = {
  "link-invalido": "Este link não é mais válido. Peça um novo em “Esqueci minha senha”.",
};

function first(value: SearchParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const NOT_A_STUDENT = (
  <>
    Ainda não é aluno? <Link href="/cursos">Conheça os cursos</Link>
  </>
);

/* Sem Supabase: demonstração (o formulário só explica que o login não está ativo; a página continua estática).
   Com Supabase: login real; quem já entrou vai direto para o destino.
   Entrada (AuthCard, ao montar): título → régua → texto → campos → botão → (aviso) → link "Esqueci minha senha" →
   nota → privacidade → "Conheça os cursos". Cada formulário informa a AuthCard quantos itens tem em `formItems`. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (isDemoMode()) {
    return (
      <AuthCard
        title="Área do Aluno"
        lead="Entre com o e-mail usado na inscrição."
        formItems={4}
        note="Recuperação de senha e criação de conta serão ativadas junto com o login."
        footer={NOT_A_STUDENT}
      >
        <LoginForm />
      </AuthCard>
    );
  }

  const params = await searchParams;
  const next = safeNext(first(params.next));
  if (await getStudentSession()) redirect(next);
  const aviso = first(params.aviso);

  return (
    <AuthCard
      title="Área do Aluno"
      lead="Entre com o e-mail usado na compra."
      formItems={6}
      note="A conta é criada automaticamente depois da compra. O e-mail de confirmação traz o link para você definir a sua senha."
      footer={NOT_A_STUDENT}
    >
      <PasswordLoginForm next={next} notice={aviso ? NOTICES[aviso] : undefined} />
    </AuthCard>
  );
}
