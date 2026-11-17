import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { EMAIL, WHATSAPP } from "@/lib/content/contact";
import { SOCIAL_LINKS } from "@/lib/content/site";
import styles from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale pelo WhatsApp ou envie uma mensagem para Maria Salete Brocca Denoni.",
};

/* Dados ausentes (null) ficam ocultos; dados existentes mas não confirmados ganham uma nota discreta. */
export default function ContactPage() {
  const profiles = SOCIAL_LINKS.filter((link) => link.network !== "whatsapp" && link.href);
  const hasEmail = Boolean(EMAIL.display);
  const hasChannels = hasEmail || profiles.length > 0;

  return (
    <>
      <PageBanner
        title="Contato"
        subtitle="Tire dúvidas sobre os cursos ou envie uma mensagem."
        size="compact"
      />

      <div className={`container ${styles.layout}`}>
        <section id="whatsapp" className={`${styles.panel} ${styles.whatsapp}`} data-surface="dark" aria-labelledby="whatsapp-titulo">
          <span className={styles.icon}>
            <SocialIcon network="whatsapp" />
          </span>
          <h2 id="whatsapp-titulo" className={styles.sectionTitle}>
            WhatsApp
          </h2>
          <p className={styles.phone}>{WHATSAPP.display}</p>
          {WHATSAPP.href ? (
            <Button href={WHATSAPP.href} variant="accent">
              Chamar no WhatsApp
            </Button>
          ) : (
            <p className={styles.note}>Número em confirmação</p>
          )}
        </section>

        <section id="agendamento" className={`${styles.block} ${styles.schedule}`} aria-labelledby="agendamento-titulo">
          <h2 id="agendamento-titulo" className={styles.sectionTitle}>
            Avaliação
          </h2>
          <p className={styles.text}>O pedido de avaliação tem página própria, com o formulário.</p>
          <Button href="/avaliacao" variant="primary">
            Pedir avaliação
          </Button>
        </section>

        <section id="formulario" className={`${styles.panel} ${styles.formCard}`} aria-label="Formulário de contato">
          <ContactForm />
        </section>

        {hasChannels && (
          <section className={`${styles.block} ${styles.channels}`} aria-labelledby="canais-titulo">
            <h2 id="canais-titulo" className={styles.channelsTitle}>
              Outros canais
            </h2>
            <ul className={styles.channelList}>
              {hasEmail && (
                <li>
                  <Mail aria-hidden="true" />
                  {EMAIL.href ? (
                    <a href={EMAIL.href} className={styles.channelValue}>
                      {EMAIL.display}
                    </a>
                  ) : (
                    <>
                      <span className={styles.channelValue}>{EMAIL.display}</span>
                      <span className={styles.channelNote}>E-mail em confirmação</span>
                    </>
                  )}
                </li>
              )}
              {profiles.map((profile) => (
                <li key={profile.network}>
                  <SocialIcon network={profile.network} />
                  <span className={styles.channelValue}>{profile.label}</span>
                  <a
                    href={profile.href ?? undefined}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Abrir perfil no ${profile.label} (abre em nova aba)`}
                  >
                    Abrir perfil
                  </a>
                </li>
              ))}
            </ul>
            <p className={styles.privacy}>
              Saiba como tratamos seus dados na <Link href="/privacidade">política de privacidade</Link>.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
