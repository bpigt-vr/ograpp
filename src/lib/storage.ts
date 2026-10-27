import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Small wrapper so every store shares the same failure behaviour: a broken
 * write should degrade to an in-memory session instead of crashing the app.
 */
export const storage = {
  async getRaw(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setRaw(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Storage full / unavailable: keep going with in-memory state.
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await storage.getRaw(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setJSON(key: string, value: unknown): Promise<void> {
    await storage.setRaw(key, JSON.stringify(value));
  },
  async keys(): Promise<string[]> {
    try {
      return [...(await AsyncStorage.getAllKeys())];
    } catch {
      return [];
    }
  },
  async clearAppData(): Promise<void> {
    const keys = await storage.keys();
    const ours = keys.filter((key) => key.startsWith('ogr.') || key.startsWith('ph:'));
    try {
      await AsyncStorage.multiRemove(ours);
    } catch {
      // Ignore.
    }
  },
};

export const StorageKeys = {
  auth: 'ogr.auth',
  library: 'ogr.library',
  journal: 'ogr.journal',
  cart: 'ogr.cart',
  community: 'ogr.community',
  rewards: 'ogr.rewards',
  settings: 'ogr.settings',
  player: 'ogr.player',
  moderation: 'ogr.moderation',
  onboarding: 'ogr.onboarding',
} as const;
