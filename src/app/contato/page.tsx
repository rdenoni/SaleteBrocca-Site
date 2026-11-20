import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { EMAIL, WHATSAPP } from "@/lib/content/contact";
import { SOCIAL_LINKS } from "@/lib/content/site";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { duration, stagger } from "@/motion/tokens";
import styles from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale pelo WhatsApp ou envie uma mensagem para Maria Salete Brocca Denoni.",
};

/* Entrada: depois do banner, os painéis sobem em cascata (WhatsApp → formulário → avaliação), ao montar e
   esperando a cortina de transição; "Outros canais" entra ao chegar à tela. Página calma: sem ousadia além disso. */
const PANELS_START = duration.slow;
const panelDelay = (index: number): number => PANELS_START + index * stagger.cards;

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
        <Reveal
          as="section"
          trigger="mount"
          delay={panelDelay(0)}
          id="whatsapp"
          className={`${styles.panel} ${styles.whatsapp}`}
          data-surface="dark"
          aria-labelledby="whatsapp-titulo"
        >
          <span className={styles.icon}>
            <SocialIcon network="whatsapp" />
          </span>
          <h2 id="whatsapp-titulo" className={styles.sectionTitle}>
            WhatsApp
          </h2>
          <p className={styles.phone}>{WHATSAPP.display}</p>
          {WHATSAPP.href ? (
            <MotionButton href={WHATSAPP.href} variant="accent" target="_blank" rel="noopener noreferrer">
              Chamar no WhatsApp
            </MotionButton>
          ) : (
            <p className={styles.note}>Número em confirmação</p>
          )}
        </Reveal>

        <Reveal
          as="section"
          trigger="mount"
          delay={panelDelay(2)}
          id="agendamento"
          className={`${styles.block} ${styles.schedule}`}
          aria-labelledby="agendamento-titulo"
        >
          <h2 id="agendamento-titulo" className={styles.sectionTitle}>
            Avaliação
          </h2>
          <p className={styles.text}>O pedido de avaliação tem página própria, com o formulário.</p>
          <MotionButton href="/avaliacao" variant="primary" withCurtain>
            Pedir avaliação
          </MotionButton>
        </Reveal>

        <Reveal
          as="section"
          trigger="mount"
          delay={panelDelay(1)}
          id="formulario"
          className={`${styles.panel} ${styles.formCard}`}
          aria-labelledby="formulario-titulo"
        >
          <ContactForm />
        </Reveal>

        {hasChannels && (
          <Reveal as="section" className={`${styles.block} ${styles.channels}`} aria-labelledby="canais-titulo">
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
          </Reveal>
        )}
      </div>
    </>
  );
}
