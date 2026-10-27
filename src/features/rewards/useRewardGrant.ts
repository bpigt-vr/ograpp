import { useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { toDayKey } from '@/lib/date';
import type { AwardOptions, RewardEventType, RewardStats } from './engine';
import { useRewardsStore } from './useRewardsStore';

/** Snapshot of everything the reward engine is allowed to look at. */
export function collectRewardStats(): RewardStats {
  const journal = useJournalStore.getState();
  const library = useLibraryStore.getState();
  const community = useCommunityStore.getState();
  const userId = useAuthStore.getState().account?.id ?? 'guest';
  const days = Object.keys(journal.entries);
  const streak = summarizeStreak(days, toDayKey());

  return {
    journalStreak: streak.current,
    journalEntries: days.length,
    listens: library.completedListens,
    pollVotes: Object.keys(community.votes).length,
    communityPosts: community.posts.filter(
      (post) => post.authorId === userId && !post.authorIsArtist && !post.hidden
    ).length,
    goalsCompleted: journal.goals.filter((goal) => goal.completedAt).length,
    purchases: 0,
  };
}

export type GrantOutcome = {
  awarded: number;
  status: 'awarded' | 'daily-cap' | 'duplicate' | 'ineligible';
  message: string;
  unlockedBadges: { id: string; name: string }[];
};

/**
 * Grants points, evaluates badges and surfaces the result as a toast. Every
 * screen uses this path so caps, idempotency and badge checks behave the same.
 */
export function useRewardGrant(): (type: RewardEventType, options?: AwardOptions) => GrantOutcome {
  const grant = useRewardsStore((state) => state.grant);
  const toast = useToast();
  return useCallback(
    (type, options) => {
      const result = grant(type, collectRewardStats(), options);
      if (result.status === 'awarded') {
        toast.show(result.message, 'reward');
      }
      return {
        awarded: result.awarded,
        status: result.status,
        message: result.message,
        unlockedBadges: result.unlockedBadges.map((badge) => ({ id: badge.id, name: badge.name })),
      };
    },
    [grant, toast]
  );
}
