import { rotationIndex, toDayKey, type DayKey } from '@/lib/date';

export type PromptCategory =
  | 'self-improvement'
  | 'creativity'
  | 'discipline'
  | 'gratitude'
  | 'confidence'
  | 'goals';

export type JournalPrompt = {
  id: string;
  category: PromptCategory;
  prompt: string;
  reflection: string;
};

export const PROMPT_CATEGORIES: { id: PromptCategory; label: string; icon: string; color: string }[] = [
  { id: 'self-improvement', label: 'Growth', icon: 'trending-up', color: '#6FCB94' },
  { id: 'creativity', label: 'Creativity', icon: 'color-palette', color: '#FF8A3D' },
  { id: 'discipline', label: 'Discipline', icon: 'flame', color: '#F2610C' },
  { id: 'gratitude', label: 'Gratitude', icon: 'heart', color: '#F5B841' },
  { id: 'confidence', label: 'Confidence', icon: 'shield-checkmark', color: '#8AB4F8' },
  { id: 'goals', label: 'Goals', icon: 'flag', color: '#C78BF5' },
];

export const PROMPTS: JournalPrompt[] = [
  {
    id: 'p01',
    category: 'self-improvement',
    prompt: 'What is one thing you did today that the version of you from a year ago would be proud of?',
    reflection: 'Name the smallest part of it you can repeat tomorrow.',
  },
  {
    id: 'p02',
    category: 'discipline',
    prompt: 'Where did you negotiate with yourself today, and what would a clean yes have looked like?',
    reflection: 'Write the boundary in one sentence you could say out loud.',
  },
  {
    id: 'p03',
    category: 'creativity',
    prompt: 'Write down the idea you keep dismissing because it feels too obvious.',
    reflection: 'What is the first 20-minute version of it?',
  },
  {
    id: 'p04',
    category: 'gratitude',
    prompt: 'Who made your day lighter, and did they know it?',
    reflection: 'Send them two sentences before you close this app.',
  },
  {
    id: 'p05',
    category: 'confidence',
    prompt: 'What is a compliment you keep deflecting? Take it today.',
    reflection: 'What evidence does that compliment point to?',
  },
  {
    id: 'p06',
    category: 'goals',
    prompt: 'What would make this week a win, in one measurable sentence?',
    reflection: 'What is the one block of time you will protect for it?',
  },
  {
    id: 'p07',
    category: 'self-improvement',
    prompt: 'What story about yourself are you ready to stop rehearsing?',
    reflection: 'Write the replacement line, in present tense.',
  },
  {
    id: 'p08',
    category: 'discipline',
    prompt: 'What did you consume today by default instead of choice?',
    reflection: 'Swap one of those defaults for something you would defend.',
  },
  {
    id: 'p09',
    category: 'creativity',
    prompt: 'Describe today as a song: its tempo, its mood, its one memorable line.',
    reflection: 'What would the remix sound like?',
  },
  {
    id: 'p10',
    category: 'gratitude',
    prompt: 'What ordinary thing worked today that you usually ignore?',
    reflection: 'How would you notice it tomorrow?',
  },
  {
    id: 'p11',
    category: 'confidence',
    prompt: 'Where are you waiting for permission you already have?',
    reflection: 'Who benefits when you stop waiting?',
  },
  {
    id: 'p12',
    category: 'goals',
    prompt: 'Which goal are you chasing for someone else?',
    reflection: 'Keep it or release it — write the honest choice.',
  },
  {
    id: 'p13',
    category: 'self-improvement',
    prompt: 'What did you learn the hard way this month that you would teach a friend in five minutes?',
    reflection: 'Write the five-minute version.',
  },
  {
    id: 'p14',
    category: 'discipline',
    prompt: 'What is the cost of the habit you keep defending?',
    reflection: 'What could you buy back with that cost?',
  },
  {
    id: 'p15',
    category: 'creativity',
    prompt: 'Steal a structure, not a style: what do you admire, and what is it built from?',
    reflection: 'Make a 3-line sketch using that structure.',
  },
  {
    id: 'p16',
    category: 'gratitude',
    prompt: 'Write a thank-you note to a version of yourself that did not quit.',
    reflection: 'Which year of you was it?',
  },
  {
    id: 'p17',
    category: 'confidence',
    prompt: 'What do people consistently come to you for?',
    reflection: 'How could you let that be a strength instead of a chore?',
  },
  {
    id: 'p18',
    category: 'goals',
    prompt: 'What is one thing you will finish this week, no matter how small?',
    reflection: 'Define "done" so there is no ambiguity.',
  },
];
  {
    id: 'p19',
    category: 'self-improvement',
    prompt: 'What did you avoid today, and what was the fear underneath it?',
    reflection: 'What is the smallest safe step toward it?',
  },
  {
    id: 'p20',
    category: 'discipline',
    prompt: 'Design your tomorrow before you sleep: three anchors, no more.',
    reflection: 'Which one matters most if the day falls apart?',
  },
  {
    id: 'p21',
    category: 'creativity',
    prompt: 'What is a sound, place, or person you want your work to feel like?',
    reflection: 'Write one line that captures that feeling.',
  },
  {
    id: 'p22',
    category: 'gratitude',
    prompt: 'What is something you used to pray for that is now ordinary?',
    reflection: 'Say it out loud before bed.',
  },
  {
    id: 'p23',
    category: 'confidence',
    prompt: 'List three receipts: moments you did the hard thing.',
    reflection: 'Which receipt do you need to remember next time?',
  },
  {
    id: 'p24',
    category: 'goals',
    prompt: 'What would you attempt if it could only take 30 days and could not fail publicly?',
    reflection: 'Start it with the smallest possible version today.',
  },
  {
    id: 'p25',
    category: 'self-improvement',
    prompt: 'What is the difference between who you were in January and who you are today?',
    reflection: 'Where did the change happen quietly?',
  },
  {
    id: 'p26',
    category: 'discipline',
    prompt: 'Which rule would fix most of your problems in one move?',
    reflection: 'Write the rule and the consequence.',
  },
  {
    id: 'p27',
    category: 'creativity',
    prompt: 'Make something bad on purpose in five minutes. What surprised you?',
    reflection: 'Keep one line that actually works.',
  },
  {
    id: 'p28',
    category: 'gratitude',
    prompt: 'What is a kindness you received that cost someone nothing but meant everything?',
    reflection: 'Pass it on today.',
  },
  {
    id: 'p29',
    category: 'confidence',
    prompt: 'What would you stop apologizing for?',
    reflection: 'Rewrite one sentence from today without the apology.',
  },
  {
    id: 'p30',
    category: 'goals',
    prompt: 'What progress is invisible to everyone but you?',
    reflection: 'How will you celebrate it in a small, real way?',
  },
  {
    id: 'p31',
    category: 'self-improvement',
    prompt: 'Where do you compare yourself most, and what is that comparison actually costing?',
    reflection: 'What is your own measuring stick?',
  },
  {
    id: 'p32',
    category: 'discipline',
    prompt: 'What does your body need that your ambition keeps postponing?',
    reflection: 'Schedule it like a session.',
  },
  {
    id: 'p33',
    category: 'creativity',
    prompt: 'Finish this: "The next version of my sound is ___."',
    reflection: 'What is the first experiment to try?',
  },
  {
    id: 'p34',
    category: 'gratitude',
    prompt: 'Who deserves a message you have been meaning to send?',
    reflection: 'Send it in the next ten minutes.',
  },
  {
    id: 'p35',
    category: 'confidence',
    prompt: 'Where did you hold back today, and what would you do with 10% more nerve?',
    reflection: 'What is the 10% move tomorrow?',
  },
  {
    id: 'p36',
    category: 'goals',
    prompt: 'Name the milestone 90 days out, then the next three moves.',
    reflection: 'Which move can start tomorrow morning?',
  },
];

export function promptForDay(dayKey: DayKey = toDayKey()): JournalPrompt {
  return PROMPTS[rotationIndex(dayKey, PROMPTS.length)];
}

export function promptsByCategory(category: PromptCategory): JournalPrompt[] {
  return PROMPTS.filter((prompt) => prompt.category === category);
}

