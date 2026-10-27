import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { IconButton } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Slider } from '@/components/Slider';
import { EmptyState } from '@/components/States';
import { Card } from '@/components/Surfaces';
import { getAlbum, trackGradient } from '@/data/tracks';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { usePlayer } from '@/features/music/PlayerProvider';
import { TrackRow } from '@/features/music/TrackRow';
import { useTrackDownloads } from '@/features/music/useDownloads';
import { formatDuration } from '@/lib/format';
import { useTheme } from '@/theme';

export default function PlayerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const player = usePlayer();
  const downloads = useTrackDownloads();
  const favorites = useLibraryStore((state) => state.favoriteTrackIds);
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const [scrub, setScrub] = useState<number | null>(null);

  const current = player.current;
  const artSize = Math.min(width - 88, 340);
  const progress = player.durationSec > 0 ? player.positionSec / player.durationSec : 0;
  const shownProgress = scrub ?? progress;
  const favorite = current ? favorites.includes(current.id) : false;
  const upNext = player.queue.slice(player.index + 1, player.index + 4);
  const album = current ? getAlbum(current.albumId) : undefined;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <IconButton icon="chevron-down" label="Close player" onPress={() => router.back()} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <AppText variant="label" color="textFaint">
            NOW PLAYING
          </AppText>
          <AppText variant="small" numberOfLines={1}>
            {album?.title ?? 'Overgrowth Renaissance'}
          </AppText>
        </View>
        <IconButton
          icon="ellipsis-horizontal"
          label="Queue details"
          onPress={() => router.push('/music')}
        />
      </View>

      {!current ? (
        <View style={{ padding: 20 }}>
          <EmptyState
            icon="musical-notes-outline"
            title="Nothing playing yet"
            message="Pick a release from the music library and it will keep playing while you move around the app."
            actionLabel="Open music"
            onAction={() => router.replace('/music')}
          />
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 24, gap: 14 }}>
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Artwork gradient={trackGradient(current.id)} title={album?.title} size={artSize} radius={26} />
          </View>

          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText variant="title" numberOfLines={1} style={{ flex: 1 }}>
                {current.title}
              </AppText>
              <Chip
                label={current.unreleased ? 'Unreleased' : 'Preview'}
                size="sm"
                tone={current.unreleased ? 'gold' : 'neutral'}
              />
            </View>
            <AppText variant="small" color="textMuted">
              {current.artist} · {album?.kind ?? 'Single'}
            </AppText>
          </View>

          {player.error ? (
            <Pressable onPress={player.clearError} accessibilityRole="button" accessibilityLabel="Dismiss error">
              <Card tone="alt" style={{ gap: 2 }}>
                <AppText variant="small" style={{ color: theme.colors.danger }}>
                  {player.error}
                </AppText>
                <AppText variant="small" color="textFaint">
                  Tap to dismiss
                </AppText>
              </Card>
            </Pressable>
          ) : null}

          <View style={{ gap: 2 }}>
            <Slider
              value={shownProgress}
              onChange={(next) => setScrub(next)}
              onChangeEnd={(next) => {
                setScrub(null);
                void player.seek(next * player.durationSec);
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="small" color="textFaint">
                {formatDuration(shownProgress * player.durationSec)}
              </AppText>
              <AppText variant="small" color="textFaint">
                {formatDuration(player.durationSec)}
              </AppText>
            </View>
          </View>

          <View style={styles.controls}>
            <IconButton
              icon={favorite ? 'heart' : 'heart-outline'}
              label={favorite ? 'Remove from saved' : 'Save track'}
              size={22}
              color={favorite ? theme.colors.accent : theme.colors.textMuted}
              onPress={() => toggleFavorite(current.id)}
            />
            <IconButton
              icon="play-skip-back"
              label="Previous track"
              size={26}
              disabled={!player.canSkipPrevious}
              onPress={player.previous}
            />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Pressable
                onPress={player.toggle}
                accessibilityRole="button"
                accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}
                style={({ pressed }) => [
                  styles.playButton,
                  { backgroundColor: theme.colors.accent, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons
                  name={player.isPlaying ? 'pause' : 'play'}
                  size={30}
                  color={theme.colors.accentText}
                  style={{ marginLeft: player.isPlaying ? 0 : 3 }}
                />
              </Pressable>
              {player.isBuffering ? (
                <AppText variant="label" color="textFaint">
                  BUFFERING
                </AppText>
              ) : null}
            </View>
            <IconButton
              icon="play-skip-forward"
              label="Next track"
              size={26}
              disabled={!player.canSkipNext}
              onPress={player.next}
            />
            <IconButton
              icon={downloads.isDownloaded(current.id) ? 'checkmark-circle' : 'download-outline'}
              label={downloads.isDownloaded(current.id) ? 'Downloaded' : 'Download for offline'}
              size={22}
              color={downloads.isDownloaded(current.id) ? theme.colors.success : theme.colors.textMuted}
              onPress={() => void downloads.download(current)}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="volume-low" size={16} color={theme.colors.textFaint} />
            <View style={{ flex: 1 }}>
              <Slider
                value={player.volume}
                onChange={player.setVolume}
                height={18}
                color={theme.colors.textMuted}
              />
            </View>
            <Ionicons name="volume-high" size={16} color={theme.colors.textFaint} />
          </View>

          {upNext.length > 0 ? (
            <View style={{ gap: 4, paddingBottom: insets.bottom + 16 }}>
              <AppText variant="label" color="textFaint">
                UP NEXT
              </AppText>
              {upNext.map((track) => (
                <TrackRow key={track.id} track={track} queue={player.queue} showAlbum />
              ))}
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  playButton: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
});
