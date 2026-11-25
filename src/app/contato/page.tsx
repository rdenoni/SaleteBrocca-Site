import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { getAdminSiteLinks, getPublicSocialLinks } from "@/lib/admin/cms";
import { EMAIL, WHATSAPP } from "@/lib/content/contact";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { afterBanner } from "@/motion/timeline";
import { duration, motionTokens, stagger } from "@/motion/tokens";
import styles from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale pelo WhatsApp ou envie uma mensagem para Maria Salete Brocca Denoni.",
};

const BANNER_TITLE = "Contato";
/* Entrada por hierarquia, ao montar e esperando a cortina de transição: banner (título → subtítulo) e, com ele já
   subindo, WhatsApp → avaliação → formulário (que faz a própria cascata, campo a campo) → outros canais.
   Página calma: sem ousadia além disso. */
const PANELS_START = afterBanner(motionTokens, BANNER_TITLE);
const panelDelay = (index: number): number => PANELS_START + index * stagger.cards;
/* Os campos do formulário começam logo depois do painel dele; os outros canais, quando o último campo (enviar) sai.
   FORM_STEPS = filhos da cascata em ContactForm: título, nome/telefone, e-mail, assunto, mensagem, consentimento, enviar. */
const FORM_STEPS = 7;
const FORM_FIELDS_DELAY = panelDelay(2) + duration.quick;
const CHANNELS_DELAY = FORM_FIELDS_DELAY + FORM_STEPS * stagger.items;

/* Dados ausentes (null) ficam ocultos; dados existentes mas não confirmados ganham uma nota discreta. */
export default async function ContactPage() {
  const [siteLinks, socialLinks] = await Promise.all([getAdminSiteLinks(), getPublicSocialLinks()]);
  const profiles = socialLinks.filter((link) => link.network !== "whatsapp" && link.href);
  const whatsappDisplay = siteLinks.whatsappDisplay.trim() || WHATSAPP.display;
  const whatsappHref =
    siteLinks.whatsappHref.trim() || siteLinks.social.whatsapp.trim() || WHATSAPP.href || null;
  const emailDisplay = siteLinks.emailDisplay.trim() || EMAIL.display;
  const emailHref = siteLinks.emailHref.trim() || EMAIL.href || null;
  const hasEmail = Boolean(emailDisplay);
  const hasChannels = hasEmail || profiles.length > 0;

  return (
    <>
      <PageBanner
        title={BANNER_TITLE}
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
          {whatsappHref ? (
            <WhatsAppLink
              href={whatsappHref}
              className={styles.icon}
              aria-label="Abrir conversa no WhatsApp (aplicativo ou WhatsApp Web)"
            >
              <SocialIcon network="whatsapp" />
            </WhatsAppLink>
          ) : (
            <span className={styles.icon}>
              <SocialIcon network="whatsapp" />
            </span>
          )}
          <h2 id="whatsapp-titulo" className={styles.sectionTitle}>
            WhatsApp
          </h2>
          <p className={styles.phone}>{whatsappDisplay}</p>
          {whatsappHref ? (
            <WhatsAppLink href={whatsappHref} className={styles.whatsappCta}>
              Chamar no WhatsApp
            </WhatsAppLink>
          ) : (
            <p className={styles.note}>Número em confirmação</p>
          )}
        </Reveal>

        <Reveal
          as="section"
          trigger="mount"
          delay={panelDelay(1)}
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
          delay={panelDelay(2)}
          id="formulario"
          className={`${styles.panel} ${styles.formCard}`}
          aria-labelledby="formulario-titulo"
        >
          <ContactForm entranceDelay={FORM_FIELDS_DELAY} />
        </Reveal>

        {hasChannels && (
          <Reveal
            as="section"
            trigger="mount"
            delay={CHANNELS_DELAY}
            className={`${styles.block} ${styles.channels}`}
            aria-labelledby="canais-titulo"
          >
            <h2 id="canais-titulo" className={styles.channelsTitle}>
              Outros canais
            </h2>
            <ul className={styles.channelList}>
              {hasEmail && (
                <li>
                  <Mail aria-hidden="true" />
                  {emailHref ? (
                    <a href={emailHref} className={styles.channelValue}>
                      {emailDisplay}
                    </a>
                  ) : (
                    <>
                      <span className={styles.channelValue}>{emailDisplay}</span>
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
