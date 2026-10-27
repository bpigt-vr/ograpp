/**
 * Date helpers for the journal. Everything is local-time based so a "day"
 * matches the user's calendar, not UTC.
 */

export type DayKey = string; // YYYY-MM-DD

export function toDayKey(date: Date = new Date()): DayKey {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDayKey(key: DayKey): Date {
  const [year, month, day] = key.split('-').map((part) => Number.parseInt(part, 10));
  // Noon avoids DST edge cases around midnight.
  return new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

export function isValidDayKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(parseDayKey(key).getTime());
}

export function addDays(key: DayKey, days: number): DayKey {
  const date = parseDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

export function daysBetween(from: DayKey, to: DayKey): number {
  const a = parseDayKey(from).getTime();
  const b = parseDayKey(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function weekdayLabels(): string[] {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}

export function formatDayLabel(key: DayKey, options: { withYear?: boolean } = {}): string {
  const date = parseDayKey(key);
  const base = `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  return options.withYear ? `${base}, ${date.getFullYear()}` : base;
}

export function formatShortDay(key: DayKey): string {
  const date = parseDayKey(key);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

export function todayLabel(): string {
  return formatDayLabel(toDayKey(), { withYear: true });
}

/** Monday-first calendar grid for a month. `null` marks padding cells. */
export function monthGrid(year: number, monthIndex: number): (DayKey | null)[] {
  const first = new Date(year, monthIndex, 1, 12);
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (DayKey | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDayKey(new Date(year, monthIndex, day, 12)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function relativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatShortDay(toDayKey(new Date(timestamp)));
}

/** Deterministic index for rotating daily content (quotes, prompts). */
export function rotationIndex(dayKey: DayKey, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dayKey.length; i += 1) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) % 1_000_003;
  }
  return hash % length;
}
