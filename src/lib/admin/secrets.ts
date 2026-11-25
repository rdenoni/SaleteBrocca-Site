import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const MANAGED_INTEGRATION_KEYS = [
  {
    key: "HOTMART_WEBHOOK_TOKEN",
    group: "Financeiro (Hotmart)",
    label: "Hotmart Webhook Token (HOTTOK)",
    secret: true,
    generatable: false,
    placeholder: "Cole o HOTTOK gerado na Hotmart",
    help: "Hotmart → Ferramentas → Webhooks. Endpoint: /api/hotmart/webhook",
  },
  {
    key: "MUX_TOKEN_ID",
    group: "Stream (Mux API)",
    label: "Mux Access Token ID",
    secret: false,
    generatable: false,
    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    help: "Mux → Settings → Access Tokens (permissão de leitura em Mux Video + Mux Data).",
  },
  {
    key: "MUX_TOKEN_SECRET",
    group: "Stream (Mux API)",
    label: "Mux Access Token Secret",
    secret: true,
    generatable: false,
    placeholder: "Chave secreta do token Mux",
    help: "Gerada junto com o Token ID no painel da Mux.",
  },
  {
    key: "BACKUP_ENCRYPTION_KEY",
    group: "Backup AES-256-GCM & GitHub",
    label: "Chave de Criptografia AES-256-GCM",
    secret: true,
    generatable: true,
    placeholder: "Mínimo 32 caracteres aleatórios",
    help: "Chave exclusiva desta instância para criptografar e restaurar backups .sbbak.enc.",
  },
  {
    key: "GITHUB_BACKUP_TOKEN",
    group: "Backup AES-256-GCM & GitHub",
    label: "GitHub Fine-Grained Token (repo privado)",
    secret: true,
    generatable: false,
    placeholder: "github_pat_...",
    help: "Permissão Contents: Read & Write apenas em um repositório PRIVADO dedicado.",
  },
  {
    key: "GITHUB_BACKUP_REPO",
    group: "Backup AES-256-GCM & GitHub",
    label: "Repositório Privado de Backup",
    secret: false,
    generatable: false,
    placeholder: "rdenoni/salete-brocca-backups",
    help: "Formato dono/repositorio. Nunca use o repositório público do site.",
  },
  {
    key: "NEXT_PUBLIC_META_PIXEL_ID",
    group: "Marketing / Analytics (Meta)",
    label: "Meta Pixel ID",
    secret: false,
    generatable: false,
    placeholder: "Ex.: 123456789012345",
    help: "ID numérico do Pixel no Meta Events Manager.",
  },
  {
    key: "META_CAPI_ACCESS_TOKEN",
    group: "Marketing / Analytics (Meta)",
    label: "Meta Conversions API (CAPI) Token",
    secret: true,
    generatable: false,
    placeholder: "EAAG...",
    help: "Token de acesso da Conversions API para envio de eventos pelo servidor.",
  },
  {
    key: "RESEND_API_KEY",
    group: "ADM E-mails (Resend)",
    label: "Resend API Key",
    secret: true,
    generatable: false,
    placeholder: "re_...",
    help: "Chave da Resend com domínio saletebrocca.com verificado para responder e-mails.",
  },
  {
    key: "ADMIN_FROM_EMAIL",
    group: "ADM E-mails (Resend)",
    label: "E-mail Remetente Padrão",
    secret: false,
    generatable: false,
    placeholder: "contato@saletebrocca.com",
    help: "Endereço exibido como remetente ao responder e-mails pelo painel.",
  },
  {
    key: "ADMIN_EMAIL_INBOUND_TOKEN",
    group: "ADM E-mails (Resend)",
    label: "Token do Webhook de Entrada de E-mails",
    secret: true,
    generatable: true,
    placeholder: "Token aleatório para x-inbound-token",
    help: "Protege o endpoint /api/admin/emails/inbound contra envios não autorizados.",
  },
] as const;

export type ManagedIntegrationKey = (typeof MANAGED_INTEGRATION_KEYS)[number]["key"];

export interface IntegrationFieldStatus {
  key: ManagedIntegrationKey;
  group: string;
  label: string;
  secret: boolean;
  generatable: boolean;
  placeholder: string;
  help: string;
  source: "env" | "panel" | "none";
  preview: string;
}

const STORAGE_KEY = "integration_secrets";

function deriveMasterKey(): Buffer {
  const seed =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "salete-brocca-local-dev";
  return createHash("sha256").update(`sb-secrets-v1::${seed}`).digest();
}

export function sealSecretValue(plaintext: string): string {
  const key = deriveMasterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

function unsealSecretValue(stored: string): string {
  if (!stored.startsWith("enc:v1:")) return stored;
  const parts = stored.split(":");
  if (parts.length !== 5) return "";
  try {
    const key = deriveMasterKey();
    const iv = Buffer.from(parts[2], "base64");
    const tag = Buffer.from(parts[3], "base64");
    const enc = Buffer.from(parts[4], "base64");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

async function loadPanelSecretsMap(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return {};
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("site_settings").select("value").eq("key", STORAGE_KEY).maybeSingle();
    const raw = (data?.value ?? {}) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string" && v.trim()) {
        const plain = unsealSecretValue(v);
        if (plain) out[k] = plain;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export async function getRuntimeSecrets(
  keys?: readonly ManagedIntegrationKey[],
): Promise<Record<string, string>> {
  const panelMap = await loadPanelSecretsMap();
  const targetKeys = keys ?? MANAGED_INTEGRATION_KEYS.map((item) => item.key);
  const resolved: Record<string, string> = {};

  for (const key of targetKeys) {
    const envVal = process.env[key]?.trim();
    if (envVal) {
      resolved[key] = envVal;
    } else if (panelMap[key]) {
      resolved[key] = panelMap[key];
    }
  }
  return resolved;
}

export async function getRuntimeSecret(key: ManagedIntegrationKey): Promise<string> {
  const envVal = process.env[key]?.trim();
  if (envVal) return envVal;
  const panelMap = await loadPanelSecretsMap();
  return panelMap[key] ?? "";
}

function maskValue(value: string, isSecret: boolean): string {
  if (!value) return "";
  if (!isSecret) return value;
  if (value.length <= 6) return "••••••";
  return `••••••••${value.slice(-4)}`;
}

export async function getIntegrationFieldsStatus(): Promise<readonly IntegrationFieldStatus[]> {
  const panelMap = await loadPanelSecretsMap();
  return MANAGED_INTEGRATION_KEYS.map((item) => {
    const envVal = process.env[item.key]?.trim() ?? "";
    const panelVal = panelMap[item.key] ?? "";
    const source = envVal ? "env" : panelVal ? "panel" : "none";
    const activeVal = envVal || panelVal;
    return {
      key: item.key,
      group: item.group,
      label: item.label,
      secret: item.secret,
      generatable: item.generatable,
      placeholder: item.placeholder,
      help: item.help,
      source,
      preview: maskValue(activeVal, item.secret),
    };
  });
}
