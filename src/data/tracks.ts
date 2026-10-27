import type { MembershipTierId } from '@/features/membership/plans';

/**
 * Music catalogue.
 *
 * IMPORTANT: the bundled tracks are original, procedurally generated preview
 * loops shipped so that playback, queueing, downloads and background audio can
 * be tested without redistributing anyone's masters. They are labelled as
 * previews throughout the UI.
 *
 * To go live, host the artist's authorised masters (Wix Music files or a CDN
 * with signed URLs) and either set EXPO_PUBLIC_MUSIC_CATALOG_URL to a JSON feed
 * with the same shape, or replace this file. See docs/INTEGRATIONS.md.
 */
export type TrackSource = number | { uri: string };

export type Track = {
  id: string;
  albumId: string;
  title: string;
  artist: string;
  durationSec: number;
  source: TrackSource;
  streamingUrl?: string;
  requiresTier: MembershipTierId;
  downloadRequiresTier: MembershipTierId;
  unreleased: boolean;
  explicit: boolean;
  featured?: boolean;
  tags: string[];
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  kind: 'EP' | 'Single' | 'Mixtape' | 'Session';
  description: string;
  gradient: readonly [string, string, string];
  releasedAt: string;
  isPreview: boolean;
  tracks: Track[];
};

const ARTIST = 'OGR-Scintilla';

export const ALBUMS: Album[] = [
  {
    id: 'overgrowth-sessions',
    title: 'Overgrowth Sessions',
    artist: ARTIST,
    year: new Date().getFullYear(),
    kind: 'EP',
    description:
      'Warm, sample-driven boom bap about coming up in rural Alberta. Preview audio for the in-app player.',
    gradient: ['#FF9A4D', '#C43A05', '#2A0D06'],
    releasedAt: '2026-02-06',
    isPreview: true,
    tracks: [
      {
        id: 'overgrowth',
        albumId: 'overgrowth-sessions',
        title: 'Overgrowth',
        artist: ARTIST,
        durationSec: 34,
        source: require('../../assets/audio/overgrowth.wav'),
        requiresTier: 'free',
        downloadRequiresTier: 'top01',
        unreleased: false,
        explicit: false,
        featured: true,
        tags: ['boom bap', 'motivation'],
      },
      {
        id: 'scintilla',
        albumId: 'overgrowth-sessions',
        title: 'Scintilla',
        artist: ARTIST,
        durationSec: 32,
        source: require('../../assets/audio/scintilla.wav'),
        requiresTier: 'free',
        downloadRequiresTier: 'top01',
        unreleased: false,
        explicit: false,
        tags: ['spark', 'late night'],
      },
    ],
  },
  {
    id: 'renaissance-sessions',
    title: 'Renaissance Sessions',
    artist: ARTIST,
    year: new Date().getFullYear(),
    kind: 'Session',
    description:
      'Horns-of-plenty energy for the comeback arc. Preview audio for the in-app player.',
    gradient: ['#F5B841', '#D93A0B', '#2A0D06'],
    releasedAt: '2026-09-12',
    isPreview: true,
    tracks: [
      {
        id: 'renaissance',
        albumId: 'renaissance-sessions',
        title: 'Renaissance',
        artist: ARTIST,
        durationSec: 30,
        source: require('../../assets/audio/renaissance.wav'),
        requiresTier: 'free',
        downloadRequiresTier: 'top01',
        unreleased: false,
        explicit: false,
        featured: true,
        tags: ['anthem', 'comeback'],
      },
      {
        id: 'hoser-gang',
        albumId: 'renaissance-sessions',
        title: 'Hoser Gang',
        artist: ARTIST,
        durationSec: 28,
        source: require('../../assets/audio/hoser-gang.wav'),
        requiresTier: 'free',
        downloadRequiresTier: 'top01',
        unreleased: false,
        explicit: false,
        tags: ['crew', 'uptempo'],
      },
    ],
  },
];

export const ALL_TRACKS: Track[] = ALBUMS.flatMap((album) => album.tracks);

export function getAlbum(id: string): Album | undefined {
  return ALBUMS.find((album) => album.id === id);
}

export function getTrack(id: string): Track | undefined {
  return ALL_TRACKS.find((track) => track.id === id);
}

export function albumForTrack(trackId: string): Album | undefined {
  const track = getTrack(trackId);
  return track ? getAlbum(track.albumId) : undefined;
}

export function trackGradient(trackId: string): readonly [string, string, string] {
  return albumForTrack(trackId)?.gradient ?? ['#FF9A4D', '#D93A0B', '#2A0803'];
}

export const FEATURED_TRACK = ALL_TRACKS.find((track) => track.featured) ?? ALL_TRACKS[0];
