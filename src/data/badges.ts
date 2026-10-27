/**
 * Reward badges. Criteria are data so new badges can ship without touching the
 * rewards engine.
 */
export type BadgeMetric =
  | 'points'
  | 'journalStreak'
  | 'journalEntries'
  | 'listens'
  | 'pollVotes'
  | 'communityPosts'
  | 'goalsCompleted'
  | 'purchases';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tint: 'ember' | 'gold' | 'moss' | 'ice' | 'plum';
  metric: BadgeMetric;
  target: number;
  pointsOnUnlock: number;
};

export const BADGES: Badge[] = [
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Write your first journal entry.',
    icon: 'sunny-outline',
    tint: 'gold',
    metric: 'journalEntries',
    target: 1,
    pointsOnUnlock: 25,
  },
  {
    id: 'seven-days',
    name: 'Seven Straight',
    description: 'Journal seven days in a row (rest days are allowed).',
    icon: 'flame-outline',
    tint: 'ember',
    metric: 'journalStreak',
    target: 7,
    pointsOnUnlock: 100,
  },
  {
    id: 'thirty-days',
    name: 'Thirty Deep',
    description: 'Reach a 30-day journaling streak.',
    icon: 'leaf-outline',
    tint: 'moss',
    metric: 'journalStreak',
    target: 30,
    pointsOnUnlock: 300,
  },
  {
    id: 'crate-digger',
    name: 'Crate Digger',
    description: 'Listen to 25 tracks.',
    icon: 'disc-outline',
    tint: 'gold',
    metric: 'listens',
    target: 25,
    pointsOnUnlock: 75,
  },
  {
    id: 'first-word',
    name: 'First Word',
    description: 'Post in the community for the first time.',
    icon: 'chatbubble-ellipses-outline',
    tint: 'ice',
    metric: 'communityPosts',
    target: 1,
    pointsOnUnlock: 25,
  },
  {
    id: 'tastemaker',
    name: 'Tastemaker',
    description: 'Vote in five community polls.',
    icon: 'stats-chart-outline',
    tint: 'plum',
    metric: 'pollVotes',
    target: 5,
    pointsOnUnlock: 75,
  },
  {
    id: 'goal-getter',
    name: 'Goal Getter',
    description: 'Complete your first personal goal.',
    icon: 'checkmark-done-outline',
    tint: 'moss',
    metric: 'goalsCompleted',
    target: 1,
    pointsOnUnlock: 50,
  },
  {
    id: 'renaissance-scholar',
    name: 'Renaissance Scholar',
    description: 'Earn 1,000 lifetime points.',
    icon: 'school-outline',
    tint: 'ember',
    metric: 'points',
    target: 1_000,
    pointsOnUnlock: 250,
  },
];

export const LEVELS = [
  { level: 1, name: 'Seed', minPoints: 0 },
  { level: 2, name: 'Sprout', minPoints: 150 },
  { level: 3, name: 'Up & Comer', minPoints: 400 },
  { level: 4, name: 'Hustler', minPoints: 800 },
  { level: 5, name: 'Renaissance', minPoints: 1_500 },
  { level: 6, name: 'Greatest', minPoints: 3_000 },
] as const;

export type Level = (typeof LEVELS)[number];
