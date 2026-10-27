import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { getAlbum } from '@/data/tracks';
import { AlbumHeader } from '@/features/music/AlbumCard';
import { usePlayer } from '@/features/music/PlayerProvider';
import { TrackRow } from '@/features/music/TrackRow';
import { useTrackDownloads } from '@/features/music/useDownloads';
import { useTheme } from '@/theme';

export default function AlbumScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const album = getAlbum(String(id));
  const player = usePlayer();
  const downloads = useTrackDownloads();
  const [paywall, setPaywall] = useState(false);

  if (!album) {
    return (
      <Screen back title="Release" bottomInset={40}>
        <Card tone="alt">
          <AppText variant="subheading">Release not found</AppText>
          <AppText variant="small" color="textMuted">
            This release is no longer in the catalogue.
          </AppText>
          <Button label="Back to music" size="sm" onPress={() => router.replace('/music')} />
        </Card>
      </Screen>
    );
  }

  const downloadAll = async () => {
    for (const track of album.tracks) {
      const result = await downloads.download(track);
      if (!result.ok) {
        setPaywall(true);
        break;
      }
    }
  };

  return (
    <Screen back title={album.title} eyebrow={`${album.kind} · ${album.year}`} bottomInset={140}>
      <AlbumHeader album={album} />

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          label="Play album"
          icon="play"
          onPress={() => void player.play(album.tracks[0], album.tracks)}
        />
        <Button
          label={downloads.tier === 'top01' ? 'Download all' : 'Downloads · Top 0.1%'}
          icon={downloads.tier === 'top01' ? 'download-outline' : 'lock-closed'}
          variant="secondary"
          onPress={() => (downloads.tier === 'top01' ? void downloadAll() : setPaywall(true))}
        />
      </View>

      {paywall ? (
        <Card tone="accent" style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="lock-closed" size={15} color={theme.colors.accent} />
            <AppText variant="smallMedium">Offline downloads need an upgrade</AppText>
          </View>
          <AppText variant="small" color="textMuted">
            The artist’s Top 0.1% Listener plan includes downloading the full catalogue. Membership
            is managed on overgrowthrenaissance.com.
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="See plans" size="sm" onPress={() => router.push('/membership')} />
            <Button label="Dismiss" size="sm" variant="ghost" onPress={() => setPaywall(false)} />
          </View>
        </Card>
      ) : null}

      <Card padded={false} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
        {album.tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            queue={album.tracks}
            showAlbum={false}
            downloading={downloads.busyId === track.id}
            onDownload={() => void downloads.download(track)}
          />
        ))}
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {album.tracks[0]?.tags.map((tag) => (
          <Chip key={tag} label={`#${tag}`} size="sm" />
        ))}
        <Chip label={album.isPreview ? 'Preview audio' : 'Licensed audio'} size="sm" tone={album.isPreview ? 'gold' : 'success'} />
      </View>
    </Screen>
  );
}
