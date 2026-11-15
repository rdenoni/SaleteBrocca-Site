# 05 - Wireframes

Wireframes em ASCII. Cores e tokens em [03](03-DESIGN-SYSTEM.md); rotas em [04](04-SITEMAP.md).

Convenções:

- `[A CONFIRMAR]` marca qualquer fato desconhecido. Nunca preencher preço, carga horária, certificado, CRFa ou depoimentos.
- Proporções vêm do PSD de referência (prancheta 1920x2855). O layout é projetado a 1440px: valores do PSD x 0,75.
- Dimensões do PSD (1920) -> layout (1440): header 176 -> 128px; banner 952 -> 714px; avaliação+depoimento 661 -> ~496px; blocos de conteúdo 760 -> 570px (cada um 1/3 da largura); footer 400 -> 300px; faixa inferior 97 -> ~73px.

## 1. Home - desktop (>= 1100px)

Altura aproximada a 1440px: ~2140px. Largura total, seções de borda a borda.

```
 1440px
+--------------------------------------------------------------------------------+
|  48px                                                                          |
|  +--------------------------------------------------------------------------+  | <- Header: caixa branca
|  | [LOGO lateral]   CURSOS  SOBRE  CONTEÚDO  LOJA  CONTATO   (( ÁREA DO     |  |    arredondada, 128px,
|  |  (esquerda)      ^gota ciano = item atual                  ALUNO ))       |  |    flutua a 48px das bordas
|  +--------------------------------------------------------------------------+  |    (shadow-header)
|                                                                                |
|  ################ HERO: foto full-bleed, P&B + soft-light blue-strong ######## | <- 714px
|  ################ (véu navy à esquerda sob o texto)                  ######## |
|  ####                                                                    #### |
|  ####  Conheça nossos                                                    #### |
|  ####  cursos              <- display 56/60, branco, alinhado à esquerda #### |
|  ####  ======              <- fio ciano 120x6                            #### |
|  ####  Formação, conhecimento e ferramentas para compreender             #### |
|  ####  as dificuldades de aprendizagem.                                  #### |
|  ####  [ EXPLORAR CURSOS ]   <- botão ghost                              #### |
|  ####                                                                    #### |
|  ####                                         o  O  o  <- indicadores    #### |
+--------------------------------------------------------------------------------+
|                         48%                |              52%                  | <- ~496px
|  BRANCO                                    |  NAVY                             |
|                       ?                    |   "                               |
|                   (? ciano gigante         |   Júlia é uma criança que desde   |
|                    atrás do título)        |   pequena tinha muita dificuldade |
|          QUER MARCAR                       |   em se comunicar [...]           |
|          UMA AVALIAÇÃO?                    |   [TEXTO REAL A CONFIRMAR]        |
|          (caixa alta, navy)                |                         "         |
|                                            |                                   |
|     +-------------------------------+      |           (o) foto circular       |
|     | NOME COMPLETO                 |      |               anel ciano          |
|     +-------------------------------+      |       DANIELE SCHLICHTING         |
|     +-------------------------------+      |       FUSINATO                    |
|     | TELEFONE                      |      |       Mãe da paciente             |
|     +-------------------------------+      |       [autorização A CONFIRMAR]   |
|                       [ ENVIAR ] outline   |                                   |
+---------------------+----------------------+-----------------------------------+
|  LIGHT-BLUE         |  BLUE                |  LIGHT-BLUE                       | <- 570px, sem gap,
|        D            |        P             |        C                          |    3 blocos de 1/3
|  (letra gigante     |  (letra gigante      |  (letra gigante                   |    full-bleed
|   translúcida)      |   translúcida)       |   translúcida)                    |
|  +---------------+  |  +---------------+   |  +---------------+                |
|  |               |  |  |               |   |  |               |                |
|  |  foto alta    |  |  |  foto alta    |   |  |  foto alta    |                |
|  |  radius-lg    |  |  |  radius-lg    |   |  |  radius-lg    |                |
|  |  (3:5)        |  |  |  (3:5)        |   |  |  (3:5)        |                |
|  | +-----------+ |  |  | +-----------+ |   |  | +-----------+ |                |
|  | |Disfagia:  | |  |  | |PAC: Como é| |   |  | |Castigo:   | |                |
|  | |quais os   | |  |  | |feita a    | |   |  | |13 verdades| |                |
|  | |sintomas...| |  |  | |avaliação..| |   |  | |sobre...   | |                |
|  | +-----------+ |  |  | +-----------+ |   |  | +-----------+ |                |
|  +---------------+  |  +---------------+   |  +---------------+                |
|     Acesse >        |     Acesse >         |     Acesse >                      |
|  (título em painel branco translúcido que avança sobre a foto)                  |
|  Textos dos cards conforme a referência; confirmar pauta real [A CONFIRMAR]    |
+--------------------------------------------------------------------------------+
|  BRANCO  (padding 96px)                                                        |
|                                                                                |
|     5 colunas                        |      7 colunas                          |
|                                                                                |
|        +--- bloco BLUE (topo dir.)    |   APRESENTAÇÃO                          |
|        |  +--------------------+     |   Maria Salete Brocca                   |
|        |  |                    |     |   ======                                |
|        |  |   retrato          |     |   Texto de biografia em Martel 18/32,   |
|        |  |   radius-lg        |     |   coluna de 60-72 caracteres.           |
|        |  |                    |     |   [BIOGRAFIA A CONFIRMAR]               |
|        |  +--------------------+     |   CRFa [A CONFIRMAR]                    |
|     bloco CYAN (base esq.) ---+       |   [ CONHECER A HISTÓRIA ]  -> /sobre    |
|     (blocos deslocados, encaixe das peças do símbolo)                          |
+--------------------------------------------------------------------------------+
|  BRANCO / LIGHT-GRAY tênue                                                     |
|  CURSOS EM DESTAQUE                                                            |
|  ======                                                                        |
|   +----------------------------------------------------------+                 |
|   | foto multiply sobre blue          |  [selo ciano]        |  radius-md      |
|   |                                   |  Dificuldades na     |  shadow-card    |
|   |                                   |  Aprendizagem        |                 |
|   |                                   |  Para pais, professores, pedagogos,    |
|   |                                   |  psicopedagogos, fonoaudiólogos...     |
|   |                                   |  [ico] 6 módulos  [ico] 21 aulas       |
|   |                                   |  Preço [A CONFIRMAR]                   |
|   |                                   |  [ VER CURSO ]                         |
|   +----------------------------------------------------------+                 |
+--------------------------------------------------------------------------------+
|  (Seção 8 - DEPOIMENTOS ADICIONAIS: renderizar SOMENTE se houver depoimentos   |
|   reais autorizados; caso contrário a seção não existe)                        |
+--------------------------------------------------------------------------------+
|  LIGHT-BLUE (NÃO navy: o footer logo abaixo já é navy)                         |
|   [grafismo: peças do quebra-cabeça do símbolo, cores institucionais]         |
|                                                                                |
|       Que toda criança, independente da dificuldade,                           |
|       tem a capacidade de ler e escrever.      <- frase-conceito do manual     |
|       [ EXPLORAR CURSOS ] primário      [ FALAR COM A SALETE ] outline         |
+--------------------------------------------------------------------------------+
|  NAVY (footer, 300px)                                                          |
|  [LOGO branco]   PROFISSÃO        CURSOS           CONTEÚDO     CONTATO        |
|                  (títulos ciano)                                               |
|  (o) (o) (o)     História        Catálogo         Artigos      Agendamento     |
|  WA  IG  IN      Formação        Loja             Categorias   WhatsApp        |
|  círculos ciano  Atuação         Área do Aluno                 Formulário      |
|                  (links on-navy-muted)                                         |
+--------------------------------------------------------------------------------+
|  NAVY-RAISED (~73px)    (c) [ANO] SaleteBrocca - Fonoaudiologia    Privacidade |
+--------------------------------------------------------------------------------+
```

Observações da Home desktop:

- Ordem das seções: 1 Header, 2 Hero, 3 Avaliação, 4 Depoimento, 5 Conteúdos em destaque, 6 Apresentação, 7 Cursos em destaque, 8 Depoimentos adicionais (condicional), 9 Chamada final, 10 Footer.
- Avaliação (3) e Depoimento (4) formam uma faixa única 48% / 52%.
- Texto da chamada final: a frase-conceito vem do manual; o rótulo dos botões é proposta, validar com a cliente.
- O formulário tem dois campos (nome completo, telefone), ambos obrigatórios; erros inline com ícone e texto.

## 2. Home - mobile (< 768px, referência 390px)

Margens de 16px. Seções empilhadas.

```
390px
+------------------------------------+
| +--------------------------------+ |  <- Header 72px, flutuante, 16px das bordas
| | [LOGO]          (( user )) [=] | |     Área do Aluno = botão-ícone circular
| +--------------------------------+ |     ciano (aria-label); [=] abre menu
|                                    |     (ícones Lucide: user, menu)
| ############## HERO ############## |  <- min 560px, foto P&B + azul
| ##                              ## |
| ##  Conheça nossos              ## |     display 36/40
| ##  cursos                      ## |
| ##  ====                        ## |
| ##  Formação, conhecimento e    ## |
| ##  ferramentas para            ## |
| ##  compreender as dificuldades ## |
| ##  de aprendizagem.            ## |
| ##  [ EXPLORAR CURSOS ]  (48px) ## |
| ##                  o O o       ## |
+------------------------------------+
| BRANCO                             |
|             ?                      |  <- ? ciano atrás do título
|      QUER MARCAR                   |
|      UMA AVALIAÇÃO?                |
|  +------------------------------+  |
|  | NOME COMPLETO                |  |  <- campos 48px de altura
|  +------------------------------+  |
|  +------------------------------+  |
|  | TELEFONE                     |  |
|  +------------------------------+  |
|                    [ ENVIAR ]     |
+------------------------------------+
| NAVY                               |
|   "                                |
|   Júlia é uma criança que desde    |
|   pequena tinha muita dificuldade  |
|   [TEXTO A CONFIRMAR]              |
|   (o) DANIELE SCHLICHTING FUSINATO |
|       Mãe da paciente              |
+------------------------------------+
| LIGHT-BLUE  (bloco 1, altura própria)
|        D                           |
|   +----------------------+         |
|   |   foto alta          |         |
|   |  +----------------+  |         |
|   |  | Disfagia: ...  |  |         |
|   |  +----------------+  |         |
|   +----------------------+         |
|   Acesse >                         |
+------------------------------------+
| BLUE  (bloco 2)  mesma composição  |
+------------------------------------+
| LIGHT-BLUE  (bloco 3)              |
+------------------------------------+
| BRANCO                             |
|   +-----------+  retrato           |
|   |           |  com blocos        |
|   |  retrato  |  deslocados        |
|   +-----------+  cyan/blue         |
|   APRESENTAÇÃO                     |
|   Maria Salete Brocca              |
|   ====                             |
|   Texto Martel 18/32 [A CONFIRMAR] |
|   [ CONHECER A HISTÓRIA ]          |
+------------------------------------+
| CURSOS EM DESTAQUE                 |
| +--------------------------------+ |
| | foto                           | |
| | Dificuldades na Aprendizagem   | |
| | 6 módulos · 21 aulas           | |
| | Preço [A CONFIRMAR]            | |
| | [ VER CURSO ]                  | |
| +--------------------------------+ |
+------------------------------------+
| LIGHT-BLUE  chamada final + peças  |
|  Que toda criança [...] escrever.  |
|  [ EXPLORAR CURSOS ]               |
|  [ FALAR COM A SALETE ]            |
+------------------------------------+
| NAVY footer: logo, redes (o)(o)(o) |
|  2 colunas: PROFISSÃO | CURSOS     |
|             CONTEÚDO  | CONTATO    |
+------------------------------------+
| (c) [ANO] SaleteBrocca  Privacidade|
+------------------------------------+

Menu aberto (tela cheia, NAVY):
+------------------------------------+
| [LOGO branco]                  [X] |
|                                    |
|  (Cursos)    <- gota ciano = atual |
|  Sobre                             |
|  Conteúdo      itens grandes h3    |
|  Loja                              |
|  Contato                           |
|  [ ÁREA DO ALUNO ]  accent         |
+------------------------------------+
```

Tablet (768-1099): header de 72px (logo, Área do Aluno com rótulo, menu); avaliação e depoimento empilhados; blocos de conteúdo em linha horizontal rolável ou 2+1; footer em 2 colunas.

## 3. Páginas internas (desktop)

Todas começam com o header flutuante e terminam com a chamada final (quando indicado) e o footer da Home. Banners internos usam `photo-tint`. Cada página tem um único `h1`.

### 3.1 Cursos - catálogo (`/cursos`)

```
[HEADER]
+-----------------------------------------------------------------------+
| BANNER (photo-tint, ~360px)   h1: Cursos                               |
|                               Formação para quem acompanha crianças    |
+-----------------------------------------------------------------------+
| Filtros (futuro): [Todos] [Para pais] [Para profissionais] [A CONFIRMAR]|
|                                                                        |
| +---------------------+  +---------------------+  +-----------------+  |
| | CourseCard          |  | (vazio futuro)      |  | (vazio futuro)  |  |
| | Dificuldades na     |  |                     |  |                 |  |
| | Aprendizagem        |  |                     |  |                 |  |
| | 6 módulos · 21 aulas|  |                     |  |                 |  |
| | [ VER CURSO ]       |  |                     |  |                 |  |
| +---------------------+  +---------------------+  +-----------------+  |
+-----------------------------------------------------------------------+
[FOOTER]
```
Mobile: cards em coluna única; filtros viram chips roláveis. Só existe um curso real; não criar cards de cursos inexistentes (os espaços vazios acima são apenas ilustrativos do grid).

### 3.2 Curso - detalhe (`/cursos/dificuldades-na-aprendizagem`)

```
[HEADER]
+-----------------------------------------------------------------------+
| HERO (photo-tint)                                                      |
| eyebrow: CURSO                                                         |
| h1: Dificuldades na Aprendizagem                                       |
| 6 módulos · 21 aulas                       [ QUERO ME INSCREVER ]      |
+-----------------------------------------------------------------------+
| PARA QUEM É                                      | INFORMAÇÕES COMERCIAIS |
| Pais, professores, pedagogos, psicopedagogos,    | +--------------------+ |
| fonoaudiólogos e outros profissionais que        | | Preço: [A CONFIRMAR]|
| acompanham crianças em idade escolar.            | | Carga horária:     | |
|                                                  | |  [A CONFIRMAR]     | |
| SOBRE O CURSO (Martel 18/32)                     | | Certificado:       | |
| [DESCRIÇÃO A CONFIRMAR]                          | |  [A CONFIRMAR]     | |
|                                                  | | Acesso:            | |
| SOBRE A PROFESSORA                               | |  [A CONFIRMAR]     | |
| Maria Salete Brocca (card curto) -> /sobre       | | [ COMPRAR ]        | |
|                                                  | +--------------------+ |
| CONTEÚDO DO CURSO  (acordeão <details>)          | (sticky no desktop)    |
| [0] Orientação ............................. 2 aulas  v                |
|     - Apresentação da Maria Salete                                     |
|     - Introdução, público e objetivos do curso                         |
| [1] Fundamentos ............................ 3 aulas  v                |
|     - Dificuldades na aprendizagem: o que são e como observar          |
|     - Transtornos específicos da aprendizagem                          |
|     - Fatores pedagógicos e barreiras escolares                        |
| [2] Condições relacionadas à aprendizagem .. 8 aulas  v                |
|     - Alexia e alterações adquiridas da leitura                        |
|     - Disgrafia, disortografia e expressão escrita                     |
|     - Dificuldades na matemática e discalculia                         |
|     - Dislexia: história e definição atual                             |
|     - Perfis de dificuldade na leitura                                 |
|     - Fluência, compreensão e linguagem interior                       |
|     - Síndrome de Irlen e alterações visuoperceptivas na leitura       |
|     - Hiperlexia, compreensão leitora e autismo                        |
| [3] Bases neurocognitivas .................. 3 aulas  v                |
|     - Neurônios, sinapses e comunicação neural                         |
|     - Sistemas funcionais e aprendizagem                               |
|     - Genética, ambiente e fatores de risco                            |
| [4] Funções cognitivas ..................... 3 aulas  v                |
|     - Introdução às funções cognitivas                                 |
|     - Atenção, memória e funções executivas                           |
|     - Linguagem, percepção e processamento                             |
| [5] Caminho da leitura e encerramento ...... 2 aulas  v                |
|     - O caminho da leitura                                             |
|     - Síntese, limites de atuação e encerramento                       |
+-----------------------------------------------------------------------+
| FAQ [A CONFIRMAR]   |   CTA final                                      |
+-----------------------------------------------------------------------+
[FOOTER]
```
Total 2+3+8+3+3+2 = 21 aulas. Módulos fechados por padrão (primeiro aberto opcional). Mobile: bloco comercial vai logo após o hero, botão fixo "Comprar" no rodapé da tela.

### 3.3 Compra (`/cursos/[slug]/compra`) - visual

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Inscrição - Dificuldades na Aprendizagem                           |
| Etapas: (1 Seus dados) - (2 Pagamento) - (3 Confirmação)               |
|                                                                        |
| +--------------------------------------+  +-----------------------+    |
| | Nome completo        [____________]  |  | RESUMO DO PEDIDO      |    |
| | E-mail               [____________]  |  | Dificuldades na       |    |
| | Telefone             [____________]  |  | Aprendizagem          |    |
| | [ ] Li e aceito a política de        |  | 6 módulos · 21 aulas  |    |
| |     privacidade (/privacidade)       |  | Total: [A CONFIRMAR]  |    |
| | Pagamento: [A CONFIRMAR - sem gateway]|  | [ CONTINUAR ]        |    |
| +--------------------------------------+  +-----------------------+    |
+-----------------------------------------------------------------------+
[FOOTER]
```
Somente visual nesta fase; sem pagamento real. Mobile: resumo acima do formulário, colapsável.

### 3.4 Sobre (`/sobre`)

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Maria Salete Brocca            eyebrow: FONOAUDIÓLOGA CLÍNICA      |
| retrato grande + blocos cyan/blue deslocados                           |
+-----------------------------------------------------------------------+
| #historia  HISTÓRIA                                                    |
| Texto Martel. Pontos já citados no manual de marca: início aos 16 anos |
| em 1960 numa escola multisseriada [CONFIRMAR antes de publicar]        |
+-----------------------------------------------------------------------+
| #formacao  FORMAÇÃO                                                    |
| [FORMAÇÃO A CONFIRMAR]    CRFa [A CONFIRMAR]                           |
+-----------------------------------------------------------------------+
| #atuacao   ATUAÇÃO                                                     |
| Consultório [CIDADE A CONFIRMAR] · APAE de Cocal do Sul [CONFIRMAR]    |
| Cursos presenciais e online · jogos e softwares de alfabetização       |
+-----------------------------------------------------------------------+
| Frase-conceito (navy)  ->  CTA: [ CONHECER OS CURSOS ]                 |
+-----------------------------------------------------------------------+
[FOOTER]
```
Mobile: retrato no topo, seções empilhadas; âncoras viram índice fixo opcional.

### 3.5 Conteúdo - biblioteca (`/conteudo`)

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Conteúdo                                                           |
| Categorias: [Todas] [A CONFIRMAR] [A CONFIRMAR] ...  (/conteudo/categoria/[slug])
|                                                                        |
| DESTAQUE: card largo (foto + título "Palavra-chave: ..." + Acesse >)   |
|                                                                        |
| +-----------+ +-----------+ +-----------+                              |
| | ContentCard| | ContentCard| | ContentCard|   grid 3 colunas          |
| +-----------+ +-----------+ +-----------+                              |
| +-----------+ +-----------+ +-----------+                              |
| [ paginação ]                                                          |
+-----------------------------------------------------------------------+
[FOOTER]
```
Mobile: 1 coluna; categorias em chips roláveis. Artigos reais `[A CONFIRMAR]`; datas só quando houver publicação.

### 3.6 Categoria (`/conteudo/categoria/[slug]`)

```
[HEADER]
+-----------------------------------------------------------------------+
| eyebrow: CATEGORIA   h1: [Nome da categoria]                           |
| descrição curta [A CONFIRMAR]                                          |
| grid de ContentCard (3 colunas)  +  paginação                          |
| link: < Todos os conteúdos                                             |
+-----------------------------------------------------------------------+
[FOOTER]
```

### 3.7 Artigo (`/conteudo/[slug]`)

```
[HEADER]
+-----------------------------------------------------------------------+
| Breadcrumb: Conteúdo > Categoria                                       |
| h1: Palavra-chave: título do artigo                                    |
| Autora: Maria Salete Brocca · data [A CONFIRMAR]                       |
| imagem de capa radius-lg                                               |
|                                                                        |
| Corpo em Martel 18/32, coluna máx. 72 caracteres, centralizada         |
| h2/h3 em Noto Sans; citações em Martel Light                           |
|                                                                        |
| Caixa "Quer entender melhor?" -> /cursos ou /contato                   |
| Leia também: 3 ContentCards                                            |
+-----------------------------------------------------------------------+
[FOOTER]
```
Mobile: coluna única, margens de 16px.

### 3.8 Loja - catálogo (`/loja`)

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Loja              Produtos digitais                                |
| [Todos] [Materiais] [Jogos] [A CONFIRMAR]                              |
| +----------+ +----------+ +----------+ +----------+                    |
| | ProductCard (radius-md, shadow-card)                                |
| | imagem | nome [A CONFIRMAR] | Preço [A CONFIRMAR] | [ VER PRODUTO ] |
| +----------+ +----------+ +----------+ +----------+                    |
+-----------------------------------------------------------------------+
[FOOTER]
```
Catálogo de produtos real é `[A CONFIRMAR]`; não inventar produtos. Mobile: 1-2 colunas.

### 3.9 Produto (`/loja/[slug]`)

```
[HEADER]
+-----------------------------------------------------------------------+
| Breadcrumb: Loja > Produto                                             |
| +----------------------+   h1: [Nome do produto A CONFIRMAR]           |
| | galeria de imagens   |   Preço [A CONFIRMAR]                         |
| | (principal + minis)  |   Descrição (Martel) [A CONFIRMAR]            |
| +----------------------+   Formato: digital [A CONFIRMAR]              |
|                            [ COMPRAR ]                                 |
| Detalhes / O que inclui [A CONFIRMAR]                                  |
| Produtos relacionados                                                  |
+-----------------------------------------------------------------------+
[FOOTER]
```
Mobile: galeria no topo, botão de compra fixo no rodapé.

### 3.10 Checkout (`/loja/checkout`) - visual

```
[HEADER simplificado]
+-----------------------------------------------------------------------+
| h1: Finalizar compra                                                   |
| +------------------------------------+  +--------------------------+   |
| | Dados do comprador                 |  | RESUMO                   |   |
| | Nome, e-mail, telefone             |  | item · qtd · [A CONFIRMAR]|  |
| | Forma de pagamento [A CONFIRMAR]   |  | Total [A CONFIRMAR]      |   |
| | [ ] Aceito a política de privacidade|  | [ FINALIZAR ] (desativado)|  |
| +------------------------------------+  +--------------------------+   |
+-----------------------------------------------------------------------+
[FOOTER]
```
Sem integração de pagamento; botão sem ação real (ou estado desabilitado com aviso). Mobile: resumo no topo.

### 3.11 Contato (`/contato`)

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Contato                                                            |
| +------------------+  +------------------+  +------------------+       |
| | #agendamento     |  | #whatsapp        |  | #formulario      |       |
| | Marcar avaliação |  | (ico) WhatsApp   |  | Nome, telefone,  |       |
| | Atendimento em   |  | +55 (48)         |  | mensagem         |       |
| | [CIDADE A CONF.] |  | 9973-4469        |  | [ ENVIAR ]       |       |
| | horários [A CONF]|  | [A CONFIRMAR]    |  |                  |       |
| | [ AGENDAR ]      |  | [ CHAMAR ]       |  |                  |       |
| +------------------+  +------------------+  +------------------+       |
| E-mail: contato@saletebrocca.com [A CONFIRMAR]                         |
| Redes: Instagram · LinkedIn [A CONFIRMAR]                              |
| Aviso de privacidade: link /privacidade                                |
+-----------------------------------------------------------------------+
[FOOTER]
```
Número e e-mail aparecem nos arquivos de origem, mas precisam ser confirmados. Mobile: três cartões empilhados, WhatsApp primeiro.

### 3.12 Login (`/area-do-aluno/login`)

```
[HEADER]  (Área do Aluno = item atual)
+-----------------------------------------------------------------------+
| fundo light-blue com padrão de peças                                   |
|        +--------------------------------------+                        |
|        | h1: Área do Aluno                    |                        |
|        | E-mail   [____________________]     |                        |
|        | Senha    [____________________] (o)  |                        |
|        | [ ENTRAR ]                           |                        |
|        | Esqueci a senha · Criar conta        |                        |
|        +--------------------------------------+                        |
+-----------------------------------------------------------------------+
[FOOTER]
```
Visual apenas nesta fase. Mobile: cartão em largura total.

### 3.13 Dashboard (`/area-do-aluno`)

```
[HEADER]
+-----------------------------------------------------------------------+
| h1: Olá, [nome]                                                        |
| Sub-navegação: Início · Meus cursos · Materiais · Compras              |
|                                                                        |
| CONTINUAR ASSISTINDO                                                   |
| +-------------------------------------------------------------------+  |
| | miniatura | Dificuldades na Aprendizagem                          |  |
| |           | Módulo [n] · Aula [n]  ========-----  [n]% concluído |  |
| |           | [ CONTINUAR ]  (retoma na posição salva)              |  |
| +-------------------------------------------------------------------+  |
| PROGRESSO            | ÚLTIMOS MATERIAIS       | COMPRAS RECENTES      |
| (barra, aulas        | lista                   | lista                 |
|  concluídas / 21)    |                         |                       |
+-----------------------------------------------------------------------+
[FOOTER]
```
Dados fictícios devem ser claramente marcados como exemplo. Mobile: cartões empilhados; sub-navegação em abas roláveis.

### 3.14 Meus cursos (`/area-do-aluno/cursos`)

```
+-----------------------------------------------------------------------+
| h1: Meus cursos                                                        |
| +----------------------+ +----------------------+                      |
| | CourseCard (aluno)   | | (estado vazio:       |                      |
| | progresso [n]%       | |  "Você ainda não tem |                      |
| | [ ACESSAR ]          | |   outros cursos")    |                      |
| +----------------------+ +----------------------+                      |
+-----------------------------------------------------------------------+
```

### 3.15 Curso do aluno (`/area-do-aluno/cursos/[slug]`)

```
+-----------------------------------------------------------------------+
| h1: Dificuldades na Aprendizagem       progresso [n] de 21 aulas       |
| ======-------  [n]%                                                    |
| MÓDULOS E AULAS (acordeão)                                             |
| [0] Orientação                          [2 aulas]  v                   |
|     (v) Apresentação da Maria Salete                      concluída    |
|     ( ) Introdução, público e objetivos do curso          a assistir   |
| [1] Fundamentos ... [2..5] (mesmos módulos e aulas da seção 3.2)       |
| Cada aula é um link para /area-do-aluno/cursos/[slug]/aulas/[aula]     |
+-----------------------------------------------------------------------+
```
Estado de aula: concluída (ícone + palavra, `success`), em andamento, a assistir. Mobile: lista única, sem sidebar.

### 3.16 Player (`/area-do-aluno/cursos/[slug]/aulas/[aula]`)

```
+-----------------------------------------------------------------------+
| < Voltar ao curso            Módulo [n] · Aula [n]                      |
| +-----------------------------------------+  +----------------------+  |
| |                                         |  | LISTA DE AULAS       |  |
| |         PLAYER DE VÍDEO (16:9)          |  | M0 Orientação        |  |
| |         [placeholder; sem vídeo real]   |  |  (v) Apresentação... |  |
| |                                         |  |  (>) Introdução...   |  |
| |  |>  ------o---------------  00:00      |  | M1 Fundamentos ...   |  |
| +-----------------------------------------+  | (rolável)            |  |
| h1: Título da aula                           +----------------------+  |
| [ < AULA ANTERIOR ]   [ MARCAR CONCLUÍDA ]   [ PRÓXIMA AULA > ]        |
| Abas: Descrição · Materiais da aula · Anotações [A CONFIRMAR]          |
+-----------------------------------------------------------------------+
```
Retomada da reprodução e progresso são futuros (vídeo e Supabase). Mobile: player no topo (16:9), lista de aulas abaixo, em gaveta.

### 3.17 Materiais (`/area-do-aluno/materiais`)

```
+-----------------------------------------------------------------------+
| h1: Materiais complementares                                           |
| Filtro: [Todos os cursos v]                                            |
| +-------------------------------------------------------------------+  |
| | (ico) Título do material [A CONFIRMAR]  · curso · tipo  [BAIXAR]  |  |
| | (ico) ...                                                          |  |
| +-------------------------------------------------------------------+  |
| Estado vazio: "Nenhum material disponível por enquanto."               |
+-----------------------------------------------------------------------+
```

## 4. Estados e páginas especiais

```
404:  h1 "Página não encontrada" + frase curta + [ VOLTAR PARA O INÍCIO ] + atalhos (Cursos, Contato)
/privacidade:  h1 + texto LGPD (coleta de nome e telefone, finalidade, contato do responsável) [TEXTO JURÍDICO A CONFIRMAR]
```

## 5. Regra de marcação

Todo campo de dados sem fonte real aparece no desenvolvimento como `[A CONFIRMAR]` (texto visível apenas em ambiente de desenvolvimento ou omitido em produção). Lista consolidada de pendências em [07](07-IMPLEMENTATION-PLAN.md).
