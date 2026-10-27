import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Avatar, Chip, Pill, ProgressBar, Stat } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, Divider, ListRow, SectionHeader } from '@/components/Surfaces';
import { getTrack } from '@/data/tracks';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { getPlan } from '@/features/membership/plans';
import { TrackRow } from '@/features/music/TrackRow';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { levelProgress } from '@/features/rewards/engine';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { toDayKey } from '@/lib/date';
import { openExternal } from '@/lib/links';
import { SITE } from '@/lib/site';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const account = useAuthStore((state) => state.account);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const membership = useAuthStore((state) => state.membership);
  const signOut = useAuthStore((state) => state.signOut);
  const entries = useJournalStore((state) => state.entries);
  const goals = useJournalStore((state) => state.goals);
  const favorites = useLibraryStore((state) => state.favoriteTrackIds);
  const rewards = useRewardsStore((state) => state.state);
  const blocked = useCommunityStore((state) => state.blockedUsers);
  const posts = useCommunityStore((state) => state.posts);

  const plan = getPlan(membership.tier);
  const streak = summarizeStreak(Object.keys(entries), toDayKey());
  const level = levelProgress(rewards.lifetimePoints);
  const savedTracks = favorites
    .map((id) => getTrack(id))
    .filter((track): track is NonNullable<ReturnType<typeof getTrack>> => Boolean(track))
    .slice(0, 3);
  const myPosts = account ? posts.filter((post) => post.authorId === account.id).length : 0;
  const signedIn = Boolean(account && session);

  return (
    <Screen title="Profile" eyebrow="Your corner" bottomInset={150}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={profile.displayName} color={profile.avatarColor} size={58} ring />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="heading" numberOfLines={1}>
              {profile.displayName}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill text={membership.status === 'preview' ? 'Preview membership' : plan.name} tone="accent" />
              <Chip label={`Level ${level.level}`} size="sm" icon="trophy-outline" />
            </View>
            <AppText variant="small" color="textFaint" numberOfLines={1}>
              {signedIn ? account?.email : 'Browsing as a guest'}
            </AppText>
          </View>
        </View>

        <ProgressBar value={level.progress} height={7} />
        <AppText variant="small" color="textMuted">
          {level.nextFloor
            ? `${formatNumber(level.nextFloor - rewards.lifetimePoints)} points to ${level.nextName}`
            : 'Top level reached.'}
        </AppText>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stat label="Entries" value={`${Object.keys(entries).length}`} icon="book-outline" />
          <Stat label="Streak" value={`${streak.current}d`} icon="flame-outline" color="accent" />
          <Stat label="Points" value={formatNumber(rewards.points)} icon="sparkles-outline" color="gold" />
          <Stat label="Goals" value={`${goals.filter((goal) => goal.completedAt).length}`} icon="flag-outline" color="success" />
        </View>

        {!signedIn ? (
          <Button
            label="Sign in or create an account"
            icon="person-add-outline"
            onPress={() => router.push('/auth')}
          />
        ) : (
          <Button
            label="Manage account"
            variant="secondary"
            icon="settings-outline"
            onPress={() => router.push('/settings/account')}
          />
        )}
      </Card>

      <View>
        <SectionHeader title="Your library" actionLabel="All music" onAction={() => router.push('/music')} />
        {savedTracks.length === 0 ? (
          <Card>
            <AppText variant="small" color="textMuted">
              Nothing saved yet. Tap the heart on any track to build your library.
            </AppText>
          </Card>
        ) : (
          <Card padded={false} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            {savedTracks.map((track) => (
              <TrackRow key={track.id} track={track} queue={savedTracks} showAlbum />
            ))}
          </Card>
        )}
      </View>

      <View>
        <SectionHeader title="Membership & rewards" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Membership plans" subtitle={plan.name} icon="ribbon-outline" onPress={() => router.push('/membership')} />
          <Divider />
          <ListRow
            title="Rewards dashboard"
            subtitle={`${formatNumber(rewards.points)} points · ${rewards.unlockedBadgeIds.length} badges`}
            icon="trophy-outline"
            onPress={() => router.push('/rewards')}
          />
          <Divider />
          <ListRow
            title="Wallpapers"
            subtitle={`${rewards.unlockedWallpaperIds?.length ?? 0} unlocked`}
            icon="image-outline"
            onPress={() => router.push('/rewards')}
          />
        </Card>
      </View>

      <View>
        <SectionHeader title="Growth" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Journal history" subtitle={`${Object.keys(entries).length} entries`} icon="book-outline" onPress={() => router.push('/journal/history')} />
          <Divider />
          <ListRow title="Goals" subtitle={`${goals.filter((goal) => !goal.completedAt).length} in progress`} icon="flag-outline" onPress={() => router.push('/journal/goals')} />
          <Divider />
          <ListRow title="Daily reminder" subtitle="Optional, local-only" icon="notifications-outline" onPress={() => router.push('/settings/notifications')} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Community" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Community guidelines" icon="document-text-outline" onPress={() => router.push('/community/guidelines')} />
          <Divider />
          <ListRow title="Blocked accounts" subtitle={`${blocked.length} blocked`} icon="eye-off-outline" onPress={() => router.push('/community/guidelines')} />
          <Divider />
          <ListRow title="Your posts" subtitle={`${myPosts} posts`} icon="chatbubble-outline" onPress={() => router.push('/community')} />
          <Divider />
          <ListRow title="Moderator tools" subtitle="Passphrase required" icon="shield-checkmark-outline" onPress={() => router.push('/moderation')} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Settings" />
        <Card style={{ gap: 2 }}>
          <ListRow title="App settings" subtitle="Theme, haptics, data" icon="settings-outline" onPress={() => router.push('/settings')} />
          <Divider />
          <ListRow title="Privacy & data" icon="lock-closed-outline" onPress={() => router.push('/settings/privacy')} />
          <Divider />
          <ListRow title="Notification preferences" icon="notifications-outline" onPress={() => router.push('/settings/notifications')} />
          <Divider />
          <ListRow title="Account" icon="person-circle-outline" onPress={() => router.push('/settings/account')} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Official links" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Music streaming" icon="musical-notes-outline" onPress={() => void openExternal(SITE.music)} />
          <Divider />
          <ListRow title="Merch store" icon="bag-handle-outline" onPress={() => void openExternal(SITE.merch)} />
          <Divider />
          <ListRow title="Membership on the website" icon="ribbon-outline" onPress={() => void openExternal(SITE.membership)} />
          <Divider />
          <ListRow title="Support the run" icon="heart-outline" onPress={() => void openExternal(SITE.donate)} />
        </Card>
      </View>

      {signedIn ? (
        <Button label="Sign out" variant="ghost" icon="log-out-outline" fullWidth onPress={signOut} />
      ) : null}

      <AppText variant="small" color="textFaint" align="center">
        Overgrowth Renaissance · v1.0.0 · {theme.mode} theme
      </AppText>
    </Screen>
  );
}
