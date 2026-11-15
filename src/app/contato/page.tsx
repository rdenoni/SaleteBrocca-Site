import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CLINIC_CITY, CLINIC_HOURS, EMAIL, WHATSAPP } from "@/lib/content/contact";
import { SOCIAL_LINKS } from "@/lib/content/site";
import styles from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: "Agende uma avaliação, fale pelo WhatsApp ou envie uma mensagem para Maria Salete Brocca Denoni.",
};

function Pending({ children }: { children: string }) {
  return <span className="pending">{children}</span>;
}

export default function ContactPage() {
  const profiles = SOCIAL_LINKS.filter((link) => link.network !== "whatsapp");

  return (
    <>
      <PageBanner
        eyebrow="Fale com a Salete"
        title="Contato"
        subtitle="Agende uma avaliação, tire dúvidas sobre os cursos ou envie uma mensagem."
        size="compact"
      />

      <div className={`container ${styles.layout}`}>
        <section id="whatsapp" className={`${styles.card} ${styles.whatsapp}`} data-surface="dark" aria-labelledby="whatsapp-titulo">
          <span className={styles.icon}>
            <SocialIcon network="whatsapp" />
          </span>
          <h2 id="whatsapp-titulo" className={styles.cardTitle}>
            WhatsApp
          </h2>
          <p className={styles.phone}>{WHATSAPP.display}</p>
          {WHATSAPP.href ? (
            <Button href={WHATSAPP.href} variant="accent">
              Chamar no WhatsApp
            </Button>
          ) : (
            <>
              <Pending>Número a confirmar</Pending>
              <p className={styles.note}>O botão de conversa será ativado após a confirmação do número.</p>
            </>
          )}
        </section>

        <section id="agendamento" className={`${styles.card} ${styles.schedule}`} aria-labelledby="agendamento-titulo">
          <span className={styles.icon}>
            <CalendarCheck aria-hidden="true" />
          </span>
          <h2 id="agendamento-titulo" className={styles.cardTitle}>
            Marcar avaliação
          </h2>
          <p className={styles.text}>Atendimento em consultório particular a crianças com dificuldade na aprendizagem.</p>
          <dl className={styles.details}>
            <div>
              <dt>
                <MapPin aria-hidden="true" />
                Local
              </dt>
              <dd>{CLINIC_CITY ?? <Pending>A confirmar</Pending>}</dd>
            </div>
            <div>
              <dt>
                <Clock aria-hidden="true" />
                Horários
              </dt>
              <dd>{CLINIC_HOURS ?? <Pending>A confirmar</Pending>}</dd>
            </div>
          </dl>
          <Button href="#formulario" variant="primary">
            Agendar pelo formulário
          </Button>
        </section>

        <section id="formulario" className={`${styles.card} ${styles.formCard}`} aria-label="Formulário de contato">
          <ContactForm />
        </section>

        <section className={`${styles.card} ${styles.channels}`} aria-labelledby="canais-titulo">
          <h2 id="canais-titulo" className={styles.channelsTitle}>
            Outros canais
          </h2>
          <ul className={styles.channelList}>
            <li>
              <Mail aria-hidden="true" />
              {EMAIL.href ? (
                <a href={EMAIL.href} className={styles.channelValue}>
                  {EMAIL.display}
                </a>
              ) : (
                <>
                  <span className={styles.channelValue}>{EMAIL.display}</span>
                  <Pending>A confirmar</Pending>
                </>
              )}
            </li>
            {profiles.map((profile) => (
              <li key={profile.network}>
                <SocialIcon network={profile.network} />
                <span className={styles.channelValue}>{profile.label}</span>
                {profile.href ? (
                  <a
                    href={profile.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Abrir perfil no ${profile.label} (abre em nova aba)`}
                  >
                    Abrir perfil
                  </a>
                ) : (
                  <Pending>Perfil a confirmar</Pending>
                )}
              </li>
            ))}
          </ul>
          <p className={styles.privacy}>
            Saiba como tratamos seus dados na <Link href="/privacidade">política de privacidade</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
