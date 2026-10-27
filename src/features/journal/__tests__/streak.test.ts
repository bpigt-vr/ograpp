import { summarizeStreak, nextMilestoneFor, streakMessage } from '../streak';

describe('journal streaks', () => {
  it('counts consecutive days', () => {
    const summary = summarizeStreak(['2026-10-25', '2026-10-26', '2026-10-27'], '2026-10-27');
    expect(summary.current).toBe(3);
    expect(summary.isActiveToday).toBe(true);
    expect(summary.lastEntryDay).toBe('2026-10-27');
  });

  it('treats a single missed day as a rest day, not a failure', () => {
    const summary = summarizeStreak(['2026-10-24', '2026-10-25', '2026-10-27'], '2026-10-27');
    expect(summary.current).toBe(3);
    expect(summary.restDaysUsed).toBe(1);
  });

  it('breaks after two missed days in a row', () => {
    const summary = summarizeStreak(['2026-10-20', '2026-10-21', '2026-10-24'], '2026-10-27');
    expect(summary.current).toBe(0);
    expect(summary.best).toBe(2);
    expect(streakMessage(summary)).toContain('Streaks restart');
  });

  it('keeps yesterday’s streak alive without guilt', () => {
    const summary = summarizeStreak(['2026-10-25', '2026-10-26'], '2026-10-27');
    expect(summary.current).toBe(2);
    expect(summary.isActiveToday).toBe(false);
    expect(streakMessage(summary)).toContain('still alive');
  });

  it('reports the best historical streak and next milestone', () => {
    const days: string[] = [];
    for (let day = 1; day <= 9; day += 1) days.push(`2026-09-0${day}`);
    const summary = summarizeStreak(days, '2026-10-27');
    expect(summary.best).toBe(9);
    expect(summary.nextMilestone).toBe(14);
    expect(nextMilestoneFor(0)).toBe(3);
    expect(nextMilestoneFor(400)).toBeNull();
  });

  it('handles an empty journal gracefully', () => {
    const summary = summarizeStreak([], '2026-10-27');
    expect(summary.current).toBe(0);
    expect(streakMessage(summary)).toContain('Start wherever you are');
  });
});
