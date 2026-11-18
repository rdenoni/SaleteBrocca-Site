import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/student/AuthCard";
import { ConfirmLinkButton } from "@/components/student/ConfirmLinkButton";
import styles from "@/components/student/LoginForm.module.css";
import { LOGIN_PATH, defaultNextForType, loginPathWithNotice, parseConfirmType, safeNext } from "@/lib/auth-paths";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { confirmEmailLink } from "./actions";

/* A URL traz o token do e-mail: sem Referer para outros sites e fora dos buscadores. */
export const metadata: Metadata = {
  title: "Confirmar acesso",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type SearchParam = string | string[] | undefined;

interface ConfirmPageProps {
  searchParams: Promise<{ token_hash?: SearchParam; type?: SearchParam; code?: SearchParam; next?: SearchParam }>;
}

function first(value: SearchParam): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/* Destino dos links dos e-mails do Supabase. Abrir esta página (inclusive por antivírus ou prévia do e-mail) não gasta
   o token: ele só é trocado por uma sessão quando a pessoa clica em "Continuar" (confirmEmailLink). */
export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  if (!isSupabaseConfigured()) redirect(LOGIN_PATH);

  const params = await searchParams;
  const tokenHash = first(params.token_hash);
  const code = first(params.code);
  const type = parseConfirmType(first(params.type));
  if (!(tokenHash && type) && !code) redirect(loginPathWithNotice("link-invalido"));

  const next = safeNext(first(params.next), defaultNextForType(type));

  return (
    <AuthCard
      title="Confirmar acesso"
      lead="Para a sua segurança, confirme o acesso clicando no botão abaixo. Depois você segue para a Área do Aluno."
      footer={<Link href={LOGIN_PATH}>Voltar para o login</Link>}
    >
      <form className={styles.form} action={confirmEmailLink} aria-labelledby="page-title">
        {tokenHash && type ? (
          <>
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
          </>
        ) : (
          <input type="hidden" name="code" value={code} />
        )}
        <input type="hidden" name="next" value={next} />
        <ConfirmLinkButton />
      </form>
    </AuthCard>
  );
}
