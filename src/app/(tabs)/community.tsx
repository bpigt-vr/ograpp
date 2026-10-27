import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, SectionHeader } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { useToast } from '@/components/Toast';
import { PostCard } from '@/features/community/PostCard';
import { ReportDialog } from '@/features/community/ReportDialog';
import {
  activeRestrictionFor,
  useCommunityStore,
  useModerationActive,
} from '@/features/community/useCommunityStore';
import type { CommunityPost, CommunityPostKind, ReportReason } from '@/features/community/types';
import { useAuthStore, useIsSignedIn } from '@/features/auth/useAuthStore';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { toDayKey } from '@/lib/date';
import { useTheme } from '@/theme';

type Filter = 'all' | CommunityPostKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'discussion', label: 'Discussions' },
  { id: 'poll', label: 'Polls' },
  { id: 'challenge', label: 'Challenges' },
  { id: 'remix', label: 'Remix ideas' },
];

export default function CommunityScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const grant = useRewardGrant();
  const isSignedIn = useIsSignedIn();
  const userId = useAuthStore((state) => state.account?.id ?? 'guest');
  const canModerate = useModerationActive();

  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const votes = useCommunityStore((state) => state.votes);
  const voteCounts = useCommunityStore((state) => state.voteCounts);
  const blockedUsers = useCommunityStore((state) => state.blockedUsers);
  const restrictions = useCommunityStore((state) => state.restrictions);
  const guidelinesAcceptedAt = useCommunityStore((state) => state.guidelinesAcceptedAt);
  const reportTarget = useCommunityStore((state) => state.reportTarget);
  const blockUser = useCommunityStore((state) => state.blockUser);
  const unblockUser = useCommunityStore((state) => state.unblockUser);
  const castVote = useCommunityStore((state) => state.vote);
  const removePost = useCommunityStore((state) => state.removePost);
  const claimedKeys = useRewardsStore((state) => state.state.seenKeys);

  const entries = useJournalStore((state) => state.entries);
  const completedListens = useLibraryStore((state) => state.completedListens);

  const [filter, setFilter] = useState<Filter>('all');
  const [dialogPost, setDialogPost] = useState<CommunityPost | null>(null);

  const blockedIds = new Set(blockedUsers.map((user) => user.id));
  const restriction = activeRestrictionFor(userId, restrictions);
  const streak = summarizeStreak(Object.keys(entries), toDayKey());

  const visible = posts.filter(
    (post) => !post.hidden && !blockedIds.has(post.authorId) && (filter === 'all' || post.kind === filter)
  );

  const challengeMetrics: Record<string, number> = {
    journalStreak: streak.current,
    journalEntries: Object.keys(entries).length,
    listens: completedListens,
  };

  const handleVote = (postId: string, optionId: string) => {
    const result = castVote(postId, optionId);
    if (!result.ok) {
      toast.show(result.error ?? 'Could not save that vote.', 'error');
      return;
    }
    grant('poll-vote', { key: postId });
  };

  const handleReport = (reason: ReportReason, note?: string) => {
    if (!dialogPost) return;
    reportTarget({
      targetType: 'post',
      targetId: dialogPost.id,
      targetAuthor: dialogPost.authorName,
      excerpt: dialogPost.title ?? dialogPost.body,
      reason,
      note,
    });
    toast.show('Report sent to the moderator queue.', 'success');
    setDialogPost(null);
  };

  const handleBlock = (post: CommunityPost) => {
    Alert.alert(
      `Block ${post.authorName}?`,
      'Their posts and comments are hidden on this device. You can undo this in community settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockUser(post.authorId, post.authorName);
            toast.show(`${post.authorName} blocked`, 'default');
          },
        },
      ]
    );
  };

  const handleRemove = (post: CommunityPost) => {
    Alert.alert('Remove this post?', 'The author will not be notified. The post moves to the moderation queue.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removePost(post.id, 'Removed from feed by moderator');
          toast.show('Post removed from the feed.', 'success');
        },
      },
    ]);
  };

  return (
    <Screen title="Community" eyebrow="Optional · moderated" bottomInset={150}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip label="Filter on" icon="shield-checkmark" size="sm" tone="success" />
        <Chip label="Report & block" icon="flag-outline" size="sm" />
        <Chip label="Posting is optional" icon="lock-open-outline" size="sm" />
      </View>

      {restriction ? (
        <Card style={{ gap: 6 }} tone="accent">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle" size={15} color={theme.colors.accent} />
            <AppText variant="smallMedium">
              {restriction.kind === 'ban' ? 'Your account is suspended' : 'Posting is paused'}
            </AppText>
          </View>
          <AppText variant="small" color="textMuted">
            {restriction.reason}
            {restriction.until ? ` · until ${new Date(restriction.until).toLocaleDateString()}` : ''}
          </AppText>
        </Card>
      ) : null}

      {!guidelinesAcceptedAt ? (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="document-text-outline" size={16} color={theme.colors.accent} />
            <AppText variant="smallMedium">Read the house rules first</AppText>
          </View>
          <AppText variant="small" color="textMuted">
            Respect people, no slurs, no spam, no selling. The word filter is on and moderators can
            remove content. Accept the guidelines to post — reading is always open.
          </AppText>
          <Button
            label="Community guidelines"
            size="sm"
            onPress={() => router.push('/community/guidelines')}
          />
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => (isSignedIn ? router.push('/community/new') : router.push('/auth'))}
          accessibilityRole="button"
          accessibilityLabel="Start a discussion"
          style={({ pressed }) => [{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.8 : 1,
          }]}
        >
          <Ionicons name="create-outline" size={17} color={theme.colors.accent} />
          <AppText variant="small" color="textFaint">
            {isSignedIn ? 'Share something with the Gang…' : 'Sign in to post'}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => router.push('/community/guidelines')}
          accessibilityRole="button"
          accessibilityLabel="Community settings"
          style={({ pressed }) => [{
            width: 46,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.8 : 1,
          }]}
        >
          <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FILTERS.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            size="sm"
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
          />
        ))}
      </View>

      {blockedUsers.length > 0 ? (
        <Card style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="eye-off-outline" size={15} color={theme.colors.textMuted} />
            <AppText variant="smallMedium">
              {blockedUsers.length} blocked {blockedUsers.length === 1 ? 'account' : 'accounts'}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {blockedUsers.map((user) => (
              <Chip
                key={user.id}
                label={`Unblock ${user.displayName}`}
                size="sm"
                onPress={() => unblockUser(user.id)}
              />
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ gap: 12 }}>
        <SectionHeader title={filter === 'all' ? 'The feed' : FILTERS.find((f) => f.id === filter)?.label ?? 'Feed'} />
        {visible.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Nothing here yet"
            message="No posts in this topic. Start the conversation — or switch filters to see the artist’s announcements."
            actionLabel="Start a discussion"
            onAction={() => (isSignedIn ? router.push('/community/new') : router.push('/auth'))}
          />
        ) : (
          visible.map((post) => {
            const challenge = post.challenge;
            const current = challenge ? challengeMetrics[challenge.metric] ?? 0 : 0;
            return (
              <PostCard
                key={post.id}
                post={post}
                commentCount={comments.filter((comment) => comment.postId === post.id && !comment.hidden).length}
                vote={votes[post.id]}
                counts={voteCounts[post.id]}
                canModerate={canModerate}
                challengeProgress={
                  challenge
                    ? {
                        current,
                        target: challenge.target,
                        complete: current >= challenge.target,
                      }
                    : undefined
                }
                challengeClaimed={claimedKeys.includes(`challenge-complete:${post.id}`)}
                onOpen={() => router.push(`/community/${post.id}`)}
                onVote={(optionId) => handleVote(post.id, optionId)}
                onReport={() => setDialogPost(post)}
                onBlock={() => handleBlock(post)}
                onRemove={() => handleRemove(post)}
                onClaimChallenge={() => grant('challenge-complete', { key: post.id, note: post.title })}
              />
            );
          })
        )}
      </View>

      <Card tone="alt" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.success} />
          <AppText variant="smallMedium">How this space is kept safe</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Every post runs through the word filter before it appears. Reports go to a moderator queue
          with remove, mute and ban tools, and every action is logged. Nothing you write in the
          journal is ever shared here.
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button label="Guidelines" size="sm" variant="ghost" onPress={() => router.push('/community/guidelines')} />
          <Button
            label="Moderator tools"
            size="sm"
            variant="ghost"
            icon="key-outline"
            onPress={() => router.push('/moderation')}
          />
        </View>
      </Card>

      <ReportDialog
        visible={Boolean(dialogPost)}
        targetLabel={dialogPost ? `post by ${dialogPost.authorName}` : 'post'}
        onClose={() => setDialogPost(null)}
        onSubmit={handleReport}
      />
    </Screen>
  );
}
