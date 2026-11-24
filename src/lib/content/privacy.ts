/* Política de privacidade: descreve só o que o código do site faz de fato (auditoria em docs/06, docs/08 e docs/09).
   O que depende de decisão da cliente (CPF/CNPJ, endereço, encarregado, prazos de guarda, mecanismo de transferência
   internacional) aparece como "A confirmar" na página. A redação jurídica final é pendência 10 (docs/07). */

export interface DataFlow {
  id: string;
  /** Nome do fluxo, como a pessoa o reconhece no site. */
  title: string;
  /** Onde o dado é pedido (rota do site); ausente quando o dado nasce fora do site. */
  href?: string;
  /** Dados tratados neste fluxo. */
  fields: readonly string[];
  /** Estado real hoje, em linguagem simples. */
  status: string;
  purpose: string;
  legalBasis: string;
}

export const DATA_FLOWS: readonly DataFlow[] = [
  {
    id: "avaliacao",
    title: "Pedido de avaliação",
    href: "/avaliacao#formulario",
    fields: ["Nome", "Telefone"],
    status:
      "Hoje o formulário só confere os campos no seu navegador: nada é enviado nem guardado. Quando o envio for ativado, os dados passam a ser recebidos pela Salete.",
    purpose: "Retornar o contato para combinar a avaliação.",
    legalBasis: "Consentimento (art. 7º, I, da LGPD), dado ao marcar a caixa do formulário.",
  },
  {
    id: "contato",
    title: "Formulário de contato",
    href: "/contato#formulario",
    fields: ["Nome", "Telefone", "E-mail (opcional)", "Assunto", "Mensagem"],
    status:
      "Hoje o formulário só confere os campos no seu navegador: nada é enviado nem guardado. Quando o envio for ativado, a mensagem passa a ser recebida pela Salete.",
    purpose: "Responder à sua mensagem, inclusive a pedidos sobre dados pessoais.",
    legalBasis:
      "Consentimento (art. 7º, I). Pedidos feitos para exercer direitos da LGPD também são tratados para cumprir obrigação legal (art. 7º, II).",
  },
  {
    id: "compra",
    title: "Compra de curso ou produto",
    href: "/cursos",
    fields: [
      "No site: nenhum dado digitado",
      "Recebidos da Kiwify depois da compra: e-mail do comprador, número e situação do pedido, produto comprado",
      "Para produtos enviados pelos Correios: nome e endereço de entrega informados no pagamento",
    ],
    status:
      "O pagamento acontece no ambiente da Kiwify, que pede e trata os dados de pagamento e de cadastro do comprador. O site não coleta nome, telefone, endereço nem dados de cartão. Os produtos físicos (Brinqueletrando Box e kits personalizados) são enviados pelos Correios: o nome e o endereço de entrega informados no pagamento são usados para a postagem e repassados aos Correios.",
    purpose:
      "Liberar e manter o acesso ao curso na Área do Aluno e enviar o e-mail para criar a senha; entregar os produtos comprados na Loja; reverter o acesso em caso de reembolso ou estorno.",
    legalBasis:
      "Execução de contrato (art. 7º, V). A Kiwify também guarda registros da venda para cumprir obrigações legais e fiscais (art. 7º, II), conforme a política dela.",
  },
  {
    id: "area-do-aluno",
    title: "Área do Aluno",
    href: "/area-do-aluno/login",
    fields: [
      "E-mail",
      "Senha (guardada apenas de forma criptografada)",
      "Cursos em que você está matriculado e a situação da matrícula",
      "Aulas que você marcou como concluídas e a data",
    ],
    status:
      "O login, a recuperação de senha e o registro do progresso usam o Supabase. Enquanto o login não estiver ativo, a página de entrada funciona só como demonstração e não guarda dados.",
    purpose: "Autenticar você, mostrar seus cursos e lembrar onde você parou.",
    legalBasis: "Execução de contrato (art. 7º, V).",
  },
  {
    id: "acesso",
    title: "Acesso ao site",
    fields: ["Dados técnicos de conexão, como endereço IP, data e hora e página acessada"],
    status:
      "Como em qualquer site, o provedor de hospedagem pode registrar esses dados para o site funcionar e se manter seguro. O site não usa ferramenta de análise de visitas.",
    purpose: "Manter o site no ar, evitar abusos e investigar falhas.",
    legalBasis: "Legítimo interesse (art. 7º, IX), limitado ao que é necessário para a segurança e o funcionamento.",
  },
];

export interface DataOperator {
  name: string;
  role: string;
  /** Dados que chegam a este fornecedor. */
  data: string;
  /** Endereço da política do fornecedor, quando confirmado. */
  policyUrl?: string;
}

/* Só fornecedores ativos ou já integrados no código. O provedor de vídeo ainda não foi integrado (docs/09). */
export const DATA_OPERATORS: readonly DataOperator[] = [
  {
    name: "Kiwify",
    role: "Plataforma de pagamento e venda dos cursos; avisa o site de cada compra.",
    data: "Dados de pagamento e de cadastro do comprador (ficam na Kiwify). O site recebe o e-mail, o número e a situação do pedido e o produto.",
  },
  {
    name: "Supabase",
    role: "Contas de acesso, banco de dados da Área do Aluno e envio dos e-mails de convite e de recuperação de senha.",
    data: "E-mail, senha criptografada, matrículas e aulas concluídas.",
  },
  {
    name: "Netlify",
    role: "Hospedagem do site e das funções de servidor.",
    data: "Dados técnicos de conexão e o conteúdo das requisições que passam pelo servidor do site (por exemplo, o login).",
  },
];

/* Resumo em linguagem simples dos direitos do art. 18 da LGPD (Lei 13.709/2018). */
export const DATA_SUBJECT_RIGHTS: readonly string[] = [
  "Confirmar se seus dados são tratados e ter acesso a eles",
  "Corrigir dados incompletos, inexatos ou desatualizados",
  "Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desacordo com a lei",
  "Pedir a portabilidade dos dados",
  "Pedir a eliminação dos dados tratados com o seu consentimento",
  "Saber com quem seus dados são compartilhados",
  "Saber que pode não dar o consentimento e o que acontece se não der",
  "Revogar o consentimento a qualquer momento",
];

export interface CookieCategory {
  id: "necessary" | "analytics" | "marketing";
  label: string;
  /** O que a categoria faz. */
  description: string;
  /** O que o site usa hoje nesta categoria. */
  today: string;
  /** Sempre ativa e sem opção de desligar. */
  required: boolean;
}

/* Usado pela política e pelo aviso de cookies: o texto fica em um lugar só.
   Hoje nenhuma ferramenta opcional é carregada; se isso mudar, atualize `today` e suba CONSENT_VERSION. */
export const COOKIE_CATEGORIES: readonly CookieCategory[] = [
  {
    id: "necessary",
    label: "Necessários",
    description: "Fazem o site funcionar e manter você conectado. Não dependem de consentimento e não podem ser desligados.",
    today:
      "Sessão de login da Área do Aluno (cookies do Supabase, com nomes que começam por “sb-”), definida quando você entra, e a lembrança da sua escolha sobre cookies, guardada no próprio navegador.",
    required: true,
  },
  {
    id: "analytics",
    label: "Medição de audiência",
    description: "Contam visitas e mostram quais páginas são mais úteis, para melhorar o site.",
    today: "Não usamos nenhuma ferramenta de medição de audiência.",
    required: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Medem anúncios e personalizam ofertas em outros sites.",
    today: "Não usamos cookies de marketing nem de publicidade.",
    required: false,
  },
];

/** Data da versão aprovada (AAAA-MM-DD); null enquanto o texto jurídico não for confirmado pela cliente. */
export const PRIVACY_UPDATED_AT: string | null = null;
