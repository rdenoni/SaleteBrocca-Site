/* Configuração fixa do movimento em produção. No laboratório esses três valores eram controles (velocidade,
   movimento reduzido, modo de transição); no site não há controle nenhum:
   - velocidade sempre 1× (tempo real);
   - movimento reduzido vem só do sistema operacional (prefers-reduced-motion), lido por usePrefersReducedMotion;
   - a transição de página é sempre o "Traço". */

/** 1 = tempo real. Não muda em produção. */
export const MOTION_SPEED = 1;

/** Entregue ao MotionConfig do Motion: "user" segue o prefers-reduced-motion do sistema. */
export const MOTION_REDUCED_SETTING = "user" as const;

/** Transição de página do site. */
export type PageTransitionMode = "trace";
export const PAGE_TRANSITION_MODE: PageTransitionMode = "trace";
