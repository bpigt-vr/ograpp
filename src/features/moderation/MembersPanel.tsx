import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { TextField } from '@/components/Inputs';
import { Card, Divider } from '@/components/Surfaces';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useTheme } from '@/theme';

export function MembersPanel() {
  const theme = useTheme();
  const restrictions = useCommunityStore((state) => state.restrictions);
  const blockedUsers = useCommunityStore((state) => state.blockedUsers);
  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const restrictMember = useCommunityStore((state) => state.restrictMember);
  const liftRestriction = useCommunityStore((state) => state.liftRestriction);
  const removePost = useCommunityStore((state) => state.removePost);
  const removeComment = useCommunityStore((state) => state.removeComment);

  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [kind, setKind] = useState<'mute' | 'ban'>('mute');
  const [days, setDays] = useState<number | null>(7);
  const [error, setError] = useState<string | null>(null);

  const members = new Map<string, string>();
  for (const post of posts) members.set(post.authorId, post.authorName);
  for (const comment of comments) members.set(comment.authorId, comment.authorName);

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="people" size={16} color={theme.colors.accent} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Community members ({members.size})
          </AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Mute stops posting and replying. Ban hides the account from the community. Both are logged and
          reversible.
        </AppText>
        {Array.from(members.entries()).map(([id, displayName], index) => {
          const restriction = restrictions.find((item) => item.userId === id);
          const authoredPosts = posts.filter((post) => post.authorId === id);
          const authoredComments = comments.filter((comment) => comment.authorId === id);
          return (
            <View key={id} style={{ gap: 6 }}>
              {index > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                  {displayName}
                </AppText>
                {restriction ? (
                  <Chip
                    label={restriction.kind === 'ban' ? 'Banned' : 'Muted'}
                    size="sm"
                    tone="danger"
                  />
                ) : null}
              </View>
              <AppText variant="small" color="textFaint">
                {authoredPosts.length} posts · {authoredComments.length} comments
              </AppText>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {restriction ? (
                  <Button
                    label="Lift restriction"
                    size="sm"
                    variant="secondary"
                    onPress={() => liftRestriction(id)}
                  />
                ) : (
                  <>
                    <Button
                      label="Mute 7 days"
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        restrictMember({
                          userId: id,
                          displayName,
                          kind: 'mute',
                          reason: 'Moderator action',
                          days: 7,
                        })
                      }
                    />
                    <Button
                      label="Ban"
                      size="sm"
                      variant="danger"
                      onPress={() =>
                        restrictMember({
                          userId: id,
                          displayName,
                          kind: 'ban',
                          reason: 'Moderator action',
                          days: null,
                        })
                      }
                    />
                  </>
                )}
                <Button
                  label="Remove their latest post"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    const latest = authoredPosts[0];
                    if (latest) removePost(latest.id, 'Account restriction review');
                  }}
                />
                {authoredComments[0] ? (
                  <Button
                    label="Remove latest comment"
                    size="sm"
                    variant="ghost"
                    onPress={() => removeComment(authoredComments[0].id, 'Account restriction review')}
                  />
                ) : null}
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">Add a restriction manually</AppText>
        <TextField
          label="Display name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          placeholder="Member display name"
        />
        <TextField
          label="Reason"
          value={reason}
          onChangeText={setReason}
          placeholder="Why is this action being taken?"
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Mute" size="sm" selected={kind === 'mute'} onPress={() => setKind('mute')} />
          <Chip label="Ban" size="sm" selected={kind === 'ban'} onPress={() => setKind('ban')} />
          <Chip
            label="Permanent"
            size="sm"
            selected={days === null}
            onPress={() => setDays(null)}
          />
          <Chip label="7 days" size="sm" selected={days === 7} onPress={() => setDays(7)} />
          <Chip label="30 days" size="sm" selected={days === 30} onPress={() => setDays(30)} />
        </View>
        {error ? (
          <AppText variant="small" style={{ color: theme.colors.danger }}>
            {error}
          </AppText>
        ) : null}
        <Button
          label="Apply restriction"
          size="sm"
          icon="ban-outline"
          onPress={() => {
            const trimmed = name.trim();
            if (trimmed.length < 2) {
              setError('Enter the member’s display name.');
              return;
            }
            const match = Array.from(members.entries()).find(([, display]) => display === trimmed);
            restrictMember({
              userId: match?.[0] ?? `manual-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
              displayName: trimmed,
              kind,
              reason: reason.trim() || 'Moderator action',
              days,
            });
            setName('');
            setReason('');
          }}
        />
      </Card>

      <Card style={{ gap: 8 }}>
        <AppText variant="smallMedium">Active restrictions ({restrictions.length})</AppText>
        {restrictions.length === 0 ? (
          <AppText variant="small" color="textMuted">
            No mutes or bans. Community members are in good standing.
          </AppText>
        ) : (
          restrictions.map((item) => (
            <View key={`${item.userId}-${item.createdAt}`} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="bodyMedium" style={{ flex: 1 }}>
                  {item.displayName}
                </AppText>
                <Chip label={item.kind} size="sm" tone="danger" />
              </View>
              <AppText variant="small" color="textFaint">
                {item.reason} · {item.until ? `until ${new Date(item.until).toLocaleDateString()}` : 'permanent'}
              </AppText>
              <Button label="Lift" size="sm" variant="ghost" onPress={() => liftRestriction(item.userId)} />
            </View>
          ))
        )}
        <Divider />
        <AppText variant="small" color="textFaint">
          Personal blocks on this device: {blockedUsers.length}. These are private to the user and are
          never shared with the community.
        </AppText>
      </Card>
    </View>
  );
}
