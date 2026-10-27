import {
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  deriveKey,
  isSealed,
  open,
  safeEqual,
  seal,
  utf8ToBytes,
} from '../crypto';

const key = new Uint8Array(32).fill(7);
const iv = new Uint8Array(12).fill(3);

describe('base64 helpers', () => {
  it('round-trips byte arrays of every length modulo 3', () => {
    for (let length = 0; length < 12; length += 1) {
      const bytes = new Uint8Array(length).map((_, index) => (index * 37) % 256);
      expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
    }
  });

  it('round-trips utf8 text', () => {
    const text = 'Overgrowth Renaissance — été 🔥';
    expect(bytesToUtf8(utf8ToBytes(text))).toBe(text);
  });
});

describe('AES-256-GCM sealing', () => {
  it('seals and opens payloads', () => {
    const payload = JSON.stringify({ prompt: 'Be the greatest you can be.', mood: 4 });
    const sealed = seal(key, iv, payload);
    expect(isSealed(sealed)).toBe(true);
    expect(sealed).not.toContain('greatest');
    expect(open(key, sealed)).toBe(payload);
  });

  it('produces different ciphertext for the same plaintext with different IVs', () => {
    const a = seal(key, iv, 'same');
    const b = seal(key, new Uint8Array(12).fill(9), 'same');
    expect(a).not.toBe(b);
  });

  it('fails closed with the wrong key or tampered data', () => {
    const sealed = seal(key, iv, 'private journal');
    expect(() => open(new Uint8Array(32).fill(1), sealed)).toThrow();
    expect(() => open(key, `${sealed.slice(0, -4)}AAAA`)).toThrow();
    expect(() => open(key, 'nonsense')).toThrow();
  });

  it('derives stable keys for the same passphrase and salt', async () => {
    const salt = bytesToBase64(new Uint8Array(16).fill(5));
    const a = await deriveKey('Nekkcity1', salt, 1_000);
    const b = await deriveKey('Nekkcity1', salt, 1_000);
    const c = await deriveKey('wrong', salt, 1_000);
    expect(bytesToBase64(a)).toBe(bytesToBase64(b));
    expect(bytesToBase64(a)).not.toBe(bytesToBase64(c));
    expect(a).toHaveLength(32);
  });

  it('compares secrets in constant time', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });
});
