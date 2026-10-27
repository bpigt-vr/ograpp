/**
 * Device-bound key storage + JSON sealing.
 *
 * Journal entries and the moderation passphrase are encrypted with a random
 * 256-bit key held in the platform keystore (iOS Keychain / Android Keystore
 * through expo-secure-store). Nothing readable is written to AsyncStorage.
 *
 * Web has no secure keystore. We fall back to localStorage and show a warning
 * in the privacy screen, because a browser preview is not a secure vault.
 */
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  base64ToBytes,
  bytesToBase64,
  deriveKey,
  isSealed,
  open,
  safeEqual,
  seal,
  utf8ToBytes,
} from './crypto';
import { storage } from './storage';

const DEVICE_KEY_ID = 'ogr.vault.deviceKey';
const WEB_KEY_ENTRY = 'ogr.vault.deviceKey.web';

let cachedKey: Uint8Array | null = null;

function randomB64(byteLength: number): string {
  return bytesToBase64(getRandomBytes(byteLength));
}

async function readSecret(id: string): Promise<string | null> {
  if (Platform.OS === 'web') return storage.getRaw(WEB_KEY_ENTRY);
  try {
    return await SecureStore.getItemAsync(id);
  } catch {
    return null;
  }
}

async function writeSecret(id: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await storage.setRaw(WEB_KEY_ENTRY, value);
    return;
  }
  await SecureStore.setItemAsync(id, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getDeviceKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  let stored = await readSecret(DEVICE_KEY_ID);
  if (!stored) {
    stored = randomB64(32);
    await writeSecret(DEVICE_KEY_ID, stored);
  }
  cachedKey = base64ToBytes(stored);
  return cachedKey;
}

export function isSecureVaultAvailable(): boolean {
  return Platform.OS !== 'web';
}

export async function sealJSON(value: unknown): Promise<string> {
  const key = await getDeviceKey();
  return seal(key, getRandomBytes(12), JSON.stringify(value));
}

export async function openJSON<T>(sealed: string): Promise<T | null> {
  try {
    const key = await getDeviceKey();
    return JSON.parse(open(key, sealed)) as T;
  } catch {
    return null;
  }
}

export async function sealString(value: string): Promise<string> {
  const key = await getDeviceKey();
  return seal(key, getRandomBytes(12), value);
}

export async function openString(sealed: string): Promise<string | null> {
  try {
    const key = await getDeviceKey();
    return open(key, sealed);
  } catch {
    return null;
  }
}

/** Passphrase hashing for the local account and the moderation gate. */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = randomB64(16);
  const derived = await deriveKey(passphrase.trim(), salt, 150_000);
  return `pbkdf2$150000$${salt}$${bytesToBase64(derived)}`;
}

export async function verifyPassphrase(passphrase: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false;
  const derived = await deriveKey(passphrase.trim(), salt, Number.parseInt(iterations, 10));
  return safeEqual(bytesToBase64(derived), hash);
}

export { isSealed, utf8ToBytes };
