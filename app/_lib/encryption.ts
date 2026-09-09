import "server-only";
import crypto from "crypto";

/**
 * Field-level encryption for sensitive user content (task titles/descriptions,
 * note titles/content).
 *
 * Notes are stored using AES-256-GCM, an authenticated cipher, so data can't
 * be tampered with without detection. Each value gets its own random IV so
 * two identical values never produce the same ciphertext.
 *
 * Ciphertext is stored as a single string:
 *   "enc:v1:<ivBase64>:<authTagBase64>:<ciphertextBase64>"
 *
 * Any value that does NOT start with the "enc:v1:" prefix is treated as
 * legacy plaintext (data written before this feature existed) and is
 * returned as-is when decrypting. This keeps old tasks/notes readable
 * without requiring a backfill migration, while everything written from now
 * on is encrypted at rest.
 *
 * This intentionally only covers the free-text fields a user types
 * (task title/description, note title/content). It is NOT applied to
 * workouts or other structured data.
 */

const ALGORITHM = "aes-256-gcm";
const ENC_PREFIX = "enc:v1:";
const IV_LENGTH = 12; // 96-bit IV, recommended for GCM

let cachedKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;

  const rawKey = process.env.DATA_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error(
      "DATA_ENCRYPTION_KEY environment variable is not set. It is required to encrypt/decrypt task and note content.",
    );
  }

  // Accept either a 64-char hex string or a base64 string that decodes to 32 bytes.
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    key = Buffer.from(rawKey, "hex");
  } else {
    key = Buffer.from(rawKey, "base64");
  }

  if (key.length !== 32) {
    throw new Error(
      "DATA_ENCRYPTION_KEY must decode to exactly 32 bytes (a 64-char hex string or base64-encoded 32-byte key).",
    );
  }

  cachedKey = key;
  return key;
}

/**
 * Encrypts a plaintext string for storage. Returns `undefined`/`""` unchanged
 * so optional fields don't get coerced into encrypted empty blobs.
 */
export function encryptField(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (value === "") return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENC_PREFIX}${iv.toString("base64")}:${authTag.toString(
    "base64",
  )}:${ciphertext.toString("base64")}`;
}

/**
 * Decrypts a value previously produced by `encryptField`. Values that aren't
 * in the encrypted format (legacy plaintext) are returned unchanged.
 */
export function decryptField<T extends string | undefined | null>(value: T): T {
  if (value === undefined || value === null || value === "") return value;
  if (typeof value !== "string" || !value.startsWith(ENC_PREFIX)) {
    // Legacy plaintext (written before encryption was introduced) or a
    // non-string/unexpected value - return as-is.
    return value;
  }

  try {
    const key = getEncryptionKey();
    const payload = value.slice(ENC_PREFIX.length);
    const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
      console.error("Malformed encrypted field, returning as-is.");
      return value;
    }

    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const ciphertext = Buffer.from(ciphertextB64, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext.toString("utf8") as T;
  } catch (error) {
    console.error("Failed to decrypt field:", error);
    // Fail closed-ish: don't throw and break the whole request, but don't
    // leak raw ciphertext as if it were readable text either.
    return "[Unable to decrypt]" as T;
  }
}
