"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/* Registro único dos plugins. Só roda no navegador (no servidor não há DOM para os plugins).
   Idempotente: cada componente GSAP chama no topo do módulo e, por garantia, dentro do hook. */
export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
    registered = true;
  }
  return gsap;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText, useGSAP };
