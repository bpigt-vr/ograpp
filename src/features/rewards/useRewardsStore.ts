import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BADGES } from '@/data/badges';
import { StorageKeys } from '@/lib/storage';
import {
  awardPoints,
  EMPTY_REWARD_STATE,
  evaluateBadges,
  spendPoints,
  type AwardOptions,
  type RewardEventType,
  type RewardState,
  type RewardStats,
} from './engine';

export type GrantResult = {
  awarded: number;
  status: 'awarded' | 'daily-cap' | 'duplicate' | 'ineligible';
  message: string;
  unlockedBadges: typeof BADGES;
};

type RewardStoreState = {
  state: RewardState;
  unlockedWallpapers: string[];
  hydrated: boolean;
  grant: (type: RewardEventType, stats: RewardStats, options?: AwardOptions) => GrantResult;
  redeemWallpaper: (id: string, cost: number) => { ok: boolean; error?: string };
  reset: () => void;
};

function normalise(state?: Partial<RewardState> | null): RewardState {
  return { ...EMPTY_REWARD_STATE, ...(state ?? {}), unlockedWallpaperIds: state?.unlockedWallpaperIds ?? [] };
}

export const useRewardsStore = create<RewardStoreState>()(
  persist(
    (set, get) => ({
      state: EMPTY_REWARD_STATE,
      unlockedWallpapers: [],
      hydrated: false,

      grant(type, stats, options = {}) {
        const award = awardPoints(normalise(get().state), type, options);
        if (award.status !== 'awarded') {
          return {
            awarded: 0,
            status: award.status,
            message: award.message,
            unlockedBadges: [],
          };
        }
        const evaluation = evaluateBadges(award.state, stats);
        set({ state: evaluation.state });
        const badgeNote =
          evaluation.unlocked.length > 0
            ? ` · ${evaluation.unlocked.map((badge) => `${badge.name} badge`).join(', ')}`
            : '';
        return {
          awarded: award.awarded + evaluation.unlocked.reduce((sum, b) => sum + b.pointsOnUnlock, 0),
          status: 'awarded',
          message: `${award.message}${badgeNote}`,
          unlockedBadges: evaluation.unlocked,
        };
      },

      redeemWallpaper(id, cost) {
        const current = normalise(get().state);
        if (cost === 0 && !current.unlockedWallpaperIds.includes(id)) {
          set({
            state: {
              ...current,
              unlockedWallpaperIds: [...current.unlockedWallpaperIds, id],
            },
          });
          return { ok: true };
        }
        const result = spendPoints(current, cost, id);
        if (!result.ok) {
          return {
            ok: false,
            error:
              current.points < cost
                ? `You need ${cost - current.points} more points for this wallpaper.`
                : 'This wallpaper is already in your collection.',
          };
        }
        set({ state: result.state });
        return { ok: true };
      },

      reset() {
        set({ state: EMPTY_REWARD_STATE });
      },
    }),
    {
      name: StorageKeys.rewards,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ state }) => ({ state: normalise(state) }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.hydrated = true;
        state.state = normalise(state.state);
      },
    }
  )
);
