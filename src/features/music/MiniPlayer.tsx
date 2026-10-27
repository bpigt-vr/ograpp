import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { trackGradient } from '@/data/tracks';
import { Artwork } from '@/components/Artwork';
import { IconButton } from '@/components/Button';
import { usePlayer } from '@/features/music/PlayerProvider';
import { useTheme } from '@/theme';

/**
 * Persistent mini player rendered above the tab bar. Tapping it opens the
 * full-screen player; playback keeps running while navigating.
 */
export function MiniPlayer() {
  const theme = useTheme();
  const router = useRouter();
  const player = usePlayer();

  if (!player.current) return null;
  const progress =
    player.durationSec > 0 ? Math.min(1, player.positionSec / player.durationSec) : 0;

  const content = (
    <View style={{ backgroundColor: theme.mode === 'dark' ? 'rgba(20,17,16,0.92)' : 'rgba(255,253,248,0.94)' }}>
      <View style={{ height: 2, backgroundColor: theme.colors.surfaceHi }}>
        <View style={{ width: `${progress * 100}%`, height: 2, backgroundColor: theme.colors.accent }} />
      </View>
      <Pressable
        onPress={() => router.push('/player')}
        accessibilityRole="button"
        accessibilityLabel={`Open player. ${player.current.title} by ${player.current.artist}`}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Artwork gradient={trackGradient(player.current.id)} size={40} radius={10} showMark={false} />
        <View style={{ flex: 1 }}>
          <AppText variant="smallMedium" numberOfLines={1}>
            {player.current.title}
          </AppText>
          <AppText variant="label" color="textFaint" numberOfLines={1}>
            {player.isBuffering ? 'BUFFERING…' : player.current.artist.toUpperCase()}
          </AppText>
        </View>
        <IconButton
          icon={player.isPlaying ? 'pause' : 'play'}
          label={player.isPlaying ? 'Pause' : 'Play'}
          onPress={player.toggle}
          size={22}
          color={theme.colors.text}
        />
        {player.canSkipNext ? (
          <IconButton
            icon="play-skip-forward"
            label="Next track"
            onPress={player.next}
            size={20}
            color={theme.colors.text}
          />
        ) : (
          <Ionicons name="chevron-up" size={18} color={theme.colors.textFaint} />
        )}
      </Pressable>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={40} tint={theme.mode === 'dark' ? 'dark' : 'light'} style={styles.shell}>
        {content}
      </BlurView>
    );
  }
  return <View style={[styles.shell, { backgroundColor: theme.colors.bgElevated }]}>{content}</View>;
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: 10,
    marginBottom: 6,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(247,240,228,0.12)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
