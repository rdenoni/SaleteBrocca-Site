import { Plus } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import type { FaqItem } from "@/types/content";
import styles from "./FaqList.module.css";

interface FaqListProps {
  items: readonly FaqItem[];
  className?: string;
}

/* Acordeão nativo (<details>/<summary>) com entrada em cascata (Stagger/StaggerItem): acessível por teclado,
   leitor de tela e sem JavaScript. Cada item tem âncora própria. */
export function FaqList({ items, className }: FaqListProps) {
  return (
    <Stagger as="ul" pace="items" className={[styles.list, className ?? ""].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <StaggerItem as="li" key={item.id}>
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
        </StaggerItem>
      ))}
    </Stagger>
  );
}
