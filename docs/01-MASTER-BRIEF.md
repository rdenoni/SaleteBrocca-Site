# 01 - Master Brief

Novo site oficial de **Maria Salete Brocca**, professora e fonoaudióloga clínica.

Documentos do projeto: [02 Marca](02-BRAND-GUIDELINES.md) · [03 Design System](03-DESIGN-SYSTEM.md) · [04 Mapa do site](04-SITEMAP.md) · [05 Wireframes](05-WIREFRAMES.md) · [06 Arquitetura](06-TECHNICAL-ARCHITECTURE.md) · [07 Plano de implementação](07-IMPLEMENTATION-PLAN.md)

## 1. Projeto

O site tem três dimensões simultâneas:

| Dimensão | Objetivo |
|---|---|
| Institucional | Apresentação, trajetória e autoridade profissional. |
| Comercial | Venda de cursos e produtos digitais. |
| Educacional | Futura plataforma com Área do Aluno e aulas. |

### Posicionamento híbrido

O site não deve parecer apenas um consultório, um blog ou uma página de vendas. A marca é profissional, acessível, humana, didática e confiável.

## 2. Direção visual

A referência principal é o screenshot/PSD original (`SaleteBrocca website novo.psd`, prancheta de 1920x2855).

| Preservar | Aprimorar |
|---|---|
| Header branco arredondado | Hierarquia tipográfica |
| Hero fotográfico com tratamento azul | Espaçamento |
| Seção de avaliação em duas colunas | Legibilidade |
| Depoimento com fundo navy | Responsividade |
| Conteúdos em destaque com blocos de cores | Interações |
| Footer navy | Acabamento dos cards |
| Composição assimétrica | |
| Fotografias grandes | |
| Elementos cyan e blue | |

Não substituir a referência por um template genérico de SaaS ou de plataforma educacional.

## 3. Identidade

- Base: Manual da Marca TCC (2021).
- Paleta: Blue `#337EB5`, Cyan `#18CFD5`, Navy `#0F2438`, Light Blue `#D9E1E2`, Light Gray `#E8E7EA`, Charcoal `#24282B`.
- Tipografia: **Noto Sans** (títulos, navegação, destaques) e **Martel** (textos longos).
- Não misturar fontes de manuais históricos (Myriad Pro, Museo, Roboto).
- Não redesenhar a logomarca.

Detalhes em [02](02-BRAND-GUIDELINES.md) e [03](03-DESIGN-SYSTEM.md).

## 4. Navegação

Cursos · Sobre · Conteúdo · Loja · Contato · **Área do Aluno** (destaque visual, acesso permanente no header).

## 5. Estrutura da Home

| # | Seção | Observação |
|---|---|---|
| 1 | Header | Caixa branca arredondada flutuante. |
| 2 | Hero | Título "Conheça nossos cursos"; apoio "Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem."; CTA "Explorar cursos". |
| 3 | Marcar avaliação | Formulário em duas colunas com o depoimento. |
| 4 | Depoimento | Fundo navy. |
| 5 | Conteúdos em destaque | Três blocos de cor. |
| 6 | Apresentação de Maria Salete | Retrato e texto. |
| 7 | Cursos em destaque | Card do curso. |
| 8 | Depoimentos adicionais | **Só se houver conteúdo real.** |
| 9 | Chamada final | Fundo light-blue (o footer já é navy). |
| 10 | Footer | Navy. |

Wireframes em [05](05-WIREFRAMES.md).

## 6. Curso inicial

**Dificuldades na Aprendizagem** - 6 módulos, 21 aulas (estrutura oficial do roteiro mestre, versão consolidada 2.0).

| Módulo | Título | Aulas |
|---|---|---|
| M0 | Orientação | 2 |
| M1 | Fundamentos | 3 |
| M2 | Condições relacionadas à aprendizagem | 8 |
| M3 | Bases neurocognitivas | 3 |
| M4 | Funções cognitivas | 3 |
| M5 | Caminho da leitura e encerramento | 2 |

Total: 2 + 3 + 8 + 3 + 3 + 2 = 21 aulas.

Regra: **não inventar** aulas, certificados, carga horária, preços ou benefícios. Tudo o que não estiver confirmado é marcado `[A CONFIRMAR]`.

Público confirmado: pais, professores, pedagogos, psicopedagogos, fonoaudiólogos e outros profissionais que acompanham crianças em idade escolar.

## 7. Área do Aluno (futuro)

Login e cadastro · dashboard · cursos adquiridos · módulos e aulas · player integrado · retomada da reprodução · progresso · materiais complementares · histórico de compras · certificados (se adotados) · painel administrativo.

Nesta fase, apenas a camada visual; sem autenticação nem banco real.

## 8. Páginas internas

| Página | Conteúdo |
|---|---|
| Cursos | Catálogo e páginas individuais. |
| Sobre | Trajetória. |
| Conteúdo | Artigos e categorias. |
| Loja | Produtos digitais e compra. |
| Contato | Agendamento e canais. |
| Área do Aluno | Ver seção 7. |

Árvore completa e rotas em [04](04-SITEMAP.md).

## 9. Tecnologia

| Agora | Futuro (não instalar agora) |
|---|---|
| React, Next.js App Router, TypeScript | Supabase (banco, login, matrículas) |
| CSS organizado e responsivo | Cloudflare (DNS) |
| Lucide React | Mux ou Cloudflare Stream (vídeo) |
| Playwright | Stripe ou Mercado Pago (pagamento) |
| Git | CMS |

Não implementar serviços pagos sem aprovação. Detalhes em [06](06-TECHNICAL-ARCHITECTURE.md).

## 10. Responsividade

Desktop, tablet e smartphone, com adaptações reais (recomposição, não apenas redução).

## 11. Regras de trabalho

1. Não inventar conteúdo institucional.
2. Não substituir a identidade.
3. Manter o posicionamento híbrido.
4. Não implementar sem planejamento.
5. Priorizar a fidelidade à referência.
6. Componentes reutilizáveis.
7. Acessibilidade e SEO.
8. Validar visualmente cada etapa.
