import type { CommunityPost } from '@/features/community/types';

/**
 * Seed content is limited to the artist's own announcements, one poll and one
 * challenge. We deliberately do not fabricate fan posts — an empty community
 * with a clear empty state is more honest than a fake crowd.
 */
export const ARTIST_ID = 'artist-ogr';
export const ARTIST_NAME = 'OGR-Scintilla';

export function buildSeedPosts(now: number = Date.now()): CommunityPost[] {
  const day = 86_400_000;
  return [
    {
      id: 'seed-welcome',
      kind: 'announcement',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day * 2,
      title: 'Welcome to Overgrowth Renaissance',
      body:
        'This is the home base: music, the Hoser Gang, journal, rewards and the community. Be the greatest you can be — and keep it respectful in here.',
      pinned: true,
      hidden: false,
      reports: 0,
    },
    {
      id: 'seed-hoser-gang',
      kind: 'announcement',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day * 5,
      title: 'The Hoser Gang is open',
      body:
        'Top 1% and Top 0.1% listener plans are live on the website: unreleased music, free downloads and real support for the run. Memberships open on overgrowthrenaissance.com.',
      hidden: false,
      reports: 0,
    },
    {
      id: 'seed-beats',
      kind: 'announcement',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day * 9,
      title: 'Free beat downloads',
      body:
        'OGR beats are free to download from the site when you split royalties on releases. Details in the store under OGR Beats.',
      hidden: false,
      reports: 0,
    },
    {
      id: 'seed-poll-remix',
      kind: 'poll',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day,
      title: 'Next remix',
      body: 'Which session should get the next remix treatment?',
      poll: {
        question: 'Which session should get the next remix?',
        options: [
          { id: 'overgrowth', label: 'Overgrowth' },
          { id: 'scintilla', label: 'Scintilla' },
          { id: 'renaissance', label: 'Renaissance' },
          { id: 'hoser-gang', label: 'Hoser Gang' },
        ],
        closesAt: now + day * 21,
      },
      hidden: false,
      reports: 0,
    },
    {
      id: 'seed-challenge',
      kind: 'challenge',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day * 3,
      title: 'Seven for seven',
      body:
        'Write one reflection a day for seven days. Rest days are allowed — missing a day does not reset your streak.',
      challenge: { metric: 'journalStreak', target: 7, rewardPoints: 50 },
      hidden: false,
      reports: 0,
    },
    {
      id: 'seed-feedback',
      kind: 'discussion',
      authorId: ARTIST_ID,
      authorName: ARTIST_NAME,
      authorIsArtist: true,
      createdAt: now - day * 4,
      title: 'What should this app do next?',
      body:
        'Tell me what you want first: more unreleased music, merch drops, member-only rooms, or remix voting. Keep it respectful — the filter is on.',
      hidden: false,
      reports: 0,
    },
  ];
}
