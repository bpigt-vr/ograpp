import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { tierAtLeast } from '@/features/membership/plans';
import { formatDuration } from '@/lib/format';
import { useTheme } from '@/theme';
import type { Track } from '@/data/tracks';
import { useLibraryStore } from './useLibraryStore';
import { usePlayer } from './PlayerProvider';

export function TrackRow({
  track,
  queue,
  showAlbum,
  onOpenAlbum,
  onDownload,
  downloading = false,
}: {
  track: Track;
  queue: Track[];
  showAlbum?: boolean;
  onOpenAlbum?: () => void;
  onDownload?: () => void;
  downloading?: boolean;
}) {
  const theme = useTheme();
  const player = usePlayer();
  const tier = useAuthStore((state) => state.membership.tier);
  const favorite = useLibraryStore((state) => state.favoriteTrackIds.includes(track.id));
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const downloaded = useLibraryStore((state) => Boolean(state.downloads[track.id]));
  const isCurrent = player.current?.id === track.id;
  const locked = !tierAtLeast(tier, track.requiresTier);

  return (
    <View
      style={[
        styles.row,
        isCurrent ? { backgroundColor: theme.colors.accentSoft } : null,
      ]}
    >
      <Pressable
        onPress={() => {
          if (isCurrent) {
            player.toggle();
          } else {
            void player.play(track, queue);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`${isCurrent && player.isPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
        style={({ pressed }) => [styles.main, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View
          style={[
            styles.playBadge,
            {
              backgroundColor: isCurrent ? theme.colors.accent : theme.colors.surfaceAlt,
            },
          ]}
        >
          {locked ? (
            <Ionicons name="lock-closed" size={13} color={theme.colors.textMuted} />
          ) : (
            <Ionicons
              name={isCurrent && player.isPlaying ? 'pause' : 'play'}
              size={14}
              color={isCurrent ? theme.colors.accentText : theme.colors.text}
            />
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText
            variant="bodyMedium"
            numberOfLines={1}
            style={{ color: isCurrent ? theme.colors.accent : theme.colors.text }}
          >
            {track.title}
          </AppText>
          <View style={styles.metaRow}>
            <AppText variant="small" color="textFaint" numberOfLines={1}>
              {showAlbum ? track.artist : track.tags[0]}
            </AppText>
            {track.unreleased ? (
              <AppText variant="label" color="gold">
                UNRELEASED
              </AppText>
            ) : null}
            {downloaded ? <Ionicons name="arrow-down-circle" size={12} color={theme.colors.success} /> : null}
          </View>
        </View>
        {onOpenAlbum ? (
          <Ionicons name="albums-outline" size={16} color={theme.colors.textFaint} />
        ) : null}
        <AppText variant="small" color="textFaint">
          {formatDuration(track.durationSec)}
        </AppText>
      </Pressable>
      <Pressable
        onPress={() => toggleFavorite(track.id)}
        accessibilityRole="button"
        accessibilityLabel={favorite ? `Remove ${track.title} from favourites` : `Save ${track.title}`}
        accessibilityState={{ selected: favorite }}
        hitSlop={10}
        style={styles.favorite}
      >
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={18}
          color={favorite ? theme.colors.accent : theme.colors.textFaint}
        />
      </Pressable>
      {onDownload ? (
        <Pressable
          onPress={onDownload}
          disabled={downloading || downloaded}
          accessibilityRole="button"
          accessibilityLabel={downloaded ? `${track.title} downloaded` : `Download ${track.title}`}
          hitSlop={10}
          style={styles.favorite}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <Ionicons
              name={downloaded ? 'checkmark-circle' : 'download-outline'}
              size={18}
              color={downloaded ? theme.colors.success : theme.colors.textFaint}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingRight: 4,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingLeft: 6,
    paddingRight: 8,
  },
  playBadge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  favorite: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
