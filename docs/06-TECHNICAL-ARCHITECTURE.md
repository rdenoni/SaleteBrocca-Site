# 06 - Arquitetura Técnica

Arquitetura decidida para a implementação. Plano de fases em [07](07-IMPLEMENTATION-PLAN.md).

## 1. Stack

| Item | Versão / detalhe |
|---|---|
| Next.js | 16.4.3 (App Router) |
| React | 19.3.1 |
| TypeScript | 5.9 |
| lucide-react | 1.66.0 |
| @playwright/test | 1.64.1 (executa no Microsoft Edge instalado via `channel: 'msedge'`; sem download de navegador) |
| Runtime | Node 24 |
| Controle de versão | Git |

Sem Tailwind. Nenhum serviço pago instalado nesta fase.

## 2. Estilização

| Arquivo | Função |
|---|---|
| `src/styles/tokens.css` | Custom properties geradas dos tokens do design system, com nomes idênticos: `--navy`, `--blue`, `--blue-strong`, `--cyan`, `--light-blue`, `--light-gray`, `--charcoal`, `--white`, `--text-muted`, `--on-navy-muted`, `--navy-raised`, `--photo-tint`, `--error`, `--success`, `--space-*`, `--radius-*`, `--container`, `--header-height`, `--shadow-*`. |
| `src/styles/globals.css` | Reset, tipografia base, foco, utilitários. |
| `Componente.module.css` | CSS Module por componente, ao lado do componente. |

Valores de cada token em [03](03-DESIGN-SYSTEM.md). A referência visual dos componentes é `bundle.css` (`.sb-*`).

### Fontes (`next/font/google`)

| Fonte | Pesos | Variável |
|---|---|---|
| `Noto_Sans` | 400-800, itálico 400 | `--font-sans` |
| `Martel` | 300, 400, 700 | `--font-serif` |

### Breakpoints e layout

- Tablet: 768px; desktop: 1100px.
- Container: 1200px.
- Header: 128px no desktop, 72px no tablet/mobile.

CSS custom properties não funcionam dentro de `@media`; os breakpoints são escritos como literais (`768px`, `1100px`) nos módulos CSS.

## 3. Estrutura de pastas

```
SALETE-BROCCA-WEBSITE/
├── CLAUDE.md
├── docs/
├── public/
│   ├── brand/
│   │   ├── logo/
│   │   └── patterns/
│   ├── images/
│   │   ├── hero/
│   │   ├── about/
│   │   ├── courses/
│   │   ├── testimonials/
│   │   └── articles/
│   └── icons/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── courses/
│   │   ├── content/
│   │   └── ui/
│   ├── styles/
│   ├── lib/
│   └── types/
├── tests/
├── package.json
└── README.md
```

## 4. Componentes

| Grupo | Componente | Notas |
|---|---|---|
| layout | `Header` | Inclui `MobileMenu` (client component). Área do Aluno sempre visível. |
| layout | `Footer` | Quatro colunas + sociais + faixa inferior. |
| ui | `Button` | Variantes `primary \| accent \| outline \| ghost`; tamanhos `md \| sm`; renderiza `<a>` via `next/link` ou `<button>`. |
| ui | `LinkArrow` | "Acesse >". |
| ui | `Container` | Largura máxima e margens laterais. |
| ui | `Field` | Label, input/textarea e erro. |
| ui | `SectionRule` | Fio ciano 120x6. |
| home | `Hero` | `priority` na imagem. |
| home | `EvaluationSection` | Contém `EvaluationForm` (client) e `Testimonial`. |
| home | `FeaturedContent` | Três blocos de cor. |
| home | `AboutPreview` | Retrato com blocos deslocados + texto. |
| home | `FeaturedCourses` | Usa `CourseCard`. |
| home | `FinalCta` | Light-blue com grafismo. |
| content | `ContentCard` | Card de conteúdo clicável. |
| courses | `CourseCard` | Sem preço até confirmação. |
| courses | `ModuleList` | Acordeão com `<details>`. |

Server Components por padrão; `"use client"` apenas em `MobileMenu` e `EvaluationForm`.

## 5. Dados e repositório

Conteúdo tipado em `src/lib/content/`:

| Arquivo | Conteúdo |
|---|---|
| `site.ts` | Navegação, footer, contatos. |
| `courses.ts` | Curso real com módulos e aulas (6 módulos, 21 aulas). |
| `articles.ts` | Artigos em destaque. |
| `testimonials.ts` | Depoimentos (apenas os autorizados). |

Tipos em `src/types/`: `Course`, `Module`, `Lesson`, `Article`, `Testimonial`, `NavItem`.

Padrão repositório: as páginas só chamam funções como `getCourses()`, `getCourse(slug)`, `getFeaturedArticles()`. Hoje elas leem os módulos locais; depois são trocadas por Supabase/CMS sem alterar os componentes.

## 6. Imagens

`next/image` com arquivos locais em `public/images/`. O hero usa `priority`. Fotos decorativas com `alt=""`; as demais descrevem a cena. Fotos de terceiros só com licença confirmada.

## 7. Acessibilidade

- Landmarks (`header`, `nav`, `main`, `footer`), um `h1` por página, skip link.
- Anéis de foco visíveis: `blue-strong` sobre fundo claro, `cyan` sobre escuro.
- `aria-current="page"` na navegação.
- Campos com label; `aria-invalid` e `aria-describedby` nos erros.
- `prefers-reduced-motion` respeitado.
- Alvos de toque de 48px.
- Contraste >= 4.5:1; texto navy sobre cyan, nunca branco.

## 8. SEO

Metadata API por rota, Open Graph, `lang="pt-BR"`, hierarquia de títulos semântica. `sitemap.ts` e `robots.ts` virão na fase de lançamento. Rotas da Área do Aluno com `noindex`.

## 9. Integrações futuras (nenhuma instalada agora)

| Necessidade | Opção | Papel |
|---|---|---|
| Autenticação, matrículas, progresso | Supabase | Auth, banco, RLS. |
| Vídeo | Mux ou Cloudflare Stream | Playback assinado, retomada da posição. |
| Pagamento | Stripe ou Mercado Pago | Checkout; webhooks criam a matrícula. |
| Artigos | CMS (a definir) | Conteúdo editável. |
| DNS | Cloudflare | Domínio. |

Cada integração exige aprovação prévia (custo e escolha de fornecedor).

## 10. Plano de testes

Playwright, executando no Edge (`channel: 'msedge'`).

| Teste | Tipo |
|---|---|
| Home renderiza as 10 seções na ordem | E2E |
| Links do header e Área do Aluno visíveis em 1440, 768 e 390 | E2E |
| Menu mobile abre/fecha por teclado e com Escape | E2E |
| Formulário de avaliação valida campos obrigatórios e telefone | E2E |
| Sem rolagem horizontal em 390 | E2E |
| Baselines de captura em 1440 e 390 | Visual |
| Checagem manual de títulos e rótulos (estilo axe) | Manual |

Lista manual: um `h1`, ordem de títulos sem saltos, todo campo com label, imagens com `alt` adequado, foco visível em todos os controles, contraste dos pares de cor.

## 11. Fora do escopo agora

Autenticação real, banco de dados, vídeo, pagamento, CMS, analytics.
