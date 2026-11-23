# 03 - Design System

Traduz o [Manual da Marca TCC](02-BRAND-GUIDELINES.md) para a web e preserva a composição do site de referência: header branco arredondado, hero fotográfico azul, avaliação em duas colunas, depoimento navy, conteúdos em blocos de cor e footer navy. O site é **híbrido** (institucional, comercial e educacional) e nunca deve parecer template genérico de SaaS, blog ou página de vendas.

**Referência visual de componentes:** `components/bundle.css` do pacote do design system (classes `.sb-*`, ex.: `.sb-header`, `.sb-btn`, `.sb-hero`, `.sb-eval`, `.sb-testimonial`, `.sb-content-card`, `.sb-course-card`, `.sb-module`, `.sb-about`, `.sb-footer`). No código Next.js, cada componente vira um CSS Module com o mesmo resultado visual; o bundle é a referência de fidelidade, não é importado diretamente. Ver [06](06-TECHNICAL-ARCHITECTURE.md).

Regra geral: use tokens, nunca hex soltos.

## 1. Voz e conteúdo

- Simples, didática, otimista, acolhedora. O tema é técnico; a linguagem não.
- Primeira pessoa nas falas da Salete; "você" para o leitor. Sem emoji.
- Caixa alta só em `nav`, `button`, `eyebrow` e títulos curtos de seção que a referência já usa ("QUER MARCAR UMA AVALIAÇÃO?").
- Cards de conteúdo: palavra-chave em negrito seguida de dois-pontos.
- Nunca inventar depoimentos, números, preços, carga horária, certificados ou dados clínicos. Fato confirmado: curso com **6 módulos e 21 aulas**.

## 2. Cor

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `navy` | `#0f2438` | Tinta principal da marca: títulos e textos sobre `white`, `light-blue` e `light-gray`. Fundo do depoimento, do footer e da chamada final. Texto sobre `cyan` (8.2:1). |
| `blue` | `#337eb5` | Azul da marca (peça inferior do símbolo). Blocos de cor, tratamento azul das fotos, títulos de 24px+ sobre `white` (4.4:1: só texto grande). Nunca texto pequeno sobre `white` ou `light-blue`. |
| `blue-strong` | `#2a6a9a` | Derivado de `blue` para acessibilidade (não está no manual). Fundo do botão primário com texto `white` (5.8:1), links e anel de foco sobre fundos claros. |
| `cyan` | `#18cfd5` | Ciano da marca (peça superior do símbolo). Aba ativa do menu, fios sob títulos, ícones sociais, o grande "?" da avaliação, texto sobre `navy` (8.2:1). Texto sobre `cyan` sempre em `navy`; nunca `cyan` como texto sobre `white` (1.9:1). |
| `light-blue` | `#d9e1e2` | Fundo tingido das seções e dos cards de conteúdo. Texto sobre ele: `navy` ou `charcoal`. |
| `light-gray` | `#e8e7ea` | Campos de formulário, divisórias e superfícies neutras. Texto: `navy`, `charcoal` ou `text-muted`. |
| `charcoal` | `#24282b` | Texto corrido longo (Martel) sobre `white`, `light-blue` e `light-gray`. |
| `white` | `#ffffff` | Fundo da página, do header e dos cards; texto sobre `navy`, `blue-strong` e a foto tratada. |
| `text-muted` | `#5b6470` | Derivado. Texto secundário, placeholders e legendas sobre `white` (6.0:1), `light-gray` (4.9:1) e `light-blue` (4.5:1). |
| `on-navy-muted` | `#a9b8c6` | Derivado. Links e texto secundário do footer e do depoimento sobre `navy` (7.8:1). |
| `navy-raised` | `#18324c` | Derivado. Faixa inferior do footer e superfícies elevadas sobre `navy`. Texto: `white` ou `on-navy-muted`. |
| `photo-tint` | `rgba(51, 126, 181, 0.86)` | Véu azul sobre fotografias de banners internos e do card de curso. No hero, o tratamento azul é a foto em P&B com mix-blend soft-light sobre `blue-strong` (como no PSD), mais um véu navy à esquerda sob o texto. Texto `white` só em 24px+ ou negrito 19px+. |
| `error` | `#b42318` | Adição técnica: erros de formulário (texto e borda), sempre com ícone e mensagem em palavras. 6.5:1 sobre `white`. |
| `success` | `#1f6f4a` | Adição técnica: confirmações (envio de formulário, aula concluída), sempre com ícone e palavra. 6.3:1 sobre `white`. |

### Ritmo da página

Alterne fundos: `white` -> `blue` (hero) -> `white` | `navy` (avaliação + depoimento) -> `light-blue` | `blue` | `light-blue` (conteúdos) -> `white` -> `light-blue` (chamada final) -> `navy` (footer). **Nunca duas seções navy seguidas.** Por isso a chamada final é light-blue.

## 3. Tipografia

Famílias:

- `sans`: `"Noto Sans", system-ui, -apple-system, "Segoe UI", sans-serif`
- `serif`: `Martel, Georgia, "Times New Roman", serif`

| Estilo | Família | Tamanho / linha | Peso | Espaçamento | Uso |
|---|---|---|---|---|---|
| `display` | sans | 56 / 60 | 800 | -0.02em | Título do hero. Mobile 36/40. |
| `h1` | sans | 44 / 52 | 800 | -0.015em | Título de página interna. Mobile 32/38. |
| `h2` | sans | 34 / 42 | 800 | - | Título de seção. Mobile 26/32. |
| `h3` | sans | 26 / 34 | 700 | - | Título de card de conteúdo e de curso. Mobile 22/28. |
| `h4` | sans | 20 / 28 | 700 | - | Subtítulos, nomes de módulo, títulos de lista. |
| `nav` | sans | 14 / 20 | 700 | 0.06em | Itens do menu, caixa alta. |
| `button` | sans | 15 / 20 | 700 | 0.04em | Rótulo de botão, caixa alta. |
| `eyebrow` | sans | 13 / 16 | 700 | 0.1em | Rótulo acima de títulos, metadados, caixa alta. |
| `body` | sans | 17 / 28 | 400 | - | Texto de interface, resumos, chamadas curtas. |
| `small` | sans | 14 / 22 | 400 | - | Legendas, ajuda de campo, links do footer. |
| `reading` | serif | 18 / 32 | 400 | - | Artigos, biografia, descrição do curso. Linha de 60-72 caracteres. |
| `quote` | serif | 24 / 40 | 300 | - | Depoimentos e citações sobre `navy`. |

Martel não tem itálico: nunca simular itálico. Sob títulos de destaque, fio `cyan` de 120x6px (`.sb-rule`).

Fontes carregadas via `next/font/google`: Noto Sans (400-800, itálico 400) e Martel (300, 400, 700).

## 4. Espaçamento

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Ajustes finos: ícone e texto. |
| `space-2` | 8px | Entre rótulo e campo; entre metadados. |
| `space-3` | 12px | Entre campos de formulário; padding vertical de botão. |
| `space-4` | 16px | Margem lateral no mobile; gap de grid pequeno. |
| `space-6` | 24px | Padding de card; margem lateral no tablet; gap de grid. |
| `space-8` | 32px | Padding horizontal de botão largo; gap entre cards. |
| `space-12` | 48px | Margem lateral no desktop; padding interno de blocos de cor. |
| `space-16` | 64px | Padding vertical de seção no mobile. |
| `space-24` | 96px | Padding vertical de seção no desktop. |

Nada fora dessa escala.

## 5. Raios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 8px | Campos de formulário, chips, miniaturas. |
| `radius-md` | 24px | Header (o PSD usa 30px a 1920px), cards de curso e produto, painéis da Área do Aluno. |
| `radius-lg` | 32px | Fotografias dos cards de conteúdo e retratos: o canto generoso dos terminais do símbolo. |
| `radius-xl` | 48px | Base da aba ativa do menu (gota ciano) e grandes blocos de cor. |
| `radius-pill` | 999px | Botões, tags e avatares. |

## 6. Layout e breakpoints

| Token | Valor | Uso |
|---|---|---|
| `container` | 1200px | Largura máxima do conteúdo. |
| `header-height` | 128px | Altura do header no desktop (176px no PSD a 1920px; 72px no tablet/mobile). Fica a 48px do topo e das laterais, flutuando sobre o hero. |
| `bp-tablet` | 768px | A partir daqui, grids de 2 colunas. |
| `bp-desktop` | 1100px | Menu completo no header e grids de 3 colunas. |

Grid de 12 colunas, gap `space-8`. Margens laterais: `space-12` (desktop), `space-6` (tablet), `space-4` (mobile). Composição assimétrica: avaliação/depoimento 48/52; sobre 5/7; conteúdos em largura total, três blocos sem gap. Padding vertical de seção: `space-24` desktop, `space-16` mobile. Hero e blocos de cor vão de borda a borda.

## 7. Sombras

| Token | Valor | Uso |
|---|---|---|
| `shadow-header` | `0 12px 32px rgba(15, 36, 56, 0.14)` | Header flutuante sobre o hero. |
| `shadow-card` | `0 8px 24px rgba(15, 36, 56, 0.10)` | Cards de curso e produto em repouso. |
| `shadow-card-hover` | `0 18px 40px rgba(15, 36, 56, 0.18)` | Cards em hover (com elevação de 4px). |

Sombras só em elementos que flutuam. Blocos de cor não têm sombra nem borda.

## 8. Componentes

| Componente | Classe de referência | Descrição |
|---|---|---|
| Header | `.sb-header` | Caixa branca arredondada flutuando sobre o hero; logo lateral à esquerda; menu `Cursos · Avaliação · Conteúdo · Sobre · Contato` alinhado pelo topo; item ativo vira **gota ciano** (topo reto, base arredondada); à direita, **Área do Aluno** como pílula ciano com ícone de usuário, sempre visível em todas as larguras. |
| Botões | `.sb-btn` | `--primary` (ação principal em fundos claros), `--accent` (Área do Aluno e CTAs sobre navy), `--outline` (secundária, "Enviar"), `--ghost` (sobre foto ou navy, "Explorar cursos" no hero). Um único primário por seção. Rótulo em caixa alta, verbo no infinitivo. |
| Link "Acesse >" | `.sb-link-arrow` | Saída dos cards de conteúdo; 19px negrito. |
| Hero | `.sb-hero` | Foto grande P&B com soft-light sobre `blue-strong`, título `display` branco, fio ciano, apoio em `body`, CTA fantasma, indicadores do carrossel. |
| Avaliação | `.sb-eval` | "?" ciano gigante atrás do título em caixa alta; campos `light-gray` sem borda; envio `--outline` à direita. |
| Depoimento | `.sb-testimonial` | Fundo `navy`, citação Martel Light centralizada, aspas grandes em `blue`, autor com foto circular e anel `cyan`, nome em caixa alta, relação em `on-navy-muted`. |
| Card de conteúdo | `.sb-content-card` | Três blocos lado a lado `light-blue` / `blue` / `light-blue`; letra gigante translúcida ao fundo; foto vertical `radius-lg`; título em painel branco translúcido que avança sobre a foto; "Acesse >" no rodapé. Bloco inteiro clicável. |
| Card de curso | `.sb-course-card` | Foto em multiply sobre `blue`, selo ciano, título `h3`, público, metadados confirmados com ícones, "Ver curso". Sem preço até confirmação. |
| Módulos | `.sb-module` | Acordeão nativo `<details>` com número em quadrado `navy`/`cyan` e contagem de aulas. |
| Sobre | `.sb-about` | Retrato `radius-lg` com dois blocos deslocados (`cyan` embaixo à esquerda, `blue` em cima à direita) que repetem o encaixe das peças do símbolo. |
| Footer | `.sb-footer` | `navy`; três colunas de links (Atendimento, Cursos, Conteúdo; ver [04](04-SITEMAP.md) §5) mais a coluna da marca, com títulos `cyan` e links `on-navy-muted`; ícones sociais em círculos `cyan`; faixa `navy-raised` com copyright centralizado. |

## 9. Estados interativos

| Estado | Regra |
|---|---|
| Hover em links do menu | Fio `cyan` de 3px surge sob o rótulo. |
| Hover em botões | `--primary` e `--accent` escurecem para `navy`; `--outline` e `--ghost` se preenchem. |
| Hover em cards | Foto sobe 6px (conteúdo) ou card sobe 4px com `shadow-card-hover` (curso); título ganha sublinhado `cyan`. |
| Foco (teclado) | Anel sólido de 3px, `blue-strong` sobre fundos claros e `cyan` sobre `navy`/foto, afastado 3px. Nunca remover. |
| Campo em foco | Fundo `white`, borda `blue-strong`, halo `light-blue`. |
| Erro | Borda e mensagem `error` com ícone e texto ("Informe um telefone com DDD."). |
| Desabilitado | `light-gray` com texto `text-muted`, cursor bloqueado. |
| Atual | Item de menu com `aria-current="page"` vira a gota ciano. |

Transições de 180ms; com `prefers-reduced-motion`, nenhuma.

## 10. Responsividade

Recomponha em cada faixa; não reduza o desktop.

| Faixa | Comportamento |
|---|---|
| Desktop (>=1100) | Header completo; avaliação e depoimento lado a lado; três cards de conteúdo em linha; footer em quatro colunas (três de links + logo/sociais). |
| Tablet (768-1099) | Header compacto de 72px (logo, Área do Aluno, menu); avaliação e depoimento empilhados; cards de conteúdo em linha horizontal rolável ou 2+1; footer com a marca no topo e as três colunas de links lado a lado (duas colunas no mobile). |
| Mobile (<768) | Margens de 16px; hero `display` a 36/40 e altura mínima 560px; Área do Aluno vira botão-ícone circular (rótulo só para leitores de tela); cards de conteúdo empilhados; menu abre em painel de tela cheia `navy` com itens grandes `h3` e gota ciano no atual. |

Alvos de toque com no mínimo 48px.

## 11. Imagens

- Fotografia editorial e grande: crianças aprendendo, lendo, escrevendo; atendimento real. Luz natural, sem poses de banco de imagem.
- Tratamento azul no hero e banners: foto P&B fundida ao azul (soft-light sobre `blue-strong`, ou `photo-tint`).
- Cantos `radius-lg` em fotos de cards e retratos; cards de conteúdo verticais (3:5).
- Retratos da Salete com fundo natural; nunca recortes em fundo branco.
- Alt descreve a cena; fotos decorativas do hero levam `alt=""`.
- Fotos de terceiros só com licença confirmada.

## 12. Logotipo

- Header: `logo-lateral-cor.png`. Sobre `navy`: `logo-lateral-branco.png` ou `logo-empilhado-branco.png`. Favicon e app: `icone-app.png`.
- Mínimo 130px de largura para a assinatura completa; abaixo de 97px, só o símbolo.
- Proibições: ver [02](02-BRAND-GUIDELINES.md), seção 6.

## 13. Grafismos e padrão

Padrão (`padrao-modulo.png`) e peças (`grafismo-pecas.png`) como apoio em áreas vazias (chamada final, Área do Aluno), sempre em cores institucionais e com a marca presente. Letras gigantes translúcidas nos blocos de conteúdo.

## 14. Iconografia

- **Lucide** (traço 2px, cantos arredondados), herdando a cor do texto. 18px em botões e metadados; 26px nos sociais.
- Ícones não substituem palavras em ações principais, exceto Área do Aluno no mobile (com `aria-label`).
- Lucide não tem a marca do WhatsApp: usar `phone` ou `message-circle` no círculo ciano.

## 15. Acessibilidade

- Contraste mínimo 4.5:1 (texto) e 3:1 (texto grande, ícones, foco).
- Um `h1` por página; landmarks `header`, `nav`, `main`, `footer`; rótulos visíveis em todos os campos.
- Carrossel do hero com pausa e controles acessíveis; não troca sozinho com movimento reduzido.
- Formulários anunciam erros com `aria-invalid` e `aria-describedby`.

## 16. Movimento: ordem de entrada

Regra da cliente: as entradas seguem a hierarquia da informação. Partituras em `src/motion/timeline.ts`.

- **Cascata**: título (e o que pertence a ele) → subtítulo → texto → o resto (foto, índice, botões). Numa seção que entra ao chegar à tela, o conteúdo espera o título (`afterTitle`).
- **Página**: o banner/topo primeiro (`afterBanner`), depois as demais seções, na **ordem de leitura** (de cima para baixo, da esquerda para a direita). Uma seção que já aparece na tela ao abrir (tela alta) espera o topo terminar: as sequências do topo chamam `useHoldInView` e as entradas por viewport somam `inViewWait()` (`src/motion/pageSequence.ts`).
- Filetes e réguas ciano também entram (o traço, `DrawRule`), nunca ficam estáticos enquanto o resto anima.
- **Cabeçalho**: símbolo → logotipo → links → gota da página atual → botões (`headerTimeline`), começando logo que a pílula branca desce.
- **Nada da página começa antes de a entrada do cabeçalho estar 80% feita** (`useEntranceReady`; o cabeçalho usa `useCurtainReady`). Nas navegações seguintes o cabeçalho não entra de novo, então a página não espera.
- **Mensagens e frases de destaque** (ex.: "Toda criança, independente da dificuldade, tem a capacidade de ler e escrever."): leitura guiada (`GuidedReading`), ligada à rolagem.
- Cada passo começa por volta da metade do anterior: a ordem fica clara sem ninguém esperar a animação acabar.
- **Telas abertas muitas vezes seguidas** (a aula da Área do Aluno): mesma ordem, em ritmo curto. `<MotionPace pace={0.4}>` multiplica as entradas (durações, cadências, atrasos e a espera do topo) sem mexer em hover, toque e abas. Os atrasos continuam escritos em tempo normal.
