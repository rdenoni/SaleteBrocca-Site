"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./LessonTabs.module.css";

export interface LessonTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface LessonTabsProps {
  tabs: readonly LessonTab[];
  /** Nome acessível da lista de abas. */
  label: string;
}

const TAB_PARAM = "aba";

const KEY_STEPS: Record<string, (index: number, total: number) => number> = {
  ArrowRight: (index, total) => (index + 1) % total,
  ArrowLeft: (index, total) => (index - 1 + total) % total,
  Home: () => 0,
  End: (_index, total) => total - 1,
};

/* Abas no padrão WAI-ARIA: setas, Home e End movem entre as abas; Tab entra no painel. */
export function LessonTabs({ tabs, label }: LessonTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  /* A rota é estática: lê ?aba= só depois de montar, sem useSearchParams. */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(TAB_PARAM);
    if (requested && tabs.some((tab) => tab.id === requested)) setActiveId(requested);
  }, [tabs]);

  function selectTab(id: string) {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set(TAB_PARAM, id);
    window.history.replaceState(window.history.state, "", url);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = KEY_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    const next = step(index, tabs.length);
    selectTab(tabs[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              id={`aba-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`painel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`painel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`aba-${tab.id}`}
          hidden={tab.id !== activeId}
          tabIndex={0}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
