import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar, Chip, Pill } from '@/components/Elements';
import { Card } from '@/components/Surfaces';
import { ARTIST_ID } from '@/data/communitySeed';
import { ChallengeBlock } from '@/features/community/ChallengeBlock';
import { PollBlock } from '@/features/community/PollBlock';
import type { CommunityPost, PollVote } from '@/features/community/types';
import { relativeTime } from '@/lib/date';
import { useTheme } from '@/theme';

const KIND_LABEL: Record<CommunityPost['kind'], string> = {
  announcement: 'ANNOUNCEMENT',
  discussion: 'DISCUSSION',
  poll: 'POLL',
  challenge: 'CHALLENGE',
  remix: 'REMIX IDEA',
};

export type PostCardProps = {
  post: CommunityPost;
  commentCount: number;
  vote?: PollVote;
  counts?: Record<string, number>;
  challengeProgress?: { current: number; target: number; complete: boolean };
  challengeClaimed?: boolean;
  canModerate: boolean;
  onOpen: () => void;
  onVote: (optionId: string) => void;
  onReport: () => void;
  onBlock: () => void;
  onRemove: () => void;
  onClaimChallenge?: () => void;
};

export function PostCard({
  post,
  commentCount,
  vote,
  counts,
  challengeProgress,
  challengeClaimed = false,
  canModerate,
  onOpen,
  onVote,
  onReport,
  onBlock,
  onRemove,
  onClaimChallenge,
}: PostCardProps) {
  const theme = useTheme();
  const action = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, color?: string) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
    >
      <Ionicons name={icon} size={15} color={color ?? theme.colors.textFaint} />
      <AppText variant="small" style={{ color: color ?? theme.colors.textFaint }}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar
          name={post.authorName}
          color={post.authorIsArtist ? theme.colors.accent : theme.colors.surfaceHi}
          size={36}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppText variant="smallMedium" numberOfLines={1}>
              {post.authorName}
            </AppText>
            {post.authorId === ARTIST_ID ? <Pill text="Artist" tone="accent" /> : null}
          </View>
          <AppText variant="label" color="textFaint">
            {KIND_LABEL[post.kind]} · {relativeTime(post.createdAt).toUpperCase()}
          </AppText>
        </View>
        {post.pinned ? <Ionicons name="pin" size={14} color={theme.colors.gold} /> : null}
        {post.memberOnly ? (
          <Chip label="Members" size="sm" tone="gold" icon="ribbon-outline" />
        ) : null}
      </View>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${post.title ?? 'post'}`}
      >
        {post.title ? (
          <AppText variant="subheading" style={{ marginBottom: 4 }}>
            {post.title}
          </AppText>
        ) : null}
        <AppText variant="body" color="textMuted" numberOfLines={6}>
          {post.body}
        </AppText>
      </Pressable>

      {post.poll ? <PollBlock post={post} vote={vote} counts={counts} onVote={onVote} /> : null}

      {post.challenge && challengeProgress ? (
        <ChallengeBlock
          challenge={post.challenge}
          progress={challengeProgress}
          claimed={challengeClaimed}
          onClaim={() => onClaimChallenge?.()}
        />
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {action('chatbubble-outline', `${commentCount}`, onOpen, theme.colors.textMuted)}
        {action('flag-outline', 'Report', onReport)}
        {action('ban-outline', 'Block', onBlock)}
        <View style={{ flex: 1 }} />
        {canModerate ? action('trash-outline', 'Remove', onRemove, theme.colors.danger) : null}
      </View>
    </Card>
  );
}
