import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemePreference } from '@/theme';
import { StorageKeys } from '@/lib/storage';

export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  scheduledId: string | null;
};

type SettingsState = {
  themePreference: ThemePreference;
  hapticsEnabled: boolean;
  analyticsOptIn: boolean;
  reducedMotion: boolean;
  sampleCatalogueEnabled: boolean;
  reminder: ReminderSettings;
  hydrated: boolean;
  setThemePreference: (value: ThemePreference) => void;
  setHaptics: (value: boolean) => void;
  setAnalyticsOptIn: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setSampleCatalogue: (value: boolean) => void;
  updateReminder: (patch: Partial<ReminderSettings>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themePreference: 'dark',
      hapticsEnabled: true,
      analyticsOptIn: false,
      reducedMotion: false,
      sampleCatalogueEnabled: true,
      reminder: { enabled: false, hour: 20, minute: 0, scheduledId: null },
      hydrated: false,
      setThemePreference: (value) => set({ themePreference: value }),
      setHaptics: (value) => set({ hapticsEnabled: value }),
      setAnalyticsOptIn: (value) => set({ analyticsOptIn: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setSampleCatalogue: (value) => set({ sampleCatalogueEnabled: value }),
      updateReminder: (patch) => set({ reminder: { ...get().reminder, ...patch } }),
    }),
    {
      name: StorageKeys.settings,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        themePreference,
        hapticsEnabled,
        analyticsOptIn,
        reducedMotion,
        sampleCatalogueEnabled,
        reminder,
      }) => ({
        themePreference,
        hapticsEnabled,
        analyticsOptIn,
        reducedMotion,
        sampleCatalogueEnabled,
        reminder,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
