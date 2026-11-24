"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useCallback, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/content/site";
import { useMotionTokens } from "@/motion/useMotionTokens";
import type { SocialNetwork } from "@/types/content";
import { SocialButton } from "./SocialButton";
import styles from "./Footer.module.css";

const PENDING_NOTICE = "Endereço em confirmação";

/* Lista de perfis com UM só aviso, centralizado na própria lista: assim o balão nunca passa da tela
   (a lista é mais larga que ele, mesmo a 320px) e dois avisos nunca se sobrepõem. Perfis sem endereço confirmado
   (href null) são botões, não links; o aviso fica numa região viva educada (role="status"), então o leitor de tela
   o anuncia sem interromper. */
export function SocialProfiles() {
  const t = useMotionTokens();
  const [noticeFor, setNoticeFor] = useState<SocialNetwork | null>(null);

  /* O último botão a pedir o aviso vence; um botão só tira o aviso se ele ainda for o dono. */
  const handleNotice = useCallback((network: SocialNetwork, visible: boolean) => {
    setNoticeFor((current) => (visible ? network : current === network ? null : current));
  }, []);

  if (SOCIAL_LINKS.length === 0) return null;

  const entranceVariants = (index: number): Variants => {
    if (t.reduced) {
      return {
        hidden: { opacity: 0, transition: { duration: t.duration.quick } },
        visible: { opacity: 1, transition: { duration: t.duration.quick } },
      };
    }
    return {
      hidden: { opacity: 0, scale: 0.6, transition: { duration: t.duration.quick } },
      visible: { opacity: 1, scale: 1, transition: { ...t.spring.ui, delay: t.duration.base + index * t.stagger.items } },
    };
  };

  return (
    <div className={styles.socialGroup}>
      <div className={styles.socialAnchor}>
        <ul className={styles.social} aria-label="Redes sociais">
          {SOCIAL_LINKS.map((profile, index) => (
            /* Sem initial/animate próprios: herda hidden/visible do Stagger do rodapé e entra em sequência. */
            <motion.li key={profile.network} data-reveal="" variants={entranceVariants(index)}>
              <SocialButton
                network={profile.network}
                label={profile.label}
                href={profile.href}
                onNoticeChange={handleNotice}
              />
            </motion.li>
          ))}
        </ul>
        <span className={styles.socialNotice} role="status" aria-live="polite">
          <AnimatePresence>
            {noticeFor ? (
              <motion.span
                key="aviso"
                className={styles.socialBubble}
                initial={{ opacity: 0, y: t.reduced ? 0 : t.distance.small }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ duration: t.duration.quick, ease: t.ease.out }}
              >
                {PENDING_NOTICE}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}
