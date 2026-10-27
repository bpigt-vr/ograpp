/**
 * Pure crypto helpers used for journal encryption and admin passphrases.
 *
 * Keeping these free of native imports lets the whole journal/privacy story be
 * unit tested in Node. Randomness and key storage live in `vault.ts`.
 */
import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

const SEALED_PREFIX = 'ogrv1';
const AAD = new TextEncoder().encode('overgrowth-renaissance/journal');
const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    const triple = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    output += B64_ALPHABET[(triple >> 18) & 63];
    output += B64_ALPHABET[(triple >> 12) & 63];
    output += b === undefined ? '=' : B64_ALPHABET[(triple >> 6) & 63];
    output += c === undefined ? '=' : B64_ALPHABET[triple & 63];
  }
  return output;
}

export function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let byteIndex = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = (B64_ALPHABET.indexOf(clean[i]) << 18) |
      (B64_ALPHABET.indexOf(clean[i + 1] ?? 'A') << 12) |
      (B64_ALPHABET.indexOf(clean[i + 2] ?? 'A') << 6) |
      B64_ALPHABET.indexOf(clean[i + 3] ?? 'A');
    if (byteIndex < bytes.length) bytes[byteIndex++] = (chunk >> 16) & 255;
    if (byteIndex < bytes.length) bytes[byteIndex++] = (chunk >> 8) & 255;
    if (byteIndex < bytes.length) bytes[byteIndex++] = chunk & 255;
  }
  return bytes;
}

export async function deriveKey(
  secret: string,
  saltBase64: string,
  iterations = 120_000
): Promise<Uint8Array> {
  return pbkdf2Async(sha256, utf8ToBytes(secret), base64ToBytes(saltBase64), {
    c: iterations,
    dkLen: 32,
  });
}

/** AES-256-GCM. Returns `ogrv1.<iv>.<ciphertext>` (both base64). */
export function seal(
  key: Uint8Array,
  iv: Uint8Array,
  plaintext: string
): string {
  if (iv.length !== 12) throw new Error('AES-GCM requires a 12 byte IV');
  const ciphertext = gcm(key, iv, AAD).encrypt(utf8ToBytes(plaintext));
  return `${SEALED_PREFIX}.${bytesToBase64(iv)}.${bytesToBase64(ciphertext)}`;
}

export function open(key: Uint8Array, sealed: string): string {
  const [prefix, iv, ciphertext] = sealed.split('.');
  if (prefix !== SEALED_PREFIX || !iv || !ciphertext) {
    throw new Error('Unsupported sealed payload');
  }
  const plaintext = gcm(key, base64ToBytes(iv), AAD).decrypt(base64ToBytes(ciphertext));
  return bytesToUtf8(plaintext);
}

export function isSealed(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(`${SEALED_PREFIX}.`);
}

/** Constant-time-ish comparison for derived hashes. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
