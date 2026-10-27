import { addDays, daysBetween, type DayKey } from '@/lib/date';

/**
 * Streaks that do not punish real life.
 *
 * Rules (documented in-app):
 *  - A streak is the number of days you showed up, walking backwards from today.
 *  - One missed day is treated as a rest day and does not break the streak.
 *  - Every 7 days you earn another rest day for that streak.
 *  - The streak lapses only after two or more missed days in a row.
 *  - Best streak is kept for celebration, never for guilt.
 */
export type StreakSummary = {
  current: number;
  best: number;
  lastEntryDay: DayKey | null;
  restDaysUsed: number;
  isActiveToday: boolean;
  nextMilestone: number | null;
  milestones: number[];
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export function nextMilestoneFor(streak: number): number | null {
  return STREAK_MILESTONES.find((milestone) => milestone > streak) ?? null;
}

function walk(entryDays: Set<DayKey>, start: DayKey, earliest: DayKey): { length: number; rest: number } {
  let day = start;
  let length = 0;
  let rest = 0;
  let guard = 0;
  while (guard < 4_000 && daysBetween(earliest, day) >= 0) {
    guard += 1;
    if (entryDays.has(day)) {
      length += 1;
      day = addDays(day, -1);
      continue;
    }
    const restBudget = 1 + Math.floor(length / 7);
    if (length > 0 && rest < restBudget) {
      rest += 1;
      day = addDays(day, -1);
      continue;
    }
    break;
  }
  return { length, rest };
}

export function summarizeStreak(
  entryDaysInput: DayKey[],
  today: DayKey
): StreakSummary {
  const unique = [...new Set(entryDaysInput)].sort();
  if (unique.length === 0) {
    return {
      current: 0,
      best: 0,
      lastEntryDay: null,
      restDaysUsed: 0,
      isActiveToday: false,
      nextMilestone: STREAK_MILESTONES[0],
      milestones: STREAK_MILESTONES,
    };
  }

  const set = new Set(unique);
  const lastEntryDay = unique[unique.length - 1];
  const gapFromToday = daysBetween(lastEntryDay, today);
  const isActiveToday = gapFromToday === 0;

  // The streak stays alive while at most one full day has been missed.
  const currentWalk =
    gapFromToday <= 2 ? walk(set, lastEntryDay, unique[0]) : { length: 0, rest: 0 };
  const current = currentWalk.length;

  let best = 0;
  let bestRest = 0;
  for (let index = unique.length - 1; index >= 0; index -= 1) {
    const result = walk(set, unique[index], unique[0]);
    if (result.length > best) {
      best = result.length;
      bestRest = result.rest;
    }
  }

  return {
    current,
    best: Math.max(best, current),
    lastEntryDay,
    restDaysUsed: current > 0 ? currentWalk.rest : bestRest,
    isActiveToday,
    nextMilestone: nextMilestoneFor(Math.max(best, current)),
    milestones: STREAK_MILESTONES,
  };
}

export function streakMessage(summary: StreakSummary): string {
  if (summary.current === 0 && summary.best === 0) {
    return 'Start wherever you are. One entry is enough.';
  }
  if (summary.isActiveToday) {
    return summary.nextMilestone
      ? `${summary.current}-day streak. ${summary.nextMilestone - summary.current} more to the next milestone.`
      : `${summary.current}-day streak. You are building something real.`;
  }
  if (summary.current > 0) {
    return `Your ${summary.current}-day streak is still alive. Today is a good day to add to it.`;
  }
  return `Last streak: ${summary.best} days. Streaks restart — so do you.`;
}
