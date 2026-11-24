/* Manual da Marca: interações. Valores lidos do PDF "TCC - Rafael Denoni_Manual da marca - SB" (2021). */
const LOGO = "/brand/logo/";
const FIG = "manual-da-marca/";
const TOAST_MS = 1600;
const DPI = 300;
const MIN_FULL = 130; // altura mínima com tag (manual, p. 21)
const MIN_NO_TAG = 97; // abaixo disso, só o símbolo

/* HEX é a referência (igual aos tokens do site). O manual imprime 3 RGB que não batem com o próprio HEX;
   aqui o RGB é sempre derivado do HEX para que os valores copiados não se contradigam. */
const PALETTE = {
  primary: [
    { name: "Azul", hex: "#337EB5", pantone: "2383 C", cmyk: "83 43 0 2", text: "#ffffff" },
    { name: "Ciano", hex: "#18CFD5", pantone: "319 C", cmyk: "60 0 16 0", text: "#0f2438" },
  ],
  support: [
    { name: "Navy", hex: "#0F2438", pantone: "289 C", cmyk: "100 66 0 76", text: "#ffffff" },
    { name: "Cinza claro", hex: "#E8E7EA", pantone: "663 XGC", cmyk: "2 5 0 0", text: "#0f2438" },
    { name: "Azul claro", hex: "#D9E1E2", pantone: "7541 C", cmyk: "10 3 0 0", text: "#0f2438" },
    { name: "Grafite", hex: "#24282B", pantone: "426 XGC", cmyk: "34 0 0 97", text: "#ffffff" },
  ],
};

const VERSIONS = [
  { src: LOGO + "logo-empilhado-cor.png", w: 500, h: 324, alt: "Versão vertical padrão", note: "Vertical padrão: a versão preferencial. Use sempre que houver espaço." },
  { src: LOGO + "logo-lateral-cor.png", w: 500, h: 155, alt: "Versão horizontal", note: "Horizontal: para espaços baixos e largos, como cabeçalhos e faixas." },
  { src: FIG + "versao-vertical-especial.webp", w: 301, h: 787, alt: "Versão vertical especial, com o nome girado", note: "Vertical especial: o nome gira 90° para espaços altos e estreitos, como lombadas e laterais." },
  { src: LOGO + "simbolo-cor.png", w: 501, h: 501, alt: "Versão responsiva, só o símbolo", note: "Responsiva: só o símbolo, para ícones de app, avatares e tamanhos abaixo de 97px." },
];

const BACKGROUNDS = [
  { id: "white", label: "Branco", hex: "#ffffff", logo: "cor" },
  { id: "light-gray", label: "Cinza claro", hex: "#E8E7EA", logo: "cor" },
  { id: "light-blue", label: "Azul claro", hex: "#D9E1E2", logo: "cor" },
  { id: "blue", label: "Azul", hex: "#337EB5", logo: "branco" },
  { id: "cyan", label: "Ciano", hex: "#18CFD5", logo: "branco", warn: "No ciano o branco perde contraste: use só em tamanhos grandes e quando não houver alternativa." },
  { id: "navy", label: "Navy", hex: "#0F2438", logo: "branco" },
  { id: "charcoal", label: "Grafite", hex: "#24282B", logo: "branco" },
];

const DONTS = [
  ["Não distorcer a marca", "Redimensione sempre na proporção original."],
  ["Não rotacionar ou inclinar a marca", "A marca fica sempre na horizontal."],
  ["Não rediagramar o logotipo", "Não troque espaçamentos nem a fonte do nome."],
  ["Não alterar as cores", "Só as versões da paleta oficial."],
  ["Não aplicar em fundo sem contraste", "Veja “Aplicação em fundos”."],
  ["Não aplicar outline na marca", "Nada de contornos ou versões vazadas."],
  ["Não aplicar qualquer tipo de efeito", "Sem sombras, brilhos, relevos ou degradês."],
  ["Não reposicionar os elementos", "Símbolo, nome e tag ficam onde estão."],
  ["Não cortar qualquer parte da marca", "Respeite a margem de segurança."],
];

const GALLERY = [
  "Cartão de visita", "Máscara", "Xícara", "Carimbo e papel timbrado", "Jogos didáticos",
  "Papelaria", "Caderno 2021", "Mídia social", "Website responsivo",
];

const PATTERN_LINES = [
  { id: "original", label: "Original (ciano e azul)", hex: null },
  { id: "cyan", label: "Ciano", hex: "#18CFD5" },
  { id: "blue", label: "Azul", hex: "#337EB5" },
  { id: "navy", label: "Navy", hex: "#0F2438" },
  { id: "white", label: "Branco", hex: "#ffffff" },
];
const PATTERN_BGS = BACKGROUNDS.filter((b) => b.id !== "charcoal");

const $ = (id) => document.getElementById(id);
function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "text") n.textContent = v;
    else if (k === "style") n.style.cssText = v;
    else n.setAttribute(k, v);
  }
  for (const kid of [].concat(kids || [])) n.append(kid);
  return n;
}
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
const cm = (px) => (px / DPI * 2.54).toFixed(2).replace(".", ",");

let toastTimer = 0;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.dataset.on = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.dataset.on = "0"; }, TOAST_MS);
}
async function copy(value, label) {
  try {
    await navigator.clipboard.writeText(value);
    toast(label + " copiado: " + value);
  } catch {
    toast("Não foi possível copiar. Valor: " + value);
  }
}

/* Grupo de botões com aria-pressed: chama onPick(botão) e marca o escolhido. */
function segmented(group, onPick) {
  group.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !group.contains(b)) return;
    for (const o of group.querySelectorAll("button")) o.setAttribute("aria-pressed", String(o === b));
    onPick(b);
  });
}
function swatchPicker(group, items, current, onPick) {
  for (const it of items) {
    const b = el("button", { type: "button", "aria-pressed": String(it.id === current), "aria-label": it.label, title: it.label, "data-id": it.id });
    if (it.hex) b.style.background = it.hex; else b.className = "mm-pick-original";
    group.append(b);
  }
  segmented(group, (b) => onPick(items.find((i) => i.id === b.dataset.id)));
}

/* Símbolo e logomarca: alternar entre arte e diagrama */
for (const viewer of document.querySelectorAll(".mm-viewer")) {
  segmented(viewer.querySelector(".seg"), (b) => {
    for (const img of viewer.querySelectorAll("[data-panel]")) img.hidden = img.dataset.panel !== b.dataset.view;
  });
}

/* Paleta */
function renderPalette(target, colors) {
  for (const c of colors) {
    const vals = [["HEX", c.hex], ["RGB", rgbOf(c.hex)], ["CMYK", c.cmyk], ["Pantone", c.pantone]];
    const list = el("div", { class: "mm-color-vals" }, vals.map(([k, v]) => {
      const b = el("button", { type: "button", "aria-label": "Copiar " + k + " de " + c.name + ": " + v }, [el("span", { text: k }), v]);
      b.addEventListener("click", () => copy(v, k + " " + c.name));
      return b;
    }));
    const chip = el("div", { class: "mm-color-chip", style: "background:" + c.hex + ";color:" + c.text + ";box-shadow:inset 0 -1px 0 rgba(15,36,56,.08)" }, c.name);
    target.append(el("article", { class: "mm-color" }, [chip, list]));
  }
}
renderPalette($("mm-pal-primary"), PALETTE.primary);
renderPalette($("mm-pal-support"), PALETTE.support);

/* Tipografia */
const typeState = { font: "sans" };
function renderType() {
  const area = $("mm-text");
  const size = $("mm-size").value;
  const wanted = Number($("mm-weight").value);
  const serif = typeState.font === "serif";
  area.style.fontFamily = serif ? "var(--font-serif)" : "var(--font-sans)";
  area.style.fontWeight = String(serif ? Math.min(wanted, 800) : wanted);
  area.style.fontSize = size + "px";
  $("mm-size-val").textContent = size;
  $("mm-type-note").textContent = serif && wanted > 800
    ? "A Martel vai até o peso 800; o Black 900 é só da Noto Sans (o nome do logotipo)."
    : (serif ? "Martel: textos de leitura extensa." : "Noto Sans: títulos e destaques.");
}
segmented(document.querySelector(".mm-tester .seg"), (b) => { typeState.font = b.dataset.font; renderType(); });
$("mm-weight").addEventListener("change", renderType);
$("mm-size").addEventListener("input", renderType);
renderType();

/* Versões */
function showVersion(i) {
  const v = VERSIONS[i];
  const img = $("mm-v-img");
  img.src = v.src; img.width = v.w; img.height = v.h; img.alt = v.alt;
  $("mm-v-note").textContent = v.note;
}
segmented($("mm-versions"), (b) => showVersion(Number(b.dataset.v)));
showVersion(0);

/* Redução */
const RED_STATES = {
  full: { ok: true, badge: "Com tag", src: LOGO + "logo-empilhado-cor.png", alt: "Logomarca completa com tag", msg: "130px (1,10cm) ou mais: logomarca completa com a tag." },
  noTag: { ok: true, badge: "Sem tag", src: FIG + "logo-sem-tag.png", alt: "Logomarca sem a tag fonoaudióloga", msg: "Entre 97px e 129px a tag fica ilegível: use a marca sem “fonoaudióloga”." },
  symbol: { ok: true, badge: "Só o símbolo", src: LOGO + "simbolo-cor.png", alt: "Símbolo Salete Brocca", msg: "Abaixo de 97px (0,82cm) o nome não se lê: use apenas o símbolo." },
};
function renderReduce() {
  const h = Number($("mm-red").value);
  const st = RED_STATES[h >= MIN_FULL ? "full" : h >= MIN_NO_TAG ? "noTag" : "symbol"];
  const img = $("mm-red-img");
  if (img.getAttribute("src") !== st.src) { img.src = st.src; img.alt = st.alt; }
  img.style.height = h + "px";
  img.style.width = "auto";
  $("mm-red-px").textContent = h;
  $("mm-red-cm").textContent = cm(h);
  const badge = $("mm-red-badge");
  badge.textContent = st.badge;
  badge.dataset.ok = String(st.ok);
  $("mm-red-msg").textContent = st.msg;
}
$("mm-red").addEventListener("input", renderReduce);
renderReduce();

/* Aplicação em fundos */
function renderBg(bg) {
  const stage = $("mm-bg-stage");
  stage.style.background = bg.hex;
  stage.style.boxShadow = bg.id === "white" ? "inset 0 0 0 1px var(--light-gray)" : "";
  const img = $("mm-bg-img");
  img.src = LOGO + "logo-empilhado-" + bg.logo + ".png";
  img.alt = "Logomarca " + (bg.logo === "cor" ? "colorida" : "branca") + " sobre " + bg.label.toLowerCase();
  $("mm-bg-note").textContent = (bg.logo === "cor" ? "Fundo claro: versão colorida (preferencial)." : "Fundo escuro ou saturado: versão branca (negativo).") + (bg.warn ? " " + bg.warn : "");
}
swatchPicker($("mm-bg-pick"), BACKGROUNDS, "white", renderBg);
renderBg(BACKGROUNDS[0]);

/* Proibições: cada card alterna entre o erro e o uso correto */
DONTS.forEach(([rule, fix], i) => {
  const n = String(i + 1).padStart(2, "0");
  const wrong = FIG + "proibicao-" + n + ".webp";
  const img = el("img", { src: wrong, alt: "Exemplo errado: " + rule, width: "501", height: "367", loading: "lazy" });
  const flag = el("span", { class: "mm-dont-flag", text: "Errado" });
  const b = el("button", { type: "button", class: "mm-dont", "aria-pressed": "false" }, [
    el("span", { class: "mm-dont-img" }, [img, flag]),
    el("span", { class: "mm-dont-text" }, [n + ". " + rule, el("small", { text: fix })]),
  ]);
  b.addEventListener("click", () => {
    const ok = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(ok));
    img.src = ok ? LOGO + "logo-empilhado-cor.png" : wrong;
    img.alt = ok ? "Uso correto: logomarca original" : "Exemplo errado: " + rule;
    img.classList.toggle("mm-ok", ok);
    flag.textContent = ok ? "Correto" : "Errado";
  });
  $("mm-donts").append(el("li", {}, b));
});

/* Pattern */
const pt = { line: PATTERN_LINES[0], bg: PATTERN_BGS[0] };
function renderPattern() {
  const box = $("mm-pattern");
  box.style.background = pt.bg.hex;
  box.classList.toggle("is-original", !pt.line.hex);
  box.querySelector("span").style.background = pt.line.hex || "";
  const same = pt.line.hex && pt.line.hex.toLowerCase() === pt.bg.hex.toLowerCase();
  $("mm-pt-note").textContent = same ? "Linhas e fundo na mesma cor: o pattern desaparece. Escolha cores diferentes." : "Linhas " + pt.line.label.toLowerCase() + " sobre " + pt.bg.label.toLowerCase() + ".";
}
swatchPicker($("mm-pt-line"), PATTERN_LINES, "original", (l) => { pt.line = l; renderPattern(); });
swatchPicker($("mm-pt-bg"), PATTERN_BGS, "white", (b) => { pt.bg = b; renderPattern(); });
$("mm-pt-size").addEventListener("input", (e) => {
  $("mm-pattern").style.setProperty("--pt", e.target.value + "px");
  $("mm-pt-size-val").textContent = e.target.value;
});
renderPattern();

/* Aplicações: galeria + lightbox (setas, Esc, clique fora) */
const lb = $("mm-lightbox");
let lbIndex = 0;
const galleryButtons = [];
function showLb(i) {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  const img = $("mm-lb-img");
  img.src = FIG + "aplicacao-" + String(lbIndex + 1).padStart(2, "0") + ".webp";
  img.alt = "Aplicação da marca: " + GALLERY[lbIndex];
  $("mm-lb-cap").textContent = (lbIndex + 1) + "/" + GALLERY.length + " · " + GALLERY[lbIndex];
}
GALLERY.forEach((label, i) => {
  const n = String(i + 1).padStart(2, "0");
  const b = el("button", { type: "button", "aria-label": "Ampliar: " + label }, [
    el("img", { src: FIG + "aplicacao-" + n + ".webp", alt: "", width: "1600", height: "1132", loading: "lazy" }),
    el("span", { text: label }),
  ]);
  b.addEventListener("click", () => { showLb(i); lb.showModal(); });
  galleryButtons.push(b);
  $("mm-gallery").append(el("li", {}, b));
});
$("mm-lb-prev").addEventListener("click", () => showLb(lbIndex - 1));
$("mm-lb-next").addEventListener("click", () => showLb(lbIndex + 1));
$("mm-lb-close").addEventListener("click", () => lb.close());
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  else if (e.key === "ArrowRight") showLb(lbIndex + 1);
});
lb.addEventListener("close", () => galleryButtons[lbIndex].focus());

/* Índice: destaca a seção visível */
const links = new Map([...document.querySelectorAll("#mm-toc a")].map((a) => [a.hash.slice(1), a]));
const tocList = $("mm-toc");
const spy = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    const a = links.get(en.target.id);
    if (!a) continue;
    for (const l of links.values()) l.removeAttribute("aria-current");
    a.setAttribute("aria-current", "true");
    if (tocList.scrollWidth > tocList.clientWidth) tocList.scrollTo({ left: a.getBoundingClientRect().left - tocList.getBoundingClientRect().left + tocList.scrollLeft - 16, behavior: "smooth" });
  }
}, { rootMargin: "-30% 0px -60% 0px" });
for (const id of links.keys()) { const s = $(id); if (s) spy.observe(s); }
