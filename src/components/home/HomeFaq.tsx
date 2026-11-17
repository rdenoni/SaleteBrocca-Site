import { FaqList } from "@/components/ui/FaqList";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { FAQ_SECTION_ID, FAQ_TITLE, getHomeFaq } from "@/lib/content/faq";
import { DrawRule } from "@/motion/DrawRule";
import { Reveal } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import type { Course } from "@/types/content";
import styles from "./HomeFaq.module.css";

const TITLE_ID = "duvidas-titulo";

interface HomeFaqProps {
  course: Course | undefined;
}

/* Dúvidas frequentes na Home, logo depois dos cursos: só as perguntas de quem está conhecendo o curso.
   A lista completa fica em /cursos (#duvidas). Layout assimétrico: título e atalho à esquerda, perguntas à direita. */
export function HomeFaq({ course }: HomeFaqProps) {
  if (!course) return null;
  const items = getHomeFaq(course);
  if (items.length === 0) return null;

  return (
    <section id={FAQ_SECTION_ID} className={styles.section} aria-labelledby={TITLE_ID}>
      <div className={`container ${styles.layout}`}>
        <header className={styles.head}>
          <TextReveal as="h2" id={TITLE_ID} className={styles.title} text={FAQ_TITLE} />
          <DrawRule className={styles.rule} />
          <Reveal variant="fade" delay={0.2}>
            <LinkArrow href={`/cursos#${FAQ_SECTION_ID}`}>Ver todas as dúvidas</LinkArrow>
          </Reveal>
        </header>
        <Reveal className={styles.list}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </section>
  );
}
