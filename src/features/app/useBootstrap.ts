import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { DEFAULT_MODERATION_PASSPHRASE } from '@/features/moderation/config';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { toDayKey } from '@/lib/date';

type PersistApi = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (callback: () => void) => () => void;
  };
};

/** Waits for zustand's async AsyncStorage rehydration before touching state. */
function waitForHydration(store: PersistApi, timeoutMs = 3_000): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve();
    };
    const unsubscribe = store.persist.onFinishHydration(finish);
    setTimeout(finish, timeoutMs);
  });
}

/**
 * One-time bootstrap: hydrate persisted stores, seed content, decrypt the
 * journal and provision the moderator gate. Runs once per launch and never
 * blocks the app from opening.
 */
export function useBootstrap(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await Promise.all([
          waitForHydration(useAuthStore),
          waitForHydration(useCommunityStore),
          waitForHydration(useJournalStore),
          waitForHydration(useRewardsStore),
          waitForHydration(useLibraryStore),
        ]);

        useCommunityStore.getState().seedIfEmpty();
        await useCommunityStore.getState().ensurePassphrase(DEFAULT_MODERATION_PASSPHRASE);
        if (!useJournalStore.getState().unlocked) {
          await useJournalStore.getState().unlock();
        }

        const today = toDayKey();
        const result = useRewardsStore.getState().grant(
          'daily-visit',
          {
            journalStreak: 0,
            journalEntries: 0,
            listens: 0,
            pollVotes: 0,
            communityPosts: 0,
            goalsCompleted: 0,
            purchases: 0,
          },
          { key: today }
        );
        void result;
      } catch {
        // Bootstrap must never block the app from opening.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return { ready };
}
