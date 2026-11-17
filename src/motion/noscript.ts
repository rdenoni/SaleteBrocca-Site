/* CSS do <noscript> do layout raiz: sem JavaScript, nada fica preso no estado inicial das animações.
   - [data-reveal]: blocos e palavras que entram (opacidade, deslocamento, recorte, traço do símbolo).
   - [data-reveal-transform]: camadas que só precisam perder o transform inicial (ex.: a foto do Hero,
     que tem opacidade própria de 0,8 e por isso não pode receber opacity: 1). */
export const NOSCRIPT_REVEAL_CSS =
  "[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}" +
  "[data-reveal-transform]{transform:none!important}";
