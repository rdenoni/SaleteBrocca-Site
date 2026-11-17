"use client";

import { motion, type Variants } from "motion/react";
import { SOCIAL_LINKS } from "@/lib/content/site";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { SocialButton } from "./SocialButton";
import styles from "./Footer.module.css";

/* Só perfis com endereço confirmado (href não nulo). Sem nenhum, não renderiza nada: nem grupo, nem legenda. */
const CONFIRMED_PROFILES = SOCIAL_LINKS.flatMap((profile) =>
  profile.href ? [{ ...profile, href: profile.href }] : [],
);

/* Lista de perfis. Cada item entra em sequência herdando hidden/visible do Stagger do rodapé. */
export function SocialProfiles() {
  const t = useMotionTokens();
  if (CONFIRMED_PROFILES.length === 0) return null;

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
    <ul className={styles.social} aria-label="Redes sociais">
      {CONFIRMED_PROFILES.map((profile, index) => (
        <motion.li key={profile.network} data-reveal="" variants={entranceVariants(index)}>
          <SocialButton network={profile.network} label={profile.label} href={profile.href} />
        </motion.li>
      ))}
    </ul>
  );
}
