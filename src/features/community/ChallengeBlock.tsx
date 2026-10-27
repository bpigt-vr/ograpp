import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip, ProgressBar } from '@/components/Elements';
import type { Challenge } from '@/features/community/types';
import { useTheme } from '@/theme';

export function ChallengeBlock({
  challenge,
  progress,
  claimed,
  onClaim,
}: {
  challenge: Challenge;
  progress: { current: number; target: number; complete: boolean };
  claimed: boolean;
  onClaim: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <ProgressBar value={Math.min(1, progress.current / progress.target)} height={6} />
      <AppText variant="small" color="textFaint">
        {progress.current}/{progress.target} · reward {challenge.rewardPoints} pts
      </AppText>
      {progress.complete ? (
        claimed ? (
          <Chip label="Reward claimed" icon="checkmark-circle" size="sm" tone="success" />
        ) : (
          <Pressable
            onPress={onClaim}
            accessibilityRole="button"
            accessibilityLabel="Claim challenge reward"
            style={({ pressed }) => [
              styles.claim,
              { backgroundColor: theme.colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="gift-outline" size={14} color={theme.colors.accentText} />
            <AppText variant="smallMedium" style={{ color: theme.colors.accentText }}>
              Claim {challenge.rewardPoints} points
            </AppText>
          </Pressable>
        )
      ) : (
        <AppText variant="small" color="textMuted">
          Keep showing up — rest days do not reset your streak.
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  claim: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
