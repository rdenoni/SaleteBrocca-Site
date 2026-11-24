import type { Metadata } from "next";
import { Receipt, UserRound } from "lucide-react";
import { SetPasswordForm } from "@/components/student/SetPasswordForm";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ACCOUNT_PATH } from "@/lib/auth-paths";
import { ENROLLMENT_STATUS_LABEL, getEnrollments, isDemoMode, requireStudentSession } from "@/lib/content/student";
import { MotionPace, STUDENT_PACE } from "@/motion/MotionPace";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { motionTokens } from "@/motion/tokens";
import styles from "./conta.module.css";

export const metadata: Metadata = {
  title: "Minha conta",
};

const TITLE = "Minha conta";
const { duration, stagger } = motionTokens;
const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" });
/* Itens da cascata do formulário de troca: senha atual, nova, repita, mostrar senhas e o botão. */
const FORM_ITEMS = 5;

/* Movimento (ordem de leitura, tudo ao montar): banner → barra de seções → os três blocos, da esquerda para a direita
   (cada um começa quando o anterior já está subindo). Dentro de cada bloco: título → conteúdo. */
const START = studentContentStart(TITLE);
const panelStart = (index: number) => START + index * duration.base;
const FORM_START = panelStart(1) + duration.quick + stagger.items;

export default async function AccountPage() {
  const session = await requireStudentSession(ACCOUNT_PATH);

  if (isDemoMode() || !session) {
    return (
      <MotionPace pace={STUDENT_PACE}>
        <StudentShell title={TITLE} active="conta">
          <Reveal trigger="mount" delay={START}>
            <EmptyState
              icon={<UserRound aria-hidden="true" />}
              title="Conta ainda não ativa"
              text="Seus dados, a troca de senha e as compras aparecerão aqui quando o login estiver ativo."
            />
          </Reveal>
        </StudentShell>
      </MotionPace>
    );
  }

  const enrollments = await getEnrollments();

  return (
    <MotionPace pace={STUDENT_PACE}>
      <StudentShell title={TITLE} subtitle="Seus dados de acesso, sua senha e suas compras." active="conta">
      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="conta-dados">
          <Stagger trigger="mount" delay={panelStart(0)} className={styles.stack}>
            <StaggerItem>
              <h2 id="conta-dados" className={styles.title}>
                Seus dados
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className={styles.label}>E-mail de acesso</p>
              <p className={styles.value}>{session.email ?? "—"}</p>
            </StaggerItem>
            <StaggerItem>
              <p className={styles.text}>É o e-mail usado na compra. Para trocá-lo, fale com a Salete pela página de contato.</p>
            </StaggerItem>
            <StaggerItem>
              <LinkArrow href="/contato#formulario">Ir para contato</LinkArrow>
            </StaggerItem>
          </Stagger>
        </section>

        <section className={styles.panel} aria-labelledby="conta-senha">
          <Stagger trigger="mount" delay={panelStart(1)} className={styles.stack}>
            <StaggerItem>
              <h2 id="conta-senha" className={styles.title}>
                Trocar senha
              </h2>
            </StaggerItem>
          </Stagger>
          <SetPasswordForm mode="change" delay={FORM_START} labelledBy="conta-senha" />
          <Reveal as="p" trigger="mount" delay={FORM_START + FORM_ITEMS * stagger.items} className={styles.note}>
            Esqueceu a senha atual? Saia e use “Esqueci minha senha” na tela de login.
          </Reveal>
        </section>

        <section className={styles.panel} aria-labelledby="conta-compras">
          <Stagger trigger="mount" delay={panelStart(2)} className={styles.stack}>
            <StaggerItem>
              <h2 id="conta-compras" className={styles.title}>
                Compras
              </h2>
            </StaggerItem>
            <StaggerItem className={styles.stretch}>
              {enrollments.length === 0 ? (
                <EmptyState
                  icon={<Receipt aria-hidden="true" />}
                  title="Nenhuma compra registrada"
                  text="As compras confirmadas aparecerão aqui. Se você acabou de comprar, aguarde alguns minutos."
                />
              ) : (
                <ul className={styles.list}>
                  {enrollments.map((enrollment) => (
                    <li key={`${enrollment.courseSlug}-${enrollment.createdAt}`} className={styles.item}>
                      <span className={styles.itemTitle}>{enrollment.courseTitle}</span>
                      <span className={styles.itemMeta}>
                        {DATE_FORMAT.format(new Date(enrollment.createdAt))} · {ENROLLMENT_STATUS_LABEL[enrollment.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StaggerItem>
            <StaggerItem>
              <LinkArrow href="/area-do-aluno/cursos">Ver meus cursos</LinkArrow>
            </StaggerItem>
          </Stagger>
        </section>
      </div>
      </StudentShell>
    </MotionPace>
  );
}
