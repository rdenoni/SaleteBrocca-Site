import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "./consent-constants";

/* Consentimento de cookies (LGPD). Formato guardado em localStorage[CONSENT_STORAGE_KEY]:
   {"version":1,"timestamp":"2026-11-18T12:00:00.000Z","necessary":true,"analytics":false,"marketing":false}
   Para ligar uma ferramenta opcional no futuro, só carregue-a depois de `hasConsent("analytics")` ou
   `hasConsent("marketing")` e escute `onConsentChange` para reagir à escolha (ou à revogação). */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentRecord {
  version: number;
  /** Momento da escolha (ISO 8601, UTC). */
  timestamp: string;
  /** Sempre verdadeiro: sem os cookies necessários o site não funciona (login da Área do Aluno). */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

/* Se o armazenamento do navegador estiver bloqueado, a escolha vale até recarregar a página. */
let memoryRecord: ConsentRecord | null = null;

function isRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === CONSENT_VERSION &&
    typeof record.timestamp === "string" &&
    record.necessary === true &&
    typeof record.analytics === "boolean" &&
    typeof record.marketing === "boolean"
  );
}

/** Escolha salva na versão atual; null se nunca escolheu, se a versão mudou ou se o dado está inválido. */
export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed)) return parsed;
    }
  } catch {
    /* Armazenamento bloqueado ou JSON corrompido: cai para a memória. */
  }
  return memoryRecord;
}

/** Só `necessary` vale sem escolha; as demais categorias exigem consentimento explícito. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  return readConsent()?.[category] === true;
}

/** Guarda a escolha, avisa quem escuta (`consentchange`) e devolve o registro salvo. */
export function saveConsent(choice: ConsentChoice): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
  };
  memoryRecord = record;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* Sem armazenamento: a escolha fica só na memória desta visita. */
  }
  window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_CHANGE_EVENT, { detail: record }));
  return record;
}

/** Escuta mudanças da escolha. Devolve a função que cancela a inscrição. */
export function onConsentChange(listener: (record: ConsentRecord) => void): () => void {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent && isRecord(event.detail)) listener(event.detail);
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
}

/** Reabre o painel de preferências (o componente CookieConsent escuta este evento). */
export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
