import {
  analyzeContent,
  DEFAULT_FILTER_TERMS,
  DEFAULT_POLICY,
  findMatches,
  joinSpacedLetters,
  maskMatches,
  normalizeForMatch,
  type FilterTerm,
} from '../moderation';

const terms: FilterTerm[] = [
  { id: '1', term: 'shit', severity: 'medium', createdAt: 0, addedBy: 'test' },
  { id: '2', term: 'fuck', severity: 'medium', createdAt: 0, addedBy: 'test' },
  { id: '3', term: 'ass', severity: 'low', createdAt: 0, addedBy: 'test' },
  { id: '4', term: 'kill yourself', severity: 'high', createdAt: 0, addedBy: 'test' },
];

describe('moderation filter', () => {
  it('normalises leetspeak and symbols', () => {
    expect(normalizeForMatch('$h1t happens')).toBe('shit happens');
    expect(normalizeForMatch('F U C K')).toBe('f u c k');
  });

  it('joins spaced out letters', () => {
    expect(joinSpacedLetters('s h i t')).toBe('shit');
    expect(joinSpacedLetters('this is fine')).toBe('this is fine');
  });

  it('allows ordinary messages', () => {
    const verdict = analyzeContent('The new Renaissance session is wild, run it back.', terms);
    expect(verdict.allowed).toBe(true);
    expect(verdict.reasons).toEqual([]);
  });

  it('blocks plain, leetspeak, stretched and spaced attempts', () => {
    for (const attempt of ['what the shit', 'what the sh1t', 'what the shiiit', 'what the s h i t']) {
      const verdict = analyzeContent(attempt, terms);
      expect(verdict.allowed).toBe(false);
      expect(verdict.reasons).toContain('blocked-term');
    }
  });

  it('does not fire on words that merely contain a term', () => {
    expect(findMatches('classic grass pass', terms)).toHaveLength(0);
    expect(analyzeContent('We passed the class together.', terms).allowed).toBe(true);
  });

  it('catches multi-word phrases', () => {
    const verdict = analyzeContent('just kill yourself then', terms);
    expect(verdict.reasons).toContain('blocked-term');
    expect(verdict.severity).toBe('high');
  });

  it('masks instead of blocking when policy mode is mask', () => {
    const verdict = analyzeContent('this is shit', terms, { ...DEFAULT_POLICY, mode: 'mask' });
    expect(verdict.allowed).toBe(true);
    expect(verdict.sanitized).toBe('this is ****');
    expect(maskMatches('fuck this shit', terms)).toBe('**** this ****');
  });

  it('rejects link spam and floods', () => {
    const links = analyzeContent(
      'buy now https://a.com https://b.com https://c.com',
      terms,
      DEFAULT_POLICY
    );
    expect(links.reasons).toContain('too-many-links');
    const flood = analyzeContent('aaaaaaaaaaaaaaaaaaaa', terms, DEFAULT_POLICY);
    expect(flood.reasons).toContain('flood');
  });

  it('rejects shouting and duplicate posts', () => {
    expect(
      analyzeContent('THIS IS THE LOUDEST MESSAGE IN THE WORLD', terms).reasons
    ).toContain('shouting');
    expect(
      analyzeContent('Same message again', terms, DEFAULT_POLICY, {
        recentTexts: ['same message again'],
      }).reasons
    ).toContain('duplicate');
  });

  it('enforces rate limits', () => {
    const now = Date.UTC(2026, 0, 5, 12);
    const recentTimestamps = [now - 5_000, now - 10_000, now - 15_000];
    const verdict = analyzeContent('hello friends', terms, DEFAULT_POLICY, {
      now,
      recentTimestamps,
      rateLimit: { limit: 3, windowMs: 60_000 },
    });
    expect(verdict.reasons).toContain('rate-limited');
  });

  it('ships a usable default list, including slurs and scam patterns', () => {
    expect(DEFAULT_FILTER_TERMS.length).toBeGreaterThan(10);
    expect(findMatches('free crypto giveaway here', DEFAULT_FILTER_TERMS).length).toBeGreaterThan(0);
    expect(findMatches('I love this song', DEFAULT_FILTER_TERMS)).toHaveLength(0);
  });
});
