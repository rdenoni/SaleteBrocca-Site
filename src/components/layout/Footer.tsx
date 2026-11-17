"use client";

import Image from "next/image";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { copyrightLine, FOOTER_COLUMNS, PRIVACY_LINK } from "@/lib/content/site";
import { BackToTop } from "./BackToTop";
import { SocialProfiles } from "./SocialProfiles";
import styles from "./Footer.module.css";

interface FooterProps {
  /** Ano do copyright, calculado no servidor (layout raiz): evita divergência na hidratação. */
  year: number;
}

/* Rodapé navy. Entrada ao aparecer: as colunas sobem em sequência e o logo surge por último (sem régua ciano
   acima da marca e sem a linha de atuação). Links: o texto clareia e recua 3px no hover e no foco, sem sublinhado.
   Os perfis sociais sempre aparecem; os sem endereço confirmado são botões com aviso (ver SocialProfiles). */
export function Footer({ year }: FooterProps) {
  const t = useMotionTokens();

  return (
    <footer className={styles.footer} data-surface="dark">
      <Stagger className={styles.main}>
        {FOOTER_COLUMNS.map((column) => (
          <StaggerItem key={column.title}>
            <nav className={styles.column} aria-label={column.title}>
              <h2 className={styles.title}>{column.title}</h2>
              <ul className={styles.links}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <TransitionLink href={link.href}>
                      <span className={styles.linkLabel}>{link.label}</span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
          </StaggerItem>
        ))}

        <StaggerItem className={styles.brand}>
          <Reveal variant="fade" delay={t.duration.gentle}>
            <Image
              src="/brand/logo/logo-empilhado-branco.png"
              alt="Salete Brocca"
              width={500}
              height={324}
              sizes="128px"
              className={styles.logo}
            />
          </Reveal>
          <SocialProfiles />
        </StaggerItem>
      </Stagger>

      <div className={styles.bar}>
        <div className={styles.barInner}>
          <p>{copyrightLine(year)}</p>
          <TransitionLink href={PRIVACY_LINK.href} className={styles.legal}>
            {PRIVACY_LINK.label}
          </TransitionLink>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
