import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Avatar, Chip, Pill } from '@/components/Elements';
import { TextArea } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card, Divider } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { useToast } from '@/components/Toast';
import { ARTIST_ID } from '@/data/communitySeed';
import { ChallengeBlock } from '@/features/community/ChallengeBlock';
import { PollBlock } from '@/features/community/PollBlock';
import { ReportDialog } from '@/features/community/ReportDialog';
import { useCommunityStore, useModerationActive } from '@/features/community/useCommunityStore';
import { analyzeContent, reasonMessage } from '@/features/community/moderation';
import type { CommunityComment, ReportReason } from '@/features/community/types';
import { useAuthStore, useIsSignedIn } from '@/features/auth/useAuthStore';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { relativeTime, toDayKey } from '@/lib/date';
import { useTheme } from '@/theme';

export default function PostScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const grant = useRewardGrant();
  const { id } = useLocalSearchParams<{ id: string }>();
  const canModerate = useModerationActive();
  const isSignedIn = useIsSignedIn();
  const profile = useAuthStore((state) => state.profile);
  const userId = useAuthStore((state) => state.account?.id ?? 'guest');

  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const votes = useCommunityStore((state) => state.votes);
  const voteCounts = useCommunityStore((state) => state.voteCounts);
  const filterTerms = useCommunityStore((state) => state.filterTerms);
  const policy = useCommunityStore((state) => state.policy);
  const addComment = useCommunityStore((state) => state.addComment);
  const castVote = useCommunityStore((state) => state.vote);
  const reportTarget = useCommunityStore((state) => state.reportTarget);
  const removeComment = useCommunityStore((state) => state.removeComment);
  const removePost = useCommunityStore((state) => state.removePost);
  const claimedKeys = useRewardsStore((state) => state.state.seenKeys);

  const entries = useJournalStore((state) => state.entries);
  const completedListens = useLibraryStore((state) => state.completedListens);

  const [reply, setReply] = useState('');
  const [dialog, setDialog] = useState<{ type: 'post' | 'comment'; comment?: CommunityComment } | null>(null);

  const post = posts.find((item) => item.id === String(id));
  if (!post || (post.hidden && !canModerate)) {
    return (
      <Screen back title="Thread" bottomInset={40}>
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="Thread unavailable"
          message="This post was removed or no longer exists. The rest of the community is still here."
          actionLabel="Back to community"
          onAction={() => router.replace('/community')}
        />
      </Screen>
    );
  }

  const threadComments = comments
    .filter((comment) => comment.postId === post.id && (!comment.hidden || canModerate))
    .sort((a, b) => a.createdAt - b.createdAt);

  const verdict = reply.trim()
    ? analyzeContent(reply, filterTerms, policy, {
        recentTexts: threadComments.slice(-8).map((comment) => comment.body),
      })
    : null;

  const streak = summarizeStreak(Object.keys(entries), toDayKey());
  const metrics: Record<string, number> = {
    journalStreak: streak.current,
    journalEntries: Object.keys(entries).length,
    listens: completedListens,
  };
  const challenge = post.challenge;
  const challengeCurrent = challenge ? metrics[challenge.metric] ?? 0 : 0;

  const submitReply = () => {
    if (!isSignedIn) {
      router.push('/auth');
      return;
    }
    if (verdict && !verdict.allowed) {
      toast.show(reasonMessage(verdict.reasons[0]), 'error');
      return;
    }
    const result = addComment({
      postId: post.id,
      body: reply,
      authorId: userId,
      authorName: profile.displayName,
    });
    if (!result.ok) {
      toast.show(
        result.error ?? (result.verdict ? reasonMessage(result.verdict.reasons[0]) : 'Reply was blocked.'),
        'error'
      );
      return;
    }
    setReply('');
    grant('comment', { key: undefined });
    toast.show('Reply posted', 'success');
  };

  const submitReport = (reason: ReportReason, note?: string) => {
    if (!dialog) return;
    const targetLabel = dialog.type === 'post' ? post.title ?? post.body : dialog.comment?.body ?? '';
    reportTarget({
      targetType: dialog.type,
      targetId: dialog.type === 'post' ? post.id : dialog.comment?.id ?? '',
      targetAuthor:
        dialog.type === 'post' ? post.authorName : dialog.comment?.authorName ?? 'Unknown',
      excerpt: targetLabel,
      reason,
      note,
    });
    toast.show('Report sent to the moderator queue.', 'success');
    setDialog(null);
  };

  return (
    <Screen back title="Thread" eyebrow={post.authorName} bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar
            name={post.authorName}
            color={post.authorIsArtist ? theme.colors.accent : theme.colors.surfaceHi}
            size={38}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText variant="smallMedium">{post.authorName}</AppText>
              {post.authorId === ARTIST_ID ? <Pill text="Artist" tone="accent" /> : null}
            </View>
            <AppText variant="label" color="textFaint">
              {post.kind.toUpperCase()} · {relativeTime(post.createdAt).toUpperCase()}
            </AppText>
          </View>
          {post.hidden ? <Chip label="Hidden" size="sm" tone="danger" /> : null}
        </View>

        {post.title ? <AppText variant="title">{post.title}</AppText> : null}
        <AppText variant="body" color="textMuted">
          {post.body}
        </AppText>

        {post.poll ? (
          <PollBlock
            post={post}
            vote={votes[post.id]}
            counts={voteCounts[post.id]}
            onVote={(optionId) => {
              const result = castVote(post.id, optionId);
              if (result.ok) grant('poll-vote', { key: post.id });
            }}
          />
        ) : null}

        {challenge ? (
          <ChallengeBlock
            challenge={challenge}
            progress={{
              current: challengeCurrent,
              target: challenge.target,
              complete: challengeCurrent >= challenge.target,
            }}
            claimed={claimedKeys.includes(`challenge-complete:${post.id}`)}
            onClaim={() => grant('challenge-complete', { key: post.id, note: post.title })}
          />
        ) : null}

        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Pressable
            onPress={() => setDialog({ type: 'post' })}
            accessibilityRole="button"
            accessibilityLabel="Report this post"
            style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}
          >
            <Ionicons name="flag-outline" size={15} color={theme.colors.textFaint} />
            <AppText variant="small" color="textFaint">Report</AppText>
          </Pressable>
          {canModerate ? (
            <Pressable
              onPress={() => {
                removePost(post.id, 'Removed from thread by moderator');
                toast.show('Post hidden from the feed.', 'success');
              }}
              accessibilityRole="button"
              accessibilityLabel="Remove post"
              style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}
            >
              <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
              <AppText variant="small" style={{ color: theme.colors.danger }}>
                Remove post
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">
          {threadComments.length} {threadComments.length === 1 ? 'reply' : 'replies'}
        </AppText>
        <Divider />
        {threadComments.length === 0 ? (
          <AppText variant="small" color="textMuted">
            No replies yet. Keep it respectful — the word filter is on.
          </AppText>
        ) : (
          threadComments.map((comment, index) => (
            <View key={comment.id} style={{ gap: 10 }}>
              {index > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Avatar name={comment.authorName} size={28} />
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AppText variant="smallMedium">{comment.authorName}</AppText>
                    <AppText variant="label" color="textFaint">
                      {relativeTime(comment.createdAt).toUpperCase()}
                    </AppText>
                    {comment.hidden ? <Chip label="Hidden" size="sm" tone="danger" /> : null}
                  </View>
                  <AppText variant="small" color={comment.hidden ? 'textFaint' : 'textMuted'}>
                    {comment.body}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable
                      onPress={() => setDialog({ type: 'comment', comment })}
                      accessibilityRole="button"
                      accessibilityLabel="Report comment"
                    >
                      <AppText variant="label" color="textFaint">
                        REPORT
                      </AppText>
                    </Pressable>
                    {canModerate && !comment.hidden ? (
                      <Pressable
                        onPress={() => {
                          removeComment(comment.id, 'Removed from thread by moderator');
                          toast.show('Comment removed.', 'success');
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Remove comment"
                      >
                        <AppText variant="label" style={{ color: theme.colors.danger }}>
                          REMOVE
                        </AppText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card style={{ gap: 8 }}>
        <AppText variant="smallMedium">
          {isSignedIn ? 'Add a reply' : 'Sign in to reply'}
        </AppText>
        {isSignedIn ? (
          <>
            <TextArea
              value={reply}
              onChangeText={setReply}
              placeholder="Say something useful…"
              minHeight={90}
              error={verdict && !verdict.allowed ? reasonMessage(verdict.reasons[0]) : undefined}
              hint={`${reply.length}/2000 · filtered before posting`}
            />
            <Button
              label="Post reply"
              icon="send"
              size="sm"
              disabled={reply.trim().length < 3}
              onPress={submitReply}
            />
          </>
        ) : (
          <Button label="Sign in" size="sm" onPress={() => router.push('/auth')} />
        )}
      </Card>

      <ReportDialog
        visible={Boolean(dialog)}
        targetLabel={dialog?.type === 'comment' ? 'comment' : 'post'}
        onClose={() => setDialog(null)}
        onSubmit={submitReport}
      />
    </Screen>
  );
}
