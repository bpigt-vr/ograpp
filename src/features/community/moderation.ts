/**
 * Community content filter.
 *
 * Goals: keep the space usable without fan policing, and make the rules
 * inspectable. Every decision is produced by a pure function so it can be unit
 * tested and so the moderation screen can preview exactly what will happen.
 *
 * Handles leetspeak/symbols (sh1t, $hit, @ss), stretched letters (shiiit),
 * spaced-out letters (s h i t), zero-width characters, link spam, shouting,
 * character floods, duplicate posts and rate limits.
 *
 * Deliberately not claimed: semantic hate-speech detection. That needs a
 * server-side classifier plus human review (see docs/INTEGRATIONS.md).
 */

export type FilterSeverity = 'low' | 'medium' | 'high';

export type FilterTerm = {
  id: string;
  term: string;
  severity: FilterSeverity;
  createdAt: number;
  addedBy: string;
};

export type FilterMode = 'block' | 'mask';

export type ModerationPolicy = {
  mode: FilterMode;
  minLength: number;
  maxLength: number;
  maxLinks: number;
  maxUppercaseRatio: number;
  blockDuplicate: boolean;
  blockFloods: boolean;
};

export type ModerationReason =
  | 'blocked-term'
  | 'too-short'
  | 'too-long'
  | 'too-many-links'
  | 'shouting'
  | 'duplicate'
  | 'flood'
  | 'rate-limited';

export type ModerationVerdict = {
  allowed: boolean;
  reasons: ModerationReason[];
  matched: { term: string; severity: FilterSeverity }[];
  sanitized: string;
  severity: FilterSeverity | 'none';
};

export const DEFAULT_POLICY: ModerationPolicy = {
  mode: 'block',
  minLength: 3,
  maxLength: 2_000,
  maxLinks: 2,
  maxUppercaseRatio: 0.72,
  blockDuplicate: true,
  blockFloods: true,
};

const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  $: 's',
  '!': 'i',
  '|': 'i',
  '+': 't',
  '€': 'e',
  '£': 'l',
};

const SEVERITY_RANK: Record<FilterSeverity, number> = { low: 1, medium: 2, high: 3 };

/** Lowercase, strip diacritics/zero-width, undo leetspeak, keep word spacing. */
export function normalizeForMatch(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase()
    .replace(/[0-9@$!|+€£]/g, (char) => LEET[char] ?? char)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Join runs of single characters so "s h i t" is inspected as "shit". */
export function joinSpacedLetters(input: string): string {
  const tokens = normalizeForMatch(input).split(' ').filter(Boolean);
  const out: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length > 1) out.push(run.join(''));
    else if (run.length === 1) out.push(run[0]);
    run = [];
  };
  for (const token of tokens) {
    if (token.length === 1) {
      run.push(token);
      continue;
    }
    flush();
    out.push(token);
  }
  flush();
  return out.join(' ');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termPattern(term: string, flags = 'i'): RegExp {
  const normalized = normalizeForMatch(term).trim();
  const body = normalized
    .split(/\s+/)
    .map((word) =>
      word
        .split('')
        .map((char) => `${escapeRegExp(char)}+`)
        .join('')
    )
    .join('[\\s\\-_.]*');
  return new RegExp(`(^|[^a-z0-9])(${body})([^a-z0-9]|$)`, flags);
}

export function findMatches(
  text: string,
  terms: FilterTerm[]
): { term: string; severity: FilterSeverity }[] {
  if (!text.trim()) return [];
  const normalized = normalizeForMatch(text);
  const joined = joinSpacedLetters(text);
  const hits: { term: string; severity: FilterSeverity }[] = [];

  for (const term of terms) {
    const pattern = termPattern(term.term);
    if (pattern.test(normalized) || pattern.test(joined)) {
      hits.push({ term: term.term, severity: term.severity });
    }
  }
  return hits;
}

export function maskMatches(text: string, terms: FilterTerm[]): string {
  let output = text;
  for (const term of terms) {
    const normalized = normalizeForMatch(term.term).replace(/\s+/g, '');
    if (!normalized) continue;
    const pattern = termPattern(term.term, 'gi');
    output = output.replace(pattern, (_match, before: string, word: string, after: string) => {
      return `${before}${'*'.repeat(Math.max(2, word.length))}${after}`;
    });
  }
  return output;
}

function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/|www\.|\.com\b|\.ca\b|t\.me\//gi);
  return matches ? matches.length : 0;
}

function uppercaseRatio(text: string): number {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 20) return 0;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length;
}

function hasFlood(text: string): boolean {
  if (/(.)\1{11,}/.test(text)) return true;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 12) {
    const unique = new Set(words.map((word) => word.toLowerCase()));
    if (unique.size <= Math.max(2, Math.floor(words.length * 0.25))) return true;
  }
  return false;
}

export type AnalyzeContext = {
  recentTexts?: string[];
  now?: number;
  recentTimestamps?: number[];
  rateLimit?: { limit: number; windowMs: number };
};

export function similarityKey(text: string): string {
  return normalizeForMatch(text).replace(/\s+/g, '');
}

export function analyzeContent(
  rawText: string,
  terms: FilterTerm[],
  policy: ModerationPolicy = DEFAULT_POLICY,
  context: AnalyzeContext = {}
): ModerationVerdict {
  const text = rawText.trim();
  const reasons: ModerationReason[] = [];
  const matched = findMatches(text, terms);
  const highest = matched.reduce<FilterSeverity | 'none'>((acc, hit) => {
    if (acc === 'none') return hit.severity;
    return SEVERITY_RANK[hit.severity] > SEVERITY_RANK[acc] ? hit.severity : acc;
  }, 'none');

  if (matched.length > 0 && policy.mode === 'block') reasons.push('blocked-term');
  if (text.length < policy.minLength) reasons.push('too-short');
  if (text.length > policy.maxLength) reasons.push('too-long');
  if (countLinks(text) > policy.maxLinks) reasons.push('too-many-links');
  if (uppercaseRatio(text) > policy.maxUppercaseRatio) reasons.push('shouting');
  if (policy.blockFloods && hasFlood(text)) reasons.push('flood');

  if (policy.blockDuplicate && context.recentTexts?.length) {
    const key = similarityKey(text);
    if (context.recentTexts.some((recent) => similarityKey(recent) === key)) {
      reasons.push('duplicate');
    }
  }

  if (context.rateLimit && context.recentTimestamps) {
    const now = context.now ?? Date.now();
    const limit = context.rateLimit;
    const withinWindow = context.recentTimestamps.filter(
      (timestamp) => now - timestamp < limit.windowMs
    );
    if (withinWindow.length >= limit.limit) reasons.push('rate-limited');
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    matched,
    sanitized: matched.length > 0 ? maskMatches(text, terms) : text,
    severity: highest,
  };
}

export function reasonMessage(reason: ModerationReason): string {
  switch (reason) {
    case 'blocked-term':
      return 'A word in this message is on the community filter list.';
    case 'too-short':
      return 'Add a little more — one-word posts read as spam.';
    case 'too-long':
      return 'This post is longer than the community limit.';
    case 'too-many-links':
      return 'Too many links. Keep it to two or fewer.';
    case 'shouting':
      return 'Easy on the all-caps — it reads as shouting.';
    case 'duplicate':
      return 'You already posted this. Give it a rest before repeating it.';
    case 'flood':
      return 'This looks like spam flooding. Rephrase and try again.';
    case 'rate-limited':
      return 'You are posting too fast. Take a breath and try again in a minute.';
  }
}

export function canPostNow(
  timestamps: number[],
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  return timestamps.filter((timestamp) => now - timestamp < windowMs).length < limit;
}

/**
 * Seed list. Medium/high severity terms are block-on-sight; low severity words
 * can be downgraded to masking from the moderation screen.
 */
export const DEFAULT_FILTER_TERMS: FilterTerm[] = [
  { term: 'fuck', severity: 'medium' },
  { term: 'shit', severity: 'medium' },
  { term: 'bitch', severity: 'medium' },
  { term: 'cunt', severity: 'high' },
  { term: 'asshole', severity: 'medium' },
  { term: 'dickhead', severity: 'medium' },
  { term: 'bastard', severity: 'low' },
  { term: 'whore', severity: 'high' },
  { term: 'slut', severity: 'high' },
  { term: 'faggot', severity: 'high' },
  { term: 'retard', severity: 'high' },
  { term: 'nigger', severity: 'high' },
  { term: 'nigga', severity: 'high' },
  { term: 'kys', severity: 'high' },
  { term: 'kill yourself', severity: 'high' },
  { term: 'rape', severity: 'high' },
  { term: 'scam link', severity: 'medium' },
  { term: 'onlyfans', severity: 'medium' },
  { term: 'free followers', severity: 'low' },
  { term: 'crypto giveaway', severity: 'medium' },
].map((item, index) => ({
  id: `seed-${index + 1}`,
  term: item.term,
  severity: item.severity as FilterSeverity,
  createdAt: 0,
  addedBy: 'system',
}));
