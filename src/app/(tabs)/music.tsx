import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { SiteWebView } from '@/components/SiteWebView';
import { EmptyState } from '@/components/States';
import { Card, SectionHeader } from '@/components/Surfaces';
import { SegmentedControl } from '@/components/Inputs';
import { ALBUMS, ALL_TRACKS, getTrack } from '@/data/tracks';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { AlbumCard } from '@/features/music/AlbumCard';
import { deleteDownloadedAudio } from '@/features/music/downloads';
import { usePlayer } from '@/features/music/PlayerProvider';
import { TrackRow } from '@/features/music/TrackRow';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { SITE } from '@/lib/site';
import { useTheme } from '@/theme';

type MusicTab = 'library' | 'saved' | 'downloads' | 'official';

export default function MusicScreen() {
  const theme = useTheme();
  const router = useRouter();
  const player = usePlayer();
  const [tab, setTab] = useState<MusicTab>('official');
  const favorites = useLibraryStore((state) => state.favoriteTrackIds);
  const downloads = useLibraryStore((state) => state.downloads);
  const removeDownload = useLibraryStore((state) => state.removeDownload);
  const tier = useAuthStore((state) => state.membership.tier);

  const savedTracks = favorites
    .map((id) => getTrack(id))
    .filter((track): track is NonNullable<ReturnType<typeof getTrack>> => Boolean(track));
  const downloadedTracks = Object.values(downloads)
    .map((record) => ({ record, track: getTrack(record.trackId) }))
    .filter((entry): entry is { record: typeof entry.record; track: NonNullable<ReturnType<typeof getTrack>> } => Boolean(entry.track));

  if (tab === 'official') {
    return (
      <Screen scroll={false} title="Music" eyebrow="OGR-Scintilla" bottomInset={110}>
        <SegmentedControl<MusicTab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'official', label: 'Official' },
            { value: 'library', label: 'Library' },
            { value: 'saved', label: 'Saved' },
            { value: 'downloads', label: 'Offline' },
          ]}
        />
        <SiteWebView
          fill
          url={SITE.music}
          title="Official stream · overgrowthrenaissance.com/music"
          note="Live Wix player. Web-view audio cannot use the app’s background playback or mini player — switch to Library for that."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Music" eyebrow="OGR-Scintilla" bottomInset={150}>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip label="Free streaming" icon="play-circle-outline" size="sm" />
        <Chip
          label={tier === 'top01' ? 'Downloads unlocked' : 'Downloads · Top 0.1%'}
          icon={tier === 'top01' ? 'checkmark-circle' : 'lock-closed'}
          size="sm"
          tone={tier === 'top01' ? 'success' : 'neutral'}
        />
        <Chip label="Background audio" icon="headset-outline" size="sm" />
      </View>

      <SegmentedControl<MusicTab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'official', label: 'Official' },
          { value: 'library', label: 'Library' },
          { value: 'saved', label: 'Saved' },
          { value: 'downloads', label: 'Offline' },
        ]}
      />

      {tab === 'library' ? (
        <>
          <View>
            <SectionHeader title="Releases" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {ALBUMS.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onPress={() => router.push(`/album/${album.id}`)}
                />
              ))}
            </ScrollView>
          </View>

          <View>
            <SectionHeader title="All tracks" actionLabel="Play all" onAction={() => void player.play(ALL_TRACKS[0], ALL_TRACKS)} />
            <Card padded={false} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
              {ALL_TRACKS.map((track) => (
                <TrackRow key={track.id} track={track} queue={ALL_TRACKS} showAlbum />
              ))}
            </Card>
          </View>

          <Card tone="alt" style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="information-circle-outline" size={15} color={theme.colors.gold} />
              <AppText variant="smallMedium">About this catalogue</AppText>
            </View>
            <AppText variant="small" color="textMuted">
              The native player runs on preview audio shipped with this build so playback, queueing,
              offline downloads and background audio can be verified end to end. Connect the
              artist’s licensed masters to load the real catalogue — the official Wix player stays
              available in the Site tab.
            </AppText>
          </Card>
        </>
      ) : null}

      {tab === 'saved' ? (
        savedTracks.length > 0 ? (
          <Card padded={false} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            {savedTracks.map((track) => (
              <TrackRow key={track.id} track={track} queue={savedTracks} showAlbum />
            ))}
          </Card>
        ) : (
          <EmptyState
            icon="heart-outline"
            title="No saved tracks yet"
            message="Tap the heart on any track to build your own library. Saved music follows your account."
            actionLabel="Browse releases"
            onAction={() => setTab('library')}
          />
        )
      ) : null}

      {tab === 'downloads' ? (
        <>
          {tier !== 'top01' ? (
            <Card style={{ gap: 8 }} tone="accent">
              <AppText variant="smallMedium">Offline listening is a Top 0.1% benefit</AppText>
              <AppText variant="small" color="textMuted">
                Downloads are part of the Top 0.1% Listener plan on the artist’s website. You can
                still stream everything for free.
              </AppText>
              <Button label="View membership" size="sm" onPress={() => router.push('/membership')} />
            </Card>
          ) : null}

          {downloadedTracks.length > 0 ? (
            downloadedTracks.map(({ record, track }) => (
              <Card key={record.trackId} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="arrow-down-circle" size={18} color={theme.colors.success} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium">{track.title}</AppText>
                    <AppText variant="small" color="textFaint">
                      {(record.bytes / 1_048_576).toFixed(1)} MB · available offline
                    </AppText>
                  </View>
                  <Button label="Play" size="sm" variant="secondary" onPress={() => void player.play(track, [track])} />
                  <Button
                    label="Remove"
                    size="sm"
                    variant="ghost"
                    onPress={() => {
                      void deleteDownloadedAudio(record.uri);
                      removeDownload(record.trackId);
                    }}
                  />
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="cloud-download-outline"
              title="Nothing downloaded yet"
              message="Open a release and tap Download to keep it on this device. Downloads stay on-device and can be removed any time."
              actionLabel="Browse releases"
              onAction={() => setTab('library')}
            />
          )}
        </>
      ) : null}
    </Screen>
  );
}
