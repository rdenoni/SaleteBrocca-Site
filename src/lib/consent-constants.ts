/* Constantes do consentimento de cookies, sem nenhuma dependência: o playwright.config.ts importa este arquivo
   (caminho relativo) para pré-aceitar o aviso nos testes, então chave e versão não podem divergir do site. */

/** Chave do localStorage com a escolha da pessoa. */
export const CONSENT_STORAGE_KEY = "sb-cookie-consent";

/** Sobe quando as categorias ou o uso dos cookies mudam: quem escolheu numa versão antiga volta a ser perguntado. */
export const CONSENT_VERSION = 1;

/** Disparado em `window` sempre que a escolha é salva (detail = registro salvo). */
export const CONSENT_CHANGE_EVENT = "consentchange";

/** Disparado em `window` para reabrir o painel de preferências (botão do rodapé e da política de privacidade). */
export const CONSENT_OPEN_EVENT = "consentopen";
