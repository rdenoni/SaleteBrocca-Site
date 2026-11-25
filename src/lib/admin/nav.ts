export type AdminNavIcon =
  | "layout-dashboard"
  | "image"
  | "link"
  | "file-text"
  | "users"
  | "user-plus"
  | "wallet"
  | "target"
  | "life-buoy"
  | "activity"
  | "video"
  | "hard-drive"
  | "bar-chart"
  | "shield-check"
  | "mail";

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: AdminNavIcon;
  stage: number;
  ready: boolean;
  description: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: readonly AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  {
    id: "geral",
    label: "Visão Geral",
    items: [
      {
        id: "dashboard",
        label: "Painel",
        href: "/admin",
        icon: "layout-dashboard",
        stage: 0,
        ready: true,
        description: "Resumo executivo, saúde das integrações e trilha de auditoria.",
      },
    ],
  },
  {
    id: "cms",
    label: "Site e Conteúdo",
    items: [
      {
        id: "hero",
        label: "Hero & Depoimentos",
        href: "/admin/hero",
        icon: "image",
        stage: 1,
        ready: true,
        description: "Editar e adicionar fotos, vídeos e textos da Hero e depoimentos.",
      },
      {
        id: "links",
        label: "Links & Contato",
        href: "/admin/links",
        icon: "link",
        stage: 1,
        ready: true,
        description: "Alterar links das redes sociais e telefone/WhatsApp oficial.",
      },
      {
        id: "conteudo",
        label: "Artigos & Podcasts",
        href: "/admin/conteudo",
        icon: "file-text",
        stage: 2,
        ready: true,
        description: "Adicionar e editar artigos e episódios de podcast.",
      },
    ],
  },
  {
    id: "operacao",
    label: "Usuários e Operação",
    items: [
      {
        id: "usuarios",
        label: "Usuários",
        href: "/admin/usuarios",
        icon: "users",
        stage: 3,
        ready: true,
        description: "Contas, status, expiração, bloqueio, IPs, roles, backup e exclusão.",
      },
      {
        id: "cadastro",
        label: "Cadastro & Vagas",
        href: "/admin/cadastro",
        icon: "user-plus",
        stage: 3,
        ready: true,
        description: "Controle de cadastro, teto máximo de contas e vagas disponíveis.",
      },
      {
        id: "financeiro",
        label: "Financeiro",
        href: "/admin/financeiro",
        icon: "wallet",
        stage: 4,
        ready: true,
        description: "Kiwify, Hotmart, receita bruta/líquida, licenças, estornos, logs e extrato.",
      },
      {
        id: "crm",
        label: "CRM",
        href: "/admin/crm",
        icon: "target",
        stage: 5,
        ready: true,
        description: "Leads, taxa de conversão, busca por nome, e-mail, WhatsApp e tags.",
      },
      {
        id: "suporte",
        label: "Suporte",
        href: "/admin/suporte",
        icon: "life-buoy",
        stage: 6,
        ready: true,
        description: "Tickets abertos, respondidos e encerrados com busca e filtros.",
      },
      {
        id: "emails",
        label: "ADM E-mails",
        href: "/admin/emails",
        icon: "mail",
        stage: 10,
        ready: true,
        description: "Verificar e responder e-mails diretamente pelo painel.",
      },
    ],
  },
  {
    id: "infra",
    label: "Infraestrutura & Compliance",
    items: [
      {
        id: "sessoes",
        label: "Sessões Ativas",
        href: "/admin/sessoes",
        icon: "activity",
        stage: 7,
        ready: true,
        description: "Usuários ativos, IP, dispositivo, localização, coordenadas e atividade.",
      },
      {
        id: "stream",
        label: "Stream (Mux)",
        href: "/admin/stream",
        icon: "video",
        stage: 8,
        ready: true,
        description: "Monitoramento de uso, minutos entregues e banda pela Mux.",
      },
      {
        id: "backup",
        label: "Backup & GitHub",
        href: "/admin/backup",
        icon: "hard-drive",
        stage: 9,
        ready: true,
        description: "Exportar/importar banco criptografado AES-256-GCM e backup no GitHub.",
      },
      {
        id: "marketing",
        label: "Marketing / Analytics",
        href: "/admin/marketing",
        icon: "bar-chart",
        stage: 10,
        ready: true,
        description: "Diagnóstico Meta Pixel, CAPI e checklist automático/manual.",
      },
      {
        id: "lgpd",
        label: "LGPD",
        href: "/admin/lgpd",
        icon: "shield-check",
        stage: 10,
        ready: true,
        description: "Relatório de conformidade LGPD nos 8 pilares de segurança.",
      },
    ],
  },
];

export const ALL_ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);
