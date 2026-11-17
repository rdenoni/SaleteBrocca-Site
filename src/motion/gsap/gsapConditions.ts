/* Condições de largura e de movimento para o GSAP. Arquivo sem importar o GSAP de propósito: o CourseTrail
   consulta estas larguras com window.matchMedia ANTES de carregar o GSAP (só o desktop com movimento completo o carrega). */
export const GSAP_CONDITIONS = {
  wide: "(min-width: 768px)",
  systemReduced: "(prefers-reduced-motion: reduce)",
} as const;
