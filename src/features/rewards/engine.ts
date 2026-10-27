import { BADGES, LEVELS, type Badge } from '@/data/badges';
import { toDayKey } from '@/lib/date';

/**
 * Rewards engine.
 *
 * Rules are data-driven and every award passes through the same guards:
 *  - idempotency keys (a poll pays once, a track only once a day)
 *  - per-type daily caps (no grinding)
 *  - purchase rewards require a verified order, never a raw cart total
 *
 * The engine is pure: it receives state + event and returns new state.
 */
export type RewardEventType =
  | 'journal-entry'
  | 'listen'
  | 'poll-vote'
  | 'post'
  | 'comment'
  | 'goal-complete'
  | 'challenge-complete'
  | 'purchase-verified'
  | 'profile-complete'
  | 'badge-unlock'
  | 'membership-support'
  | 'daily-visit';

export type RewardRule = {
  type: RewardEventType;
  label: string;
  points: number;
  dailyCap: number;
  description: string;
};

export const REWARD_RULES: Record<RewardEventType, RewardRule> = {
  'journal-entry': {
    type: 'journal-entry',
    label: 'Daily reflection',
    points: 20,
    dailyCap: 20,
    description: 'Write today’s journal entry.',
  },
  listen: {
    type: 'listen',
    label: 'Listen through',
    points: 5,
    dailyCap: 25,
    description: 'Finish 80% of a track, up to five tracks a day.',
  },
  'poll-vote': {
    type: 'poll-vote',
    label: 'Community poll',
    points: 10,
    dailyCap: 10,
    description: 'One vote per poll. Opinions are not farmable.',
  },
  post: {
    type: 'post',
    label: 'Start a discussion',
    points: 8,
    dailyCap: 24,
    description: 'Post something worth replying to. Three a day max.',
  },
  comment: {
    type: 'comment',
    label: 'Reply',
    points: 3,
    dailyCap: 15,
    description: 'Reply to a thread. Five a day max.',
  },
  'goal-complete': {
    type: 'goal-complete',
    label: 'Goal complete',
    points: 30,
    dailyCap: 60,
    description: 'Finish a personal goal you set for yourself.',
  },
  'challenge-complete': {
    type: 'challenge-complete',
    label: 'Community challenge',
    points: 50,
    dailyCap: 100,
    description: 'Complete an artist-approved challenge.',
  },
  'purchase-verified': {
    type: 'purchase-verified',
    label: 'Store support',
    points: 0,
    dailyCap: 500,
    description: 'Verified store orders earn 1 point per $1 spent.',
  },
  'profile-complete': {
    type: 'profile-complete',
    label: 'Set up your profile',
    points: 15,
    dailyCap: 15,
    description: 'Add a display name and avatar to your profile.',
  },
  'badge-unlock': {
    type: 'badge-unlock',
    label: 'Badge unlocked',
    points: 0,
    dailyCap: 1_000,
    description: 'Bonus points attached to each badge.',
  },
  'membership-support': {
    type: 'membership-support',
    label: 'Member support',
    points: 100,
    dailyCap: 100,
    description: 'Awarded once when a membership is verified.',
  },
  'daily-visit': {
    type: 'daily-visit',
    label: 'Show up',
    points: 2,
    dailyCap: 2,
    description: 'Open the app and check in.',
  },
};

export type LedgerEntry = {
  id: string;
  type: RewardEventType;
  points: number;
  at: number;
  dayKey: string;
  note?: string;
};

export type RewardState = {
  points: number;
  lifetimePoints: number;
  ledger: LedgerEntry[];
  counters: Record<string, Partial<Record<RewardEventType, number>>>;
  seenKeys: string[];
  unlockedBadgeIds: string[];
};
export type AwardResult = {
  state: RewardState;
  awarded: number;
  status: 'awarded' | 'daily-cap' | 'duplicate' | 'ineligible';
  unlockedBadges: Badge[];
  message: string;
};

export type AwardOptions = {
  now?: number;
  key?: string;
  /** Verified order for purchase rewards (id + total). */
  verifiedOrder?: { id: string; totalCents: number };
  note?: string;
};

export function awardPoints(
  state: RewardState,
  type: RewardEventType,
  options: AwardOptions = {}
): AwardResult {
  const now = options.now ?? Date.now();
  const dayKey = toDayKey(new Date(now));
  const rule = REWARD_RULES[type];

  if (type === 'purchase-verified' && !options.verifiedOrder) {
    return {
      state,
      awarded: 0,
      status: 'ineligible',
      unlockedBadges: [],
      message: 'Purchases earn rewards only once the store order is verified.',
    };
  }

  const idempotencyKey = options.key ? `${type}:${options.key}` : null;
  if (idempotencyKey && state.seenKeys.includes(idempotencyKey)) {
    return {
      state,
      awarded: 0,
      status: 'duplicate',
      unlockedBadges: [],
      message: 'Already counted — no double dipping.',
    };
  }

  const earnedToday = state.counters[dayKey]?.[type] ?? 0;
  const points =
    type === 'purchase-verified'
      ? Math.floor((options.verifiedOrder?.totalCents ?? 0) / 100)
      : rule.points;

  if (points <= 0) {
    return {
      state,
      awarded: 0,
      status: 'ineligible',
      unlockedBadges: [],
      message: 'Nothing to award for this action yet.',
    };
  }

  if (rule.dailyCap > 0 && earnedToday + points > rule.dailyCap) {
    return {
      state,
      awarded: 0,
      status: 'daily-cap',
      unlockedBadges: [],
      message: 'Daily limit reached for this action. It resets tomorrow.',
    };
  }

  const nextState: RewardState = {
    ...state,
    points: state.points + points,
    lifetimePoints: state.lifetimePoints + points,
    ledger: [
      {
        id: `${now}-${type}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        points,
        at: now,
        dayKey,
        note: options.note,
      },
      ...state.ledger,
    ].slice(0, 250),
    counters: {
      ...state.counters,
      [dayKey]: { ...state.counters[dayKey], [type]: earnedToday + points },
    },
    seenKeys: idempotencyKey ? [...state.seenKeys, idempotencyKey].slice(-600) : state.seenKeys,
  };

  return {
    state: nextState,
    awarded: points,
    status: 'awarded',
    unlockedBadges: [],
    message: `+${points} points`,
  };
}

export function levelProgress(points: number): {
  level: number;
  name: string;
  currentFloor: number;
  nextFloor: number | null;
  nextName: string | null;
  progress: number;
} {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (points >= LEVELS[i].minPoints) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.minPoints - current.minPoints : 0;
  return {
    level: current.level,
    name: current.name,
    currentFloor: current.minPoints,
    nextFloor: next?.minPoints ?? null,
    nextName: next?.name ?? null,
    progress: next ? Math.min(1, Math.max(0, (points - current.minPoints) / span)) : 1,
  };
}

function metricValue(metric: Badge['metric'], stats: RewardStats, points: number): number {
  switch (metric) {
    case 'points':
      return points;
    case 'journalStreak':
      return stats.journalStreak;
    case 'journalEntries':
      return stats.journalEntries;
    case 'listens':
      return stats.listens;
    case 'pollVotes':
      return stats.pollVotes;
    case 'communityPosts':
      return stats.communityPosts;
    case 'goalsCompleted':
      return stats.goalsCompleted;
    case 'purchases':
      return stats.purchases;
  }
}

export function badgeProgress(badge: Badge, stats: RewardStats, points: number): number {
  const value = metricValue(badge.metric, stats, points);
  return Math.min(1, badge.target === 0 ? 1 : value / badge.target);
}

export function evaluateBadges(
  state: RewardState,
  stats: RewardStats
): { unlocked: Badge[]; state: RewardState } {
  const unlocked: Badge[] = [];
  let next = state;
  for (const badge of BADGES) {
    if (next.unlockedBadgeIds.includes(badge.id)) continue;
    if (badgeProgress(badge, stats, next.lifetimePoints) >= 1) {
      unlocked.push(badge);
      next = {
        ...next,
        unlockedBadgeIds: [...next.unlockedBadgeIds, badge.id],
        points: next.points + badge.pointsOnUnlock,
        lifetimePoints: next.lifetimePoints + badge.pointsOnUnlock,
      };
    }
  }
  return { unlocked, state: next };
}

export function totalMetric(stats: RewardStats): number {
  return (
    stats.journalEntries +
    stats.listens +
    stats.pollVotes +
    stats.communityPosts +
    stats.goalsCompleted
  );
}


export type RewardStats = {
  journalStreak: number;
  journalEntries: number;
  listens: number;
  pollVotes: number;
  communityPosts: number;
  goalsCompleted: number;
  purchases: number;
};

export const EMPTY_REWARD_STATE: RewardState = {
  points: 0,
  lifetimePoints: 0,
  ledger: [],
  counters: {},
  seenKeys: [],
  unlockedBadgeIds: [],
};
