import { ChevronDown } from "lucide-react";
import type { Module } from "@/types/content";
import styles from "./ModuleList.module.css";

interface ModuleListProps {
  modules: readonly Module[];
  /** Número do módulo que começa aberto. */
  openModule?: number;
}

function lessonLabel(count: number): string {
  return count === 1 ? "1 aula" : `${count} aulas`;
}

/* Acordeão nativo (<details>/<summary>): acessível por teclado e sem JavaScript. */
export function ModuleList({ modules, openModule }: ModuleListProps) {
  return (
    <ol className={styles.list}>
      {modules.map((module) => (
        <li key={module.number}>
          <details className={styles.module} open={module.number === openModule}>
            <summary className={styles.head}>
              <span className={styles.number} aria-hidden="true">
                {module.number}
              </span>
              <span className={styles.titleWrap}>
                <span className={styles.title}>
                  <span className="visually-hidden">Módulo {module.number}: </span>
                  {module.title}
                </span>
                <span className={styles.count}>{lessonLabel(module.lessons.length)}</span>
              </span>
              <ChevronDown className={styles.chevron} aria-hidden="true" />
            </summary>
            <div className={styles.body}>
              {module.summary && <p className={styles.summary}>{module.summary}</p>}
              <ol className={styles.lessons}>
                {module.lessons.map((lesson, index) => (
                  <li key={lesson.code}>
                    <span className={styles.lessonNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {lesson.title}
                  </li>
                ))}
              </ol>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
