import { rotationIndex, toDayKey, type DayKey } from '@/lib/date';

/**
 * Daily inspiration copy. Written in-house for the app (no real-person quotes,
 * no attribution risks). The artist can swap these for their own lines without
 * touching any component.
 */
export type Quote = {
  id: string;
  text: string;
  theme: 'discipline' | 'growth' | 'creativity' | 'gratitude' | 'confidence' | 'resilience';
};

export const QUOTES: Quote[] = [
  { id: 'q01', theme: 'growth', text: 'You are not behind. You are early in a story that has barely started.' },
  { id: 'q02', theme: 'discipline', text: 'Motivation shows up late. Discipline shows up on time.' },
  { id: 'q03', theme: 'creativity', text: 'Make the thing you would want to find at 2am.' },
  { id: 'q04', theme: 'confidence', text: 'Confidence is a receipt. Collect proof, then spend it.' },
  { id: 'q05', theme: 'resilience', text: 'A setback is a rehearsal for the version of you that finishes.' },
  { id: 'q06', theme: 'gratitude', text: 'Name three ordinary things that went right. That is where abundance starts.' },
  { id: 'q07', theme: 'discipline', text: 'Small, boring, repeated. That is the whole secret.' },
  { id: 'q08', theme: 'growth', text: 'Outgrow the room gently. You can be grateful and still leave.' },
  { id: 'q09', theme: 'creativity', text: 'Nobody is waiting for permission. Especially not you.' },
  { id: 'q10', theme: 'resilience', text: 'Fall seven times. Take notes on all seven.' },
  { id: 'q11', theme: 'confidence', text: 'Speak to yourself like someone you are responsible for.' },
  { id: 'q12', theme: 'gratitude', text: 'The life you are building is happening right now, not after the next win.' },
  { id: 'q13', theme: 'discipline', text: 'You do not need more time. You need fewer open tabs.' },
  { id: 'q14', theme: 'growth', text: 'Your taste is ahead of your skill. That gap is the work.' },
  { id: 'q15', theme: 'creativity', text: 'Finish something small today. Finished beats perfect every time.' },
  { id: 'q16', theme: 'resilience', text: 'Rest is not a reward for finishing. It is part of finishing.' },
  { id: 'q17', theme: 'confidence', text: 'You have survived every single day that tried to end the story.' },
  { id: 'q18', theme: 'gratitude', text: 'Say thank you before you ask for more.' },
  { id: 'q19', theme: 'discipline', text: 'Guard the first hour. The rest of the day copies it.' },
  { id: 'q20', theme: 'growth', text: 'Be the greatest you can be, not the loudest in the room.' },
  { id: 'q21', theme: 'creativity', text: 'Your weird is the only part of you no one can copy.' },
  { id: 'q22', theme: 'resilience', text: 'The comeback is not louder than the setback. It is longer.' },
  { id: 'q23', theme: 'confidence', text: 'Stop auditioning for people who already chose you.' },
  { id: 'q24', theme: 'gratitude', text: 'Somebody is praying for the ordinary day you are complaining about.' },
  { id: 'q25', theme: 'discipline', text: 'Do it tired. Do it unsure. Do it anyway, smaller.' },
  { id: 'q26', theme: 'growth', text: 'Plant shade you will not sit under.' },
  { id: 'q27', theme: 'creativity', text: 'A blank page is a rumour. Start the sentence and it becomes a place.' },
  { id: 'q28', theme: 'resilience', text: 'You are allowed to start again, and again, and again.' },
  { id: 'q29', theme: 'confidence', text: 'Nobody has your exact combination. Charge accordingly.' },
  { id: 'q30', theme: 'gratitude', text: 'The people who kept you alive are part of the win. Text them.' },
  { id: 'q31', theme: 'discipline', text: 'Reduce it until it is impossible to fail, then begin.' },
];

export function quoteForDay(dayKey: DayKey = toDayKey()): Quote {
  return QUOTES[rotationIndex(dayKey, QUOTES.length)];
}
