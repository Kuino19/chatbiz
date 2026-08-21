import crypto from "crypto";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.AUTH_SECRET || "chatbiz-default-secret-salt-key-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive credentials (like Meta WhatsApp Access Tokens) at rest using AES-256-GCM.
 */
export function encryptToken(plainText: string | null | undefined): string | null {
  if (!plainText) return null;
  // If already encrypted, don't double-encrypt
  if (plainText.startsWith("enc:v1:")) return plainText;

  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `enc:v1:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts sensitive credentials. If the input is unencrypted (legacy plaintext), it returns it as-is.
 */
export function decryptToken(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;

  if (!encryptedText.startsWith("enc:v1:")) {
    // Backwards compatible with legacy unencrypted tokens
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 5) {
      throw new Error("Invalid encrypted token format");
    }

    const ivHex = parts[2];
    const authTagHex = parts[3];
    const encryptedDataHex = parts[4];

    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedDataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt token:", err);
    return null;
  }
}
