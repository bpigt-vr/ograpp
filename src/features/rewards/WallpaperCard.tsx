import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Pill } from '@/components/Elements';
import type { Wallpaper } from '@/data/wallpapers';
import { useTheme } from '@/theme';

/**
 * Reward wallpaper card with a phone-shaped preview, unlock cost and save
 * action. Prints feel intentional here: the phone frame sells the reward.
 */
export function WallpaperCard({
  wallpaper,
  unlocked,
  points,
  busy,
  onRedeem,
  onSave,
}: {
  wallpaper: Wallpaper;
  unlocked: boolean;
  points: number;
  busy: boolean;
  onRedeem: () => void;
  onSave: () => void;
}) {
  const theme = useTheme();
  const affordable = points >= wallpaper.cost;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.frame, { borderColor: theme.colors.surfaceHi }]}>
        <Image source={wallpaper.thumb} style={styles.image} contentFit="cover" />
        {!unlocked ? (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={18} color="#FFF6EA" />
          </View>
        ) : null}
      </View>
      <View style={{ width: 148, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText variant="smallMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
            {wallpaper.name}
          </AppText>
          {wallpaper.cost === 0 ? <Pill text="Free" tone="success" /> : null}
        </View>
        <AppText variant="small" color="textFaint" numberOfLines={2}>
          {wallpaper.tagline}
        </AppText>
        {unlocked ? (
          <Pressable
            onPress={onSave}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Save ${wallpaper.name} to photos`}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: theme.colors.accent,
                opacity: pressed || busy ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name={busy ? 'hourglass-outline' : 'download-outline'} size={14} color={theme.colors.accentText} />
            <AppText variant="smallMedium" style={{ color: theme.colors.accentText }}>
              {busy ? 'Saving…' : 'Save to photos'}
            </AppText>
          </Pressable>
        ) : (
          <Pressable
            onPress={onRedeem}
            disabled={!affordable || busy}
            accessibilityRole="button"
            accessibilityLabel={`Unlock ${wallpaper.name} for ${wallpaper.cost} points`}
            accessibilityState={{ disabled: !affordable }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: affordable ? theme.colors.accentSoft : theme.colors.surfaceAlt,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: affordable ? theme.colors.accent : theme.colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name={affordable ? 'sparkles-outline' : 'lock-closed-outline'}
              size={14}
              color={affordable ? theme.colors.accent : theme.colors.textFaint}
            />
            <AppText
              variant="smallMedium"
              style={{ color: affordable ? theme.colors.accent : theme.colors.textFaint }}
            >
              {wallpaper.cost === 0 ? 'Claim free' : `${wallpaper.cost} pts`}
            </AppText>
          </Pressable>
        )}
        {!unlocked && !affordable ? (
          <AppText variant="label" color="textFaint">
            {wallpaper.cost - points} PTS SHORT
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  frame: {
    width: 92,
    height: 186,
    borderRadius: 18,
    borderWidth: 3,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9,8,7,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
});
