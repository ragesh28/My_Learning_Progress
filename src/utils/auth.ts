import { EncryptedPayload, PrivateBundle } from '../types';

const CONFIGURED_HASH: string = (import.meta.env.VITE_OWNER_PASSWORD_HASH || '').trim().toLowerCase();

export function isPasswordConfigured(): boolean {
  return CONFIGURED_HASH.length === 64;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyOwnerPassword(password: string): Promise<boolean> {
  if (!password) return false;
  if (!isPasswordConfigured()) {
    // Fallback only when VITE_OWNER_PASSWORD_HASH is not yet set in GitHub Secrets
    return false;
  }
  const hashed = await sha256Hex(password);
  return hashed === CONFIGURED_HASH;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPrivateBundle(
  bundle: PrivateBundle,
  password: string
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(bundle));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoded
  );
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptPrivateBundle(
  payload: EncryptedPayload,
  password: string
): Promise<PrivateBundle> {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const key = await deriveAesKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as Partial<PrivateBundle>;
  return {
    topicNotes: parsed.topicNotes || {},
    aiEntries: Array.isArray(parsed.aiEntries) ? parsed.aiEntries : [],
  };
}
