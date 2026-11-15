# 07 - Plano de Implementação

Regra: não avançar de fase sem cumprir os critérios de conclusão e sem validação visual. Arquitetura em [06](06-TECHNICAL-ARCHITECTURE.md); páginas em [04](04-SITEMAP.md) e [05](05-WIREFRAMES.md).

## Fases

| Fase | Nome | Entregas | Critérios de conclusão |
|---|---|---|---|
| 0 | Fundação | Projeto Next.js, tokens, fontes, layout (Header, Footer, Container, Button), documentação | `build` e `lint` sem erro; tokens idênticos ao design system; fontes Noto Sans e Martel carregando; Header e Footer renderizam em 1440, 768 e 390; docs 01-07 revisados |
| 1 | Home | As 10 seções, fiel ao PSD; formulário de avaliação | Comparação visual com a referência aprovada em desktop, tablet e mobile; sem rolagem horizontal em 390; testes Playwright da Home passando; acessibilidade manual ok; nenhum conteúdo inventado |
| 2 | Cursos + Compra (visual) | `/cursos`, `/cursos/[slug]`, `/cursos/[slug]/compra` | Módulos e 21 aulas reais exibidos; bloco comercial com `[A CONFIRMAR]`; navegação Home -> compra funcionando |
| 3 | Sobre + Contato | `/sobre`, `/contato`, `/privacidade`, 404 | Âncoras funcionam; formulário valida; textos institucionais apenas confirmados pela cliente |
| 4 | Conteúdo | `/conteudo`, categorias, artigo | ContentCard reutilizado; leitura em Martel com no máx. 72 caracteres por linha; só artigos reais |
| 5 | Loja + Checkout (visual) | `/loja`, `/loja/[slug]`, `/loja/checkout` | Sem pagamento real; produtos reais ou estado vazio; fluxo visual completo |
| 6 | Área do Aluno (visual) | Login, dashboard, cursos, curso, player, materiais | Todas as telas navegáveis com dados de exemplo claramente marcados; player com placeholder |
| 7 | Integrações | Supabase (auth/BD), vídeo, pagamento, CMS | Cada integração só começa com aprovação (custo e fornecedor); funções do repositório trocadas sem alterar componentes; matrícula via webhook testada |
| 8 | Lançamento | Domínio, Cloudflare, SEO, analytics, LGPD | `sitemap.ts` e `robots.ts`; metadata e Open Graph por rota; política de privacidade e consentimento; Lighthouse revisado; domínio e DNS ativos |

## Validação por etapa

1. Rodar `build`, `lint` e verificação de tipos.
2. Rodar os testes Playwright (Edge).
3. Capturar telas em 1440, 768 e 390 e comparar com a referência e os wireframes.
4. Conferir lista manual de acessibilidade (títulos, labels, foco, contraste).
5. Registrar pendências de conteúdo; nunca preencher com texto inventado.

## Pendências de conteúdo da cliente

| # | Pendência | Onde afeta |
|---|---|---|
| 1 | Wordmark oficial (grotesca do site x Noto Sans do TCC) e logos em SVG | Header, footer, favicon |
| 2 | Número do CRFa e biografia (formação, atuação, cidade) | Sobre, Apresentação na Home |
| 3 | Autorização e texto final dos depoimentos (hoje só o da Daniele Schlichting Fusinato, "Mãe da paciente") | Depoimento, seção 8 |
| 4 | Preço, carga horária e certificado do curso | Detalhe do curso, compra, cards |
| 5 | Canais oficiais: WhatsApp, Instagram, LinkedIn. Os arquivos mencionam +55 (48) 9973-4469 e contato@saletebrocca.com: **a confirmar** | Contato, footer, CTAs |
| 6 | Retratos profissionais em alta resolução (os atuais têm 384px) | Sobre, Home, depoimentos |
| 7 | Licença das fotos de banco de imagem | Hero, cards, artigos |
| 8 | Pauta real dos conteúdos: títulos, textos completos, datas e categorias. Hoje os 3 títulos da referência são exemplos, as categorias (Audição, Deglutição, Comportamento infantil) são uma proposta e o site avisa "Conteúdo de exemplo" (`ARTICLES_ARE_EXAMPLES` em `src/lib/content/articles.ts`, com `noindex`) | Conteúdos em destaque (Home), Conteúdo |
| 9 | Produtos digitais reais da loja | Loja |
| 10 | Texto jurídico da política de privacidade e responsável pelos dados | Privacidade, LGPD |

## Riscos

| Risco | Mitigação |
|---|---|
| Conteúdo faltante bloqueia páginas | Marcar `[A CONFIRMAR]`; priorizar Home, Cursos, Sobre, Contato |
| Wordmark divergente | Usar os arquivos do site sem redesenhar; confirmar com o designer |
| Fotos com baixa resolução ou sem licença | Solicitar originais; usar apenas imagens licenciadas |
| Integrações com custo | Aprovação explícita antes da Fase 7 |
