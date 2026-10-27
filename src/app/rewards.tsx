import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip, ProgressBar, Stat } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, Divider, SectionHeader } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { BADGES, LEVELS } from '@/data/badges';
import { WALLPAPERS } from '@/data/wallpapers';
import { collectRewardStats } from '@/features/rewards/useRewardGrant';
import { badgeProgress, levelProgress, REWARD_RULES } from '@/features/rewards/engine';
import { saveWallpaper } from '@/features/rewards/saveWallpaper';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { WallpaperCard } from '@/features/rewards/WallpaperCard';
import { formatNumber } from '@/lib/format';
import { relativeTime } from '@/lib/date';
import { useTheme } from '@/theme';

const EARN_ORDER = [
  'daily-visit',
  'journal-entry',
  'listen',
  'poll-vote',
  'post',
  'comment',
  'goal-complete',
  'challenge-complete',
  'purchase-verified',
] as const;

export default function RewardsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const rewards = useRewardsStore((state) => state.state);
  const redeemWallpaper = useRewardsStore((state) => state.redeemWallpaper);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = collectRewardStats();
  const level = levelProgress(rewards.lifetimePoints);
  const unlockedWallpapers = rewards.unlockedWallpaperIds ?? [];

  const handleSave = async (wallpaperId: string) => {
    const wallpaper = WALLPAPERS.find((item) => item.id === wallpaperId);
    if (!wallpaper) return;
    setBusyId(wallpaper.id);
    const result = await saveWallpaper(wallpaper);
    setBusyId(null);
    if (!result.ok) {
      toast.show(result.error ?? 'Could not save the wallpaper.', 'error');
      return;
    }
    toast.show(`${wallpaper.name} saved to your photos`, 'success');
    Alert.alert(
      'Set it as your wallpaper',
      'Open Photos → select the image → Share → “Use as Wallpaper” (iOS) or “Set as wallpaper” (Android). Your phone controls the lock screen, so the app hands the image over instead of switching it silently.'
    );
  };

  const handleRedeem = (wallpaperId: string, cost: number) => {
    const result = redeemWallpaper(wallpaperId, cost);
    if (!result.ok) {
      toast.show(result.error ?? 'That redemption is not available.', 'error');
      return;
    }
    toast.show(cost === 0 ? 'Free wallpaper claimed' : 'Wallpaper unlocked', 'reward');
  };

  return (
    <Screen back title="Rewards" eyebrow="Earn it, don’t farm it" bottomInset={40}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textFaint">
              AVAILABLE POINTS
            </AppText>
            <AppText variant="display" style={{ color: theme.colors.accent }}>
              {formatNumber(rewards.points)}
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Chip label={`Level ${level.level} · ${level.name}`} icon="trophy" size="sm" tone="gold" />
            <AppText variant="small" color="textFaint" style={{ marginTop: 4 }}>
              {formatNumber(rewards.lifetimePoints)} lifetime
            </AppText>
          </View>
        </View>
        <ProgressBar value={level.progress} height={10} />
        <AppText variant="small" color="textMuted">
          {level.nextFloor
            ? `${formatNumber(level.nextFloor - rewards.lifetimePoints)} lifetime points to ${level.nextName}.`
            : 'Top level reached. The receipts are undefeated.'}
        </AppText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stat label="Badges" value={`${rewards.unlockedBadgeIds.length}/${BADGES.length}`} icon="ribbon-outline" />
          <Stat label="Wallpapers" value={`${unlockedWallpapers.length}/${WALLPAPERS.length}`} icon="image-outline" />
          <Stat label="Entries" value={`${stats.journalEntries}`} icon="book-outline" />
        </View>
      </Card>

      <View>
        <SectionHeader title="Wallpapers" eyebrow="Redeem with points" />
        <View style={{ gap: 10 }}>
          {WALLPAPERS.map((wallpaper) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              points={rewards.points}
              unlocked={unlockedWallpapers.includes(wallpaper.id) || wallpaper.cost === 0}
              busy={busyId === wallpaper.id}
              onRedeem={() =>
                unlockedWallpapers.includes(wallpaper.id)
                  ? void handleSave(wallpaper.id)
                  : handleRedeem(wallpaper.id, wallpaper.cost)
              }
              onSave={() => void handleSave(wallpaper.id)}
            />
          ))}
        </View>
        <AppText variant="small" color="textFaint" style={{ marginTop: 8 }}>
          Wallpapers are rendered from the official OGR leaf artwork and stored on your device. Nothing
          is uploaded.
        </AppText>
      </View>

      <View>
        <SectionHeader title="Ways to earn" />
        <Card style={{ gap: 4 }}>
          {EARN_ORDER.map((type, index) => {
            const rule = REWARD_RULES[type];
            return (
              <View key={type}>
                {index > 0 ? <Divider style={{ marginVertical: 8 }} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="bodyMedium">{rule.label}</AppText>
                    <AppText variant="small" color="textFaint">
                      {rule.description}
                    </AppText>
                  </View>
                  <AppText variant="smallMedium" color="accent">
                    {type === 'purchase-verified' ? '1 pt / $1' : `+${rule.points}`}
                  </AppText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      <View>
        <SectionHeader title="Badges" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {BADGES.map((badge) => {
            const unlocked = rewards.unlockedBadgeIds.includes(badge.id);
            const progress = badgeProgress(badge, stats, rewards.lifetimePoints);
            return (
              <Card key={badge.id} style={{ ...styles.badge, opacity: unlocked ? 1 : 0.78 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: unlocked ? theme.colors.accentSoft : theme.colors.surfaceAlt,
                    }}
                  >
                    <Ionicons
                      name={badge.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={unlocked ? theme.colors.accent : theme.colors.textFaint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="smallMedium" numberOfLines={1}>
                      {badge.name}
                    </AppText>
                    <AppText variant="label" color={unlocked ? 'success' : 'textFaint'}>
                      {unlocked ? 'UNLOCKED' : `${Math.round(progress * 100)}%`}
                    </AppText>
                  </View>
                </View>
                <AppText variant="small" color="textMuted" numberOfLines={2}>
                  {badge.description}
                </AppText>
                <ProgressBar value={progress} height={5} />
              </Card>
            );
          })}
        </View>
      </View>

      <View>
        <SectionHeader title="Recent activity" />
        {rewards.ledger.length === 0 ? (
          <Card>
            <AppText variant="small" color="textMuted">
              Nothing here yet. Write a reflection or listen to a track to start earning.
            </AppText>
          </Card>
        ) : (
          <Card style={{ gap: 4 }}>
            {rewards.ledger.slice(0, 10).map((entry, index) => (
              <View key={entry.id}>
                {index > 0 ? <Divider style={{ marginVertical: 8 }} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="smallMedium">
                      {REWARD_RULES[entry.type]?.label ?? 'Reward'}
                    </AppText>
                    <AppText variant="small" color="textFaint">
                      {entry.note ? `${entry.note} · ` : ''}
                      {relativeTime(entry.at)}
                    </AppText>
                  </View>
                  <AppText
                    variant="smallMedium"
                    style={{ color: entry.points >= 0 ? theme.colors.success : theme.colors.textMuted }}
                  >
                    {entry.points >= 0 ? '+' : ''}
                    {entry.points}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>

      <Card tone="alt" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.success} />
          <AppText variant="smallMedium">Fair play rules</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Points are capped per action, listening counts once per track per day, poll votes pay once,
          and purchase points require a verified store order. Replaying the same action for points
          will not work — that is by design.
        </AppText>
        <Button label="Membership perks" size="sm" variant="ghost" onPress={() => router.push('/membership')} />
      </Card>

      <Card tone="alt" style={{ gap: 6 }}>
        <AppText variant="label" color="textFaint">
          LEVEL ROADMAP
        </AppText>
        {LEVELS.map((item) => (
          <View key={item.level} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="small" color={item.level === level.level ? 'accent' : 'textMuted'}>
              {item.level}. {item.name}
            </AppText>
            <AppText variant="small" color="textFaint">
              {formatNumber(item.minPoints)} pts
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { width: '48%', gap: 8 },
});
