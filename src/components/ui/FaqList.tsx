import { Plus } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { FaqItem } from "@/types/content";
import styles from "./FaqList.module.css";

interface FaqListProps {
  items: readonly FaqItem[];
  className?: string;
}

/* Acordeão nativo (<details>/<summary>), como a lista de módulos: teclado, leitor de tela e sem JavaScript.
   Várias respostas podem ficar abertas ao mesmo tempo (dá para comparar). A abertura anima só onde o
   navegador suporta ::details-content (ver o CSS); nos outros, abre na hora. Cada item tem âncora própria. */
export function FaqList({ items, className }: FaqListProps) {
  return (
    <ul className={[styles.list, className ?? ""].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item.id}>
          <details id={`duvida-${item.id}`} className={styles.item}>
            <summary className={styles.question}>
              <span className={styles.questionText}>{item.question}</span>
              <span className={styles.icon} aria-hidden="true">
                <Plus strokeWidth={2.5} />
              </span>
            </summary>
            <div className={styles.answer}>
              {item.answer.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              {item.list && item.list.length > 0 && (
                <ul className={styles.points}>
                  {item.list.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              {item.link && (
                <LinkArrow href={item.link.href} className={styles.link}>
                  {item.link.label}
                </LinkArrow>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
