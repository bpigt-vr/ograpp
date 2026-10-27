import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { ALBUMS, getTrack } from '@/data/tracks';
import { quoteForDay } from '@/data/quotes';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { HeroSection } from '@/features/home/HeroSection';
import { DailyQuoteCard, MembershipCard, MerchRail, RewardsStrip } from '@/features/home/HomeCards';
import {
  AnnouncementHighlight,
  ContinueListening,
  PollHighlight,
  ReleaseHighlight,
} from '@/features/home/HomeSections';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { getPlan, nextTier, tierAtLeast } from '@/features/membership/plans';
import { usePlayer } from '@/features/music/PlayerProvider';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { levelProgress } from '@/features/rewards/engine';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { toDayKey } from '@/lib/date';
import { openExternal } from '@/lib/links';
import { BRAND_TAGLINE, SITE } from '@/lib/site';
import { useTheme } from '@/theme';

const mark = require('../../../assets/images/brand-mark.png');

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const player = usePlayer();

  const profile = useAuthStore((state) => state.profile);
  const membership = useAuthStore((state) => state.membership);
  const posts = useCommunityStore((state) => state.posts);
  const blockedUsers = useCommunityStore((state) => state.blockedUsers);
  const entries = useJournalStore((state) => state.entries);
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const rewards = useRewardsStore((state) => state.state);

  const today = toDayKey();
  const quote = quoteForDay(today);
  const streak = summarizeStreak(Object.keys(entries), today);
  const level = levelProgress(rewards.lifetimePoints);
  const plan = getPlan(membership.tier);
  const upgrade = nextTier(membership.tier);

  const visible = posts.filter(
    (post) => !post.hidden && !blockedUsers.some((user) => user.id === post.authorId)
  );
  const announcement =
    visible.find((post) => post.kind === 'announcement' && post.pinned) ??
    visible.find((post) => post.kind === 'announcement');
  const poll = visible.find((post) => post.kind === 'poll');
  const album = ALBUMS[0];
  const recentTracks = recentlyPlayed
    .map((id) => getTrack(id))
    .filter((track): track is NonNullable<ReturnType<typeof getTrack>> => Boolean(track))
    .slice(0, 3);

  const blurb = tierAtLeast(membership.tier, 'top01')
    ? 'Downloads, unreleased music and a personal thank-you video are unlocked.'
    : upgrade
      ? `Next: ${getPlan(upgrade).name} — ${getPlan(upgrade).perks
          .filter((perk) => perk.status === 'confirmed')
          .slice(0, 2)
          .map((perk) => perk.label)
          .join(' · ')}.`
      : 'You are on the free plan — unlimited streaming, always.';

  return (
    <Screen padded={false} bottomInset={150} contentStyle={{ gap: theme.spacing.lg }}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={mark} style={{ width: 30, height: 30 }} contentFit="contain" />
          <View>
            <AppText variant="label" color="textMuted">
              OVERGROWTH RENAISSANCE
            </AppText>
            <AppText variant="smallMedium">OGR-Scintilla</AppText>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Avatar name={profile.displayName} color={profile.avatarColor} size={36} ring />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        <HeroSection planName={plan.name} onMembership={() => router.push('/membership')} />
        <DailyQuoteCard
          quote={quote.text}
          streak={streak.current}
          hasEntryToday={Boolean(entries[today])}
          onWrite={() => router.push('/journal/write')}
          onHistory={() => router.push('/journal/history')}
        />
        <RewardsStrip
          points={rewards.points}
          lifetimePoints={rewards.lifetimePoints}
          progress={level.progress}
          level={level.level}
          nextName={level.nextName}
          nextFloor={level.nextFloor}
          onOpen={() => router.push('/rewards')}
        />
        <ContinueListening tracks={recentTracks} onOpenLibrary={() => router.push('/music')} />
        <ReleaseHighlight
          album={album}
          onOpen={() => router.push(`/album/${album.id}`)}
          onPlay={() => void player.play(album.tracks[0], album.tracks)}
        />
        {announcement ? (
          <AnnouncementHighlight
            post={announcement}
            onOpenCommunity={() => router.push('/community')}
          />
        ) : null}
        {poll ? <PollHighlight post={poll} onOpen={() => router.push('/community')} /> : null}
        <MembershipCard
          planName={plan.name}
          status={membership.status}
          blurb={blurb}
          onPlans={() => router.push('/membership')}
          onWebsite={() => void openExternal(SITE.membership)}
        />
        <MerchRail
          onOpenStore={() => router.push('/store')}
          onOpenProduct={(id) => router.push(`/store/product/${id}`)}
        />
        <AppText variant="small" color="textFaint" align="center">
          {BRAND_TAGLINE}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
});
