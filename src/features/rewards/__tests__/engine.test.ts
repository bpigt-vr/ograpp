import {
  awardPoints,
  badgeProgress,
  EMPTY_REWARD_STATE,
  evaluateBadges,
  levelProgress,
  type RewardStats,
} from '../engine';
import { BADGES } from '@/data/badges';

const emptyStats: RewardStats = {
  journalStreak: 0,
  journalEntries: 0,
  listens: 0,
  pollVotes: 0,
  communityPosts: 0,
  goalsCompleted: 0,
  purchases: 0,
};

const NOON = new Date(2026, 9, 27, 12, 0, 0).getTime();

describe('rewards engine', () => {
  it('awards points for a journal entry', () => {
    const result = awardPoints(EMPTY_REWARD_STATE, 'journal-entry', { now: NOON });
    expect(result.status).toBe('awarded');
    expect(result.awarded).toBe(20);
    expect(result.state.points).toBe(20);
    expect(result.state.ledger[0].dayKey).toBe('2026-10-27');
  });

  it('does not pay twice for the same idempotency key', () => {
    const first = awardPoints(EMPTY_REWARD_STATE, 'poll-vote', { now: NOON, key: 'poll-1' });
    const second = awardPoints(first.state, 'poll-vote', { now: NOON, key: 'poll-1' });
    expect(second.status).toBe('duplicate');
    expect(second.awarded).toBe(0);
    expect(second.state.points).toBe(10);
  });

  it('respects daily caps for listening', () => {
    let state = EMPTY_REWARD_STATE;
    for (let i = 0; i < 5; i += 1) {
      state = awardPoints(state, 'listen', { now: NOON, key: `track-${i}` }).state;
    }
    expect(state.points).toBe(25);
    const extra = awardPoints(state, 'listen', { now: NOON, key: 'track-6' });
    expect(extra.status).toBe('daily-cap');
    expect(extra.state.points).toBe(25);
  });

  it('requires a verified order before purchase points', () => {
    const unverified = awardPoints(EMPTY_REWARD_STATE, 'purchase-verified', { now: NOON });
    expect(unverified.status).toBe('ineligible');
    const verified = awardPoints(EMPTY_REWARD_STATE, 'purchase-verified', {
      now: NOON,
      verifiedOrder: { id: 'order-1', totalCents: 4_500 },
    });
    expect(verified.awarded).toBe(45);
  });

  it('unlocks badges once and adds their bonus points', () => {
    const state = { ...EMPTY_REWARD_STATE, points: 20, lifetimePoints: 20 };
    const first = evaluateBadges(state, { ...emptyStats, journalEntries: 1 });
    expect(first.unlocked.map((badge) => badge.id)).toEqual(['first-light']);
    expect(first.state.points).toBe(45);
    const second = evaluateBadges(first.state, { ...emptyStats, journalEntries: 4 });
    expect(second.unlocked).toHaveLength(0);
  });

  it('reports badge and level progress', () => {
    const streakBadge = BADGES.find((badge) => badge.id === 'seven-days')!;
    expect(badgeProgress(streakBadge, { ...emptyStats, journalStreak: 7 }, 0)).toBe(1);
    expect(badgeProgress(streakBadge, { ...emptyStats, journalStreak: 3 }, 0)).toBeCloseTo(3 / 7);
    expect(levelProgress(0).name).toBe('Seed');
    expect(levelProgress(900).name).toBe('Hustler');
    expect(levelProgress(900).nextName).toBe('Renaissance');
    expect(levelProgress(5_000).progress).toBe(1);
  });
});
