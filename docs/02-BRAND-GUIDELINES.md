# 02 - Diretrizes da Marca

Fonte principal: **Manual da Marca TCC 2021** (Rafael Denoni / Denomotion). Este documento resume o manual para uso no site. Aplicação visual em [03 Design System](03-DESIGN-SYSTEM.md).

## 1. História e posicionamento

Maria Salete Brocca é professora e fonoaudióloga clínica. Iniciou a carreira aos 16 anos, em 1960, em uma escola multisseriada, onde chegou ao cargo de direção e depois tornou-se fonoaudióloga.

Segundo o manual:

- Atende em consultório particular, exclusivamente crianças com dificuldade de aprendizagem, mais especificamente dislexia.
- Atende também na APAE de Cocal do Sul (deficiência intelectual, comorbidades e síndromes raras).
- Ministra cursos presenciais e online para professores e profissionais da área.
- Desenvolve projetos paralelos, como jogos e softwares de apoio à alfabetização.

Frase-conceito: **"Que toda criança, independente da dificuldade, tem a capacidade de ler e escrever."**

Observação: estes fatos vêm do manual de marca. Antes de publicá-los como texto institucional, confirmar com a cliente (ver pendências em [07](07-IMPLEMENTATION-PLAN.md)).

## 2. Conceito

O cérebro humano é um grande quebra-cabeça: peças que se comunicam entre si e, juntas, trabalham por um objetivo. Para alcançá-lo são necessários profissionais como Maria Salete, que ajuda a direcionar esses pensamentos por um caminho mais rápido e eficiente.

Símbolo:

- Proporção aproximada de 1,6 (número áureo).
- Duas formas simétricas, porém distintas na orientação, voltadas para o centro, mostrando que podem se encaixar.
- Pela lei do fechamento, forma-se a inicial da profissional, a letra **"S"**, peça central e mais importante.
- Terminais arredondados trazem conforto; a espessura grossa transmite confiabilidade e simpatia.

Consequência para o site: cantos generosos (`radius-lg` 32px), blocos que se encaixam (sobre, chamada final) e o padrão de peças como grafismo de apoio.

## 3. Voz e tom

A voz da marca é **simples, dinâmica e otimista**. A abordagem é inclusiva e minimalista, com proximidade **intimista e atenciosa**. A linguagem pode parecer técnica e científica, mas a escrita e a fala da Salete são **simples e didáticas**. Ela é entusiasmada, otimista e sempre pronta para ajudar na evolução das pessoas e da sociedade.

**Palavras-chave:** neurociência · alfabeto · voz · segurança · amigável · humana · esperança · atenciosa · dinâmica · otimista · simples · acessível · confiável.

Regras de escrita para o site:

- Primeira pessoa nas falas da Salete; "você" para o leitor.
- Títulos em frase com caixa normal; caixa alta só em menu, botões, eyebrows e títulos curtos que a referência já usa.
- Palavra-chave em negrito com dois-pontos nos cards ("**Disfagia:** quais os sintomas e como tratá-la?").
- Sem emoji.
- Nunca inventar depoimentos, números, preços, carga horária, certificados ou dados clínicos.

## 4. Cores

O manual descreve cores frias e análogas que transmitem **confiança, segurança, acessibilidade, amizade, dinâmica e otimismo**, agradam o público infantil e garantem bom contraste.

| Nome | Pantone | HEX | RGB | CMYK |
|---|---|---|---|---|
| Turquoise (ciano) | 319C | `#18CFD5` | 24, 207, 213 | ver manual, p. 11 |
| Blue (azul) | 2383C | `#337EB5` | 51, 126, 181 | ver manual, p. 11 |
| Navy | 289C | `#0F2438` | 15, 36, 56 | ver manual, p. 11 |
| Light grey | 663XGC | `#E8E7EA` | 232, 231, 234 | ver manual, p. 11 |
| Pale blue-grey | 7541C | `#D9E1E2` | 217, 225, 226 | ver manual, p. 11 |
| Charcoal | 426XGC | `#24282B` | 36, 40, 43 | ver manual, p. 11 |

Os valores RGB foram calculados a partir do HEX; o texto extraído do manual não preservou os valores CMYK, que devem ser lidos na página 11 do PDF.

As primárias são cores de reconhecimento; as de apoio têm papel funcional e criam harmonia. Sempre que possível, a logomarca usa as versões preferenciais de cor.

Quatro cores derivadas foram adicionadas para acessibilidade (`blue-strong`, `text-muted`, `on-navy-muted`, `navy-raised`), mais `error` e `success`. Ver [03](03-DESIGN-SYSTEM.md).

## 5. Tipografia

| Função | Família | Uso |
|---|---|---|
| Institucional | **Noto Sans** (Black/Bold no logotipo) | Títulos, destaques, navegação, interface. Sem serifa, humanista: acessível, amigável, humana. |
| Apoio | **Martel** | Serifada, para leiturabilidade de textos longos. |

O uso combinado traz personalidade e conforto visual. Ambas estão no Google Fonts. Martel não tem itálico.

## 6. Logomarca

### Versões

O manual define 4 versões: **vertical padrão** (uso preferencial), **vertical especial**, **horizontal** e **responsiva**. Horizontal, vertical especial e responsiva só são usadas quando a vertical padrão apresentar dificuldades. No site, o header usa a versão lateral (horizontal) por necessidade de espaço.

### Margem de segurança

Área livre ao redor da marca, medida pelo valor X encontrado na própria marca.

### Tamanhos mínimos (digital)

| Versão | Largura mínima |
|---|---|
| Assinatura completa | 130 px |
| Lockup menor | 97 px |
| Abaixo de 97 px | Usar apenas o símbolo |

### Positivo e negativo

Usar apenas quando houver limitação técnica (ausência de cores) que impeça a versão preferencial.

### Usos proibidos

1. Não distorcer a marca.
2. Não rotacionar ou inclinar.
3. Não rediagramar o logotipo.
4. Não alterar as cores.
5. Não aplicar em fundo sem contraste.
6. Não aplicar outline.
7. Não aplicar qualquer tipo de efeito.
8. Não reposicionar os elementos.
9. Não cortar qualquer parte da marca.

## 7. Padrão (pattern) e grafismo

- **Pattern:** módulo repetidor aplicável em diversas composições; as cores podem mudar, desde que sejam as institucionais.
- **Grafismos:** derivados diretamente do conceito da marca. Servem de apoio à composição ou de destaque, mas **a marca deve estar sempre presente** em alguma das versões.
- No site: padrão e peças na chamada final e na Área do Aluno; letras gigantes translúcidas nos blocos de conteúdo (grafismo tipográfico da referência).

## 8. Aplicações previstas pelo manual

Impressas e digitais: papelaria, máscara, canecas, jogos didáticos, cursos online, mídia social e **websites**.

## 9. Conflitos e decisões

As fontes de marca do projeto não concordam entre si. Regra adotada em cada conflito; alterar aqui se a cliente decidir diferente.

### Hierarquia de referência

1. **Manual da Marca TCC (2021)** - cores, tipografia, logotipo, conceito e voz.
2. **Site de referência** (screenshot e PSD) - composição, proporções, fotografia e estrutura da Home.
3. **Website Master Brief** - posicionamento, navegação, conteúdo e regras de trabalho.
4. **Manual da Marca (versão Export)** - consulta histórica apenas; rascunho com textos de modelo.

### Conflitos encontrados

| Tema | Fontes em conflito | Decisão |
|---|---|---|
| Tipografia | TCC: Noto Sans + Martel. PSD do site: Myriad Pro. Manual Export: Myriad Pro no logo, Museo + Museo Sans no texto. Logo antigo de slides: Roboto. | **Noto Sans + Martel** (TCC e brief). Myriad, Museo e Roboto não entram no site. |
| Paleta | TCC/brief: `#337EB5 #18CFD5 #0F2438 #D9E1E2 #E8E7EA #24282B`. PSD: tons vizinhos `#007FB8`, `#00D0D6`, `#001F36`, `#D3EDF4`, `#003553`. Arte conceitual do logo: `#D1E5E3`. Paleta Coolors avulsa: `#12263A #0C120C #D7B377 #EFF7FF #56A3A6`. | **Paleta TCC exata.** Tons do PSD lidos como variações de exportação e normalizados. A paleta Coolors (com dourado) não pertence a esta identidade. |
| Wordmark | Arquivos do site e logos exportados: "SaleteBrocca" em grotesca tipo Roboto. Pranchetas 3x do TCC: wordmark em Noto Sans com "fonoaudióloga". | Usar **os arquivos do site** (`assets/Logotipo`), indicados pela cliente, sem redesenhar. **A confirmar com o designer:** qual wordmark é o oficial atual. |
| Contraste | A referência usa texto branco sobre ciano (Área do Aluno, aba ativa), 1.9:1, e textos pequenos em `blue` sobre claro, 4.4:1. | Texto **navy** sobre ciano (8.2:1). Criado `blue-strong` para botões e links. Mesma aparência, legível. |
| Footer | Links da referência: "Fac", "Consutório", "Soluções" (textos de modelo com erros). | Colunas mantidas na posição; links trocados pelas páginas reais do mapa do site. |
| Hero | Referência: "Conheça o meu curso de Dificuldade de aprendizagem / QUERO CONHECER". Brief: "Conheça nossos cursos / EXPLORAR CURSOS". | **Brief.** |
| Depoimento | O texto da Daniele Schlichting Fusinato existe só na arte (o papel aparece como "Mão da paciente"). | Mantido e corrigido para "Mãe da paciente". **A confirmar:** autorização de uso e redação final. Nenhum outro depoimento tem texto real nos arquivos. |
| Datas dos artigos | Referência: datas de 2021. | Substituídas por "Acesse >" (versão 2026 da referência). Datas voltam quando houver artigos publicados. |

### Pendências para a cliente

- Wordmark oficial (grotesca do site x Noto Sans do TCC) e, se possível, os logos em **SVG**.
- Número do CRFa e textos da biografia (formação, atuação, cidade).
- Autorização e texto final dos depoimentos.
- Preço, carga horária e certificado do curso.
- Canais oficiais: WhatsApp, Instagram, LinkedIn.
- Retratos profissionais da Salete em alta resolução (os atuais têm 384px).
