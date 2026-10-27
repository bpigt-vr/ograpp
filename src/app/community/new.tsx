import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { TextArea, TextField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { analyzeContent, reasonMessage } from '@/features/community/moderation';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import type { CommunityPostKind } from '@/features/community/types';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { useTheme } from '@/theme';

type Kind = Extract<CommunityPostKind, 'discussion' | 'remix'>;

export default function NewPostScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const grant = useRewardGrant();
  const profile = useAuthStore((state) => state.profile);
  const userId = useAuthStore((state) => state.account?.id ?? null);
  const terms = useCommunityStore((state) => state.filterTerms);
  const policy = useCommunityStore((state) => state.policy);
  const createPost = useCommunityStore((state) => state.createPost);
  const guidelinesAcceptedAt = useCommunityStore((state) => state.guidelinesAcceptedAt);
  const posts = useCommunityStore((state) => state.posts);

  const [kind, setKind] = useState<Kind>('discussion');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const verdict = useMemo(
    () =>
      body.trim()
        ? analyzeContent(body, terms, policy, {
            recentTexts: posts.slice(0, 10).map((post) => post.body),
          })
        : null,
    [body, terms, policy, posts]
  );

  if (!userId) {
    return (
      <Screen back title="New post" bottomInset={40}>
        <Card style={{ gap: 8 }}>
          <AppText variant="subheading">Sign in to post</AppText>
          <AppText variant="small" color="textMuted">
            Reading the community is open to everyone. Posting needs an account so moderation and
            rewards can be tied to a real member.
          </AppText>
          <Button label="Sign in or create an account" onPress={() => router.replace('/auth')} />
        </Card>
      </Screen>
    );
  }

  if (!guidelinesAcceptedAt) {
    return (
      <Screen back title="New post" bottomInset={40}>
        <Card style={{ gap: 8 }}>
          <AppText variant="subheading">Accept the guidelines first</AppText>
          <AppText variant="small" color="textMuted">
            One minute of reading keeps the space usable for everyone.
          </AppText>
          <Button label="Read guidelines" onPress={() => router.replace('/community/guidelines')} />
        </Card>
      </Screen>
    );
  }

  const submit = () => {
    if (verdict && !verdict.allowed) {
      toast.show(reasonMessage(verdict.reasons[0]), 'error');
      return;
    }
    const result = createPost({
      kind,
      title: title.trim() || undefined,
      body,
      authorId: userId,
      authorName: profile.displayName,
    });
    if (!result.ok) {
      toast.show(
        result.error ?? (result.verdict ? reasonMessage(result.verdict.reasons[0]) : 'Post blocked.'),
        'error'
      );
      return;
    }
    grant('post', { key: result.postId });
    toast.show('Posted to the community', 'success');
    router.replace('/community');
  };

  return (
    <Screen back title="New post" eyebrow="Community" bottomInset={40}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip
          label="Discussion"
          icon="chatbubble-outline"
          selected={kind === 'discussion'}
          onPress={() => setKind('discussion')}
        />
        <Chip
          label="Remix idea"
          icon="musical-notes-outline"
          selected={kind === 'remix'}
          onPress={() => setKind('remix')}
        />
      </View>

      <TextField
        label="Title (optional)"
        value={title}
        onChangeText={setTitle}
        placeholder="Give it a headline"
        maxLength={90}
      />

      <TextArea
        label="Your post"
        value={body}
        onChangeText={setBody}
        placeholder={
          kind === 'remix'
            ? 'Which track should get a remix, and what would you change?'
            : 'Share a thought, a question or a win…'
        }
        minHeight={150}
        error={verdict && !verdict.allowed ? reasonMessage(verdict.reasons[0]) : undefined}
        hint={`${body.length}/${policy.maxLength} · filtered before it appears`}
      />

      {verdict && verdict.matched.length > 0 && verdict.allowed ? (
        <Card tone="alt" style={{ gap: 4 }}>
          <AppText variant="small" color="gold">
            Some words were masked by the filter.
          </AppText>
          <AppText variant="small" color="textFaint">
            {verdict.sanitized}
          </AppText>
        </Card>
      ) : null}

      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.success} />
          <AppText variant="smallMedium">Pre-flight check</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          {verdict == null
            ? 'Start typing and the filter will check your post as you write.'
            : verdict.allowed
              ? 'Looks clean. Respectful disagreement is welcome; personal attacks are not.'
              : `Blocked: ${verdict.reasons.map(reasonMessage).join(' ')}`}
        </AppText>
      </Card>

      <Button
        label="Post to community"
        icon="send"
        fullWidth
        disabled={body.trim().length < 3 || Boolean(verdict && !verdict.allowed)}
        onPress={submit}
      />
    </Screen>
  );
}
