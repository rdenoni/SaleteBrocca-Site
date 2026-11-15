import Link from "next/link";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { COPYRIGHT, FOOTER_COLUMNS, SOCIAL_LINKS } from "@/lib/content/site";
import styles from "./Footer.module.css";

/* Só renderiza ícones de perfis com endereço confirmado: nunca apontar rede social para outra página. */
const CONFIRMED_SOCIAL_LINKS = SOCIAL_LINKS.flatMap((social) =>
  social.href ? [{ ...social, href: social.href }] : [],
);

export function Footer() {
  return (
    <footer className={styles.footer} data-surface="dark">
      <div className={styles.main}>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} className={styles.column} aria-label={column.title}>
            <h2 className={styles.title}>{column.title}</h2>
            <ul className={styles.links}>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {CONFIRMED_SOCIAL_LINKS.length > 0 && (
          <ul className={styles.social} aria-label="Redes sociais">
            {CONFIRMED_SOCIAL_LINKS.map((social) => (
              <li key={social.network}>
                <Link href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                  <SocialIcon network={social.network} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <p>{COPYRIGHT}</p>
          <Link href="/privacidade" className={styles.legal}>
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
