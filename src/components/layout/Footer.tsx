"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { useMotionTokens } from "@/motion/useMotionTokens";
import type { FooterColumn } from "@/types/content";
import { CookiePreferencesButton } from "@/components/privacy/CookiePreferencesButton";
import { copyrightLine, LEGAL_LINKS } from "@/lib/content/site";
import { BackToTop } from "./BackToTop";
import { SocialProfiles } from "./SocialProfiles";
import styles from "./Footer.module.css";

interface FooterProps {
  /** Colunas de links, montadas no servidor (layout raiz) a partir dos dados do site. */
  columns: FooterColumn[];
  /** Ano do copyright, calculado no servidor (layout raiz): evita divergência na hidratação. */
  year: number;
}

/* Rodapé navy. Entrada ao aparecer: as colunas sobem em sequência e o logo surge por último (sem régua ciano
   acima da marca e sem a linha de atuação). Links: o texto clareia e recua 3px no hover e no foco, sem sublinhado.
   Os perfis sociais sempre aparecem; os sem endereço confirmado são botões com aviso (ver SocialProfiles). */
export function Footer({ columns, year }: FooterProps) {
  const t = useMotionTokens();
  /* Número de colunas de links vira variável CSS: a grade reserva uma faixa por coluna mais a da marca. */
  const footerStyle = { "--footer-columns": columns.length } as CSSProperties;

  return (
    <footer className={styles.footer} data-surface="dark" style={footerStyle}>
      <Stagger className={styles.main}>
        {columns.map((column) => (
          <StaggerItem key={column.title} className={styles.columnWrap}>
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
          <Reveal variant="fade" delay={t.duration.gentle} className={styles.logoWrap}>
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
          {LEGAL_LINKS.map((link) => (
            <TransitionLink key={link.href} href={link.href} className={styles.legal}>
              {link.label}
            </TransitionLink>
          ))}
          <CookiePreferencesButton className={styles.legalButton} />
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
