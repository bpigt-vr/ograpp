import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { Card } from '@/components/Surfaces';
import type { Album } from '@/data/tracks';
import { formatDuration } from '@/lib/format';
import { useTheme } from '@/theme';

export function AlbumCard({ album, onPress }: { album: Album; onPress: () => void }) {
  const total = album.tracks.reduce((sum, track) => sum + track.durationSec, 0);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${album.title}, ${album.tracks.length} tracks`}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.card]}
    >
      <Artwork gradient={album.gradient} title={album.title} size={168} radius={18} />
      <View style={{ gap: 2, width: 168 }}>
        <AppText variant="smallMedium" numberOfLines={1}>
          {album.title}
        </AppText>
        <AppText variant="label" color="textFaint" numberOfLines={1}>
          {album.kind.toUpperCase()} · {album.tracks.length} TRACKS · {formatDuration(total)}
        </AppText>
      </View>
    </Pressable>
  );
}

export function AlbumHeader({ album }: { album: Album }) {
  const theme = useTheme();
  return (
    <Card style={{ gap: 14 }} tone="alt">
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Artwork gradient={album.gradient} size={104} radius={14} showTitle={false} />
        <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="disc-outline" size={14} color={theme.colors.accent} />
            <AppText variant="label" color="accent">
              {album.kind.toUpperCase()} · {album.year}
            </AppText>
          </View>
          <AppText variant="title">{album.title}</AppText>
          <AppText variant="small" color="textMuted">
            {album.artist}
          </AppText>
        </View>
      </View>
      <AppText variant="small" color="textMuted">
        {album.description}
      </AppText>
      {album.isPreview ? (
        <View style={styles.previewRow}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.gold} />
          <AppText variant="small" color="textMuted" style={{ flex: 1 }}>
            Preview audio. The licensed masters load from the artist’s catalogue once connected.
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, width: 168 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
});
