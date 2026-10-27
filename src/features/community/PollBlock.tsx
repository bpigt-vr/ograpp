import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/Elements';
import type { CommunityPost, PollVote } from '@/features/community/types';
import { formatNumber } from '@/lib/format';
import { useNow } from '@/lib/clock';
import { useTheme } from '@/theme';

export function PollBlock({
  post,
  vote,
  counts,
  onVote,
}: {
  post: CommunityPost;
  vote?: PollVote;
  counts?: Record<string, number>;
  onVote: (optionId: string) => void;
}) {
  const theme = useTheme();
  const now = useNow();
  if (!post.poll) return null;
  const total = Object.values(counts ?? {}).reduce((sum, value) => sum + value, 0);
  const closed = Boolean(post.poll.closesAt && now > post.poll.closesAt);

  return (
    <View style={{ gap: 8 }}>
      {post.poll.options.map((option) => {
        const votes = counts?.[option.id] ?? 0;
        const share = total > 0 ? votes / total : 0;
        const selected = vote?.optionId === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onVote(option.id)}
            disabled={closed}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: closed }}
            accessibilityLabel={`${option.label}, ${votes} votes`}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected ? theme.colors.accent : theme.colors.border,
              backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surfaceAlt,
              padding: 10,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={selected ? theme.colors.accent : theme.colors.textFaint}
              />
              <AppText variant="smallMedium" style={{ flex: 1 }} numberOfLines={2}>
                {option.label}
              </AppText>
              <AppText variant="small" color="textFaint">
                {total > 0 ? `${Math.round(share * 100)}%` : '—'}
              </AppText>
            </View>
            <ProgressBar value={share} height={4} />
          </Pressable>
        );
      })}
      <AppText variant="small" color="textFaint">
        {total === 0 ? 'No votes yet — be first.' : `${formatNumber(total)} votes`}
        {closed ? ' · poll closed' : vote ? ' · tap another option to change your vote' : ''}
      </AppText>
    </View>
  );
}
