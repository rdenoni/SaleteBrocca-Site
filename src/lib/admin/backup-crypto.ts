import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export interface EncryptedBackupEnvelope {
  format: "salete-brocca-backup-v1";
  algorithm: "aes-256-gcm";
  instanceFingerprint: string;
  createdAt: string;
  ivBase64: string;
  authTagBase64: string;
  ciphertextBase64: string;
  sha256: string;
}

function getInstanceKeyAndFingerprint(secretOverride?: string): { key: Buffer; fingerprint: string } {
  const secret = (secretOverride ?? process.env.BACKUP_ENCRYPTION_KEY)?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("BACKUP_ENCRYPTION_KEY não está configurada (configure em Variáveis & Chaves ou na Netlify).");
  }
  const instanceSalt = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "local-instance";
  const key = createHash("sha256").update(`${secret}::${instanceSalt}`).digest();
  const fingerprint = createHash("sha256").update(`fp::${instanceSalt}`).digest("hex").slice(0, 16);
  return { key, fingerprint };
}

export function encryptBackupPayload(plaintextJson: string, secretOverride?: string): EncryptedBackupEnvelope {
  const { key, fingerprint } = getInstanceKeyAndFingerprint(secretOverride);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintextJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const sha256 = createHash("sha256").update(encrypted).digest("hex");

  return {
    format: "salete-brocca-backup-v1",
    algorithm: "aes-256-gcm",
    instanceFingerprint: fingerprint,
    createdAt: new Date().toISOString(),
    ivBase64: iv.toString("base64"),
    authTagBase64: authTag.toString("base64"),
    ciphertextBase64: encrypted.toString("base64"),
    sha256,
  };
}

export function decryptBackupPayload(envelope: EncryptedBackupEnvelope, secretOverride?: string): string {
  if (envelope.format !== "salete-brocca-backup-v1" || envelope.algorithm !== "aes-256-gcm") {
    throw new Error("Formato de arquivo de backup não suportado.");
  }
  const { key, fingerprint } = getInstanceKeyAndFingerprint(secretOverride);
  if (envelope.instanceFingerprint !== fingerprint) {
    throw new Error("Este backup pertence a outra instância e não pode ser restaurado aqui.");
  }
  const iv = Buffer.from(envelope.ivBase64, "base64");
  const authTag = Buffer.from(envelope.authTagBase64, "base64");
  const ciphertext = Buffer.from(envelope.ciphertextBase64, "base64");

  const actualHash = createHash("sha256").update(ciphertext).digest("hex");
  if (actualHash !== envelope.sha256) {
    throw new Error("Integridade do arquivo comprometida (checksum SHA-256 inválido).");
  }

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
