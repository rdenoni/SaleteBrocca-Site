import Link from "next/link";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import styles from "./FilterNav.module.css";

export interface FilterItem {
  label: string;
  href: string;
  current: boolean;
  /** Contador visível ao lado do rótulo (ex.: 3 ou "em breve"). */
  count?: number | string;
  /** Versão por extenso do contador para leitores de tela (ex.: "3 artigos"). */
  countLabel?: string;
}

interface FilterNavProps {
  /** Nome acessível da navegação (ex.: "Categorias da loja"). */
  label: string;
  items: readonly FilterItem[];
  /** Âncora usada por links externos (ex.: "categorias" no rodapé). */
  id?: string;
  /** Mantém a rolagem ao trocar de filtro (útil quando só muda a query da mesma página). */
  keepScroll?: boolean;
  /** Com valor (s), as pílulas entram em cascata ao montar, a partir desse atraso. Sem valor, ficam estáticas. */
  entranceDelay?: number;
  /** false: a cascata das pílulas não segura as entradas por viewport (ex.: lateral da Loja, ao lado do conteúdo). */
  entranceHolds?: boolean;
  /** "vertical": coluna de pílulas a partir de 1100px (barra lateral); abaixo disso, igual ao padrão. */
  orientation?: "horizontal" | "vertical";
}

/* Filtros em pílula; o atual vira ciano (texto navy) e recebe aria-current. */
export function FilterNav({
  label,
  items,
  id,
  keepScroll = false,
  entranceDelay,
  entranceHolds = true,
  orientation = "horizontal",
}: FilterNavProps) {
  const animated = entranceDelay !== undefined;
  const List = animated ? Stagger : "ul";
  const Item = animated ? StaggerItem : "li";
  const listProps = animated ? { as: "ul" as const, trigger: "mount" as const, delay: entranceDelay, holdsInView: entranceHolds } : {};
  const itemProps = animated ? { as: "li" as const } : {};

  return (
    <nav id={id} aria-label={label} className={orientation === "vertical" ? `${styles.nav} ${styles.vertical}` : styles.nav}>
      <List className={styles.list} {...listProps}>
        {items.map((item) => (
          <Item key={item.href} {...itemProps}>
            <Link
              href={item.href}
              className={styles.filter}
              aria-current={item.current ? "page" : undefined}
              scroll={keepScroll ? false : undefined}
            >
              {item.label}
              {item.count !== undefined && (
                <span className={styles.count} aria-hidden={item.countLabel ? true : undefined}>
                  {item.count}
                </span>
              )}
              {item.countLabel && <span className="visually-hidden">, {item.countLabel}</span>}
            </Link>
          </Item>
        ))}
      </List>
    </nav>
  );
}
