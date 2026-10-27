import { randomUUID } from 'expo-crypto';

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function shortCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
