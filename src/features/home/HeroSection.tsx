import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Elements';
import { FEATURED_TRACK, ALBUMS } from '@/data/tracks';
import { usePlayer } from '@/features/music/PlayerProvider';
import { useTheme } from '@/theme';

const mark = require('../../../assets/images/brand-mark.png');

export function HeroSection({
  planName,
  onMembership,
}: {
  planName: string;
  onMembership: () => void;
}) {
  const theme = useTheme();
  const player = usePlayer();
  const isFeatured = player.current?.id === FEATURED_TRACK.id;

  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={['#FF9A4D', '#D93A0B', '#3A0D05']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={mark}
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          right: -84,
          top: -54,
          opacity: 0.45,
        }}
        contentFit="contain"
      />
      <View style={styles.heroInner}>
        <Pill text={planName} tone="gold" />
        <View style={{ gap: 6 }}>
          <AppText
            style={{
              color: '#FFF6EA',
              fontFamily: theme.fonts.display,
              fontSize: 30,
              lineHeight: 33,
              letterSpacing: 0.3,
            }}
          >
            BE THE GREATEST{'\n'}YOU CAN BE.
          </AppText>
          <AppText variant="small" style={{ color: 'rgba(255,246,234,0.84)' }}>
            Music, reflections and the Hoser Gang — one place.
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
          <Button
            label={isFeatured && player.isPlaying ? 'Pause' : 'Play featured'}
            icon={isFeatured && player.isPlaying ? 'pause' : 'play'}
            size="sm"
            onPress={() => {
              if (isFeatured) {
                player.toggle();
              } else {
                void player.play(FEATURED_TRACK, ALBUMS.flatMap((album) => album.tracks));
              }
            }}
          />
          <Button
            label="Membership"
            variant="ghost"
            size="sm"
            icon="ribbon-outline"
            onPress={onMembership}
            style={{ borderColor: 'rgba(255,246,234,0.4)' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 26, overflow: 'hidden', minHeight: 252 },
  heroInner: { padding: 20, gap: 10, justifyContent: 'space-between', flex: 1 },
});
