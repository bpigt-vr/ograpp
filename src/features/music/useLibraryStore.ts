import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/lib/storage';

export type DownloadRecord = {
  trackId: string;
  uri: string;
  bytes: number;
  downloadedAt: number;
};

export type ListenRecord = {
  trackId: string;
  playCount: number;
  completedCount: number;
  lastPlayedAt: number;
};

type LibraryState = {
  favoriteTrackIds: string[];
  downloads: Record<string, DownloadRecord>;
  listens: Record<string, ListenRecord>;
  recentlyPlayed: string[];
  completedListens: number;
  volume: number;
  lastTrackId: string | null;
  hydrated: boolean;
  toggleFavorite: (trackId: string) => boolean;
  isFavorite: (trackId: string) => boolean;
  saveDownload: (record: DownloadRecord) => void;
  removeDownload: (trackId: string) => void;
  recordPlay: (trackId: string) => void;
  recordCompletion: (trackId: string) => void;
  setVolume: (volume: number) => void;
  setLastTrack: (trackId: string) => void;
  clearLibrary: () => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favoriteTrackIds: [],
      downloads: {},
      listens: {},
      recentlyPlayed: [],
      completedListens: 0,
      volume: 0.9,
      lastTrackId: null,
      hydrated: false,

      toggleFavorite(trackId) {
        const has = get().favoriteTrackIds.includes(trackId);
        set({
          favoriteTrackIds: has
            ? get().favoriteTrackIds.filter((id) => id !== trackId)
            : [trackId, ...get().favoriteTrackIds],
        });
        return !has;
      },

      isFavorite(trackId) {
        return get().favoriteTrackIds.includes(trackId);
      },

      saveDownload(record) {
        set({ downloads: { ...get().downloads, [record.trackId]: record } });
      },

      removeDownload(trackId) {
        const next = { ...get().downloads };
        delete next[trackId];
        set({ downloads: next });
      },

      recordPlay(trackId) {
        const existing = get().listens[trackId];
        const nextListens = {
          ...get().listens,
          [trackId]: {
            trackId,
            playCount: (existing?.playCount ?? 0) + 1,
            completedCount: existing?.completedCount ?? 0,
            lastPlayedAt: Date.now(),
          },
        };
        set({
          listens: nextListens,
          recentlyPlayed: [trackId, ...get().recentlyPlayed.filter((id) => id !== trackId)].slice(0, 20),
          lastTrackId: trackId,
        });
      },

      recordCompletion(trackId) {
        const existing = get().listens[trackId];
        set({
          listens: {
            ...get().listens,
            [trackId]: {
              trackId,
              playCount: existing?.playCount ?? 1,
              completedCount: (existing?.completedCount ?? 0) + 1,
              lastPlayedAt: Date.now(),
            },
          },
          completedListens: get().completedListens + 1,
        });
      },

      setVolume(volume) {
        set({ volume: Math.min(1, Math.max(0, volume)) });
      },

      setLastTrack(trackId) {
        set({ lastTrackId: trackId });
      },

      clearLibrary() {
        set({
          favoriteTrackIds: [],
          downloads: {},
          listens: {},
          recentlyPlayed: [],
          completedListens: 0,
          lastTrackId: null,
        });
      },
    }),
    {
      name: StorageKeys.library,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        favoriteTrackIds,
        downloads,
        listens,
        recentlyPlayed,
        completedListens,
        volume,
        lastTrackId,
      }) => ({
        favoriteTrackIds,
        downloads,
        listens,
        recentlyPlayed,
        completedListens,
        volume,
        lastTrackId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export function useFavoriteCount(): number {
  return useLibraryStore((state) => state.favoriteTrackIds.length);
}
