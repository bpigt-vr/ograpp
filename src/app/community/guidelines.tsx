import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useTheme } from '@/theme';

const RULES = [
  {
    icon: 'heart-outline' as const,
    title: 'Respect is the floor',
    body: 'Disagree with ideas, never attack people. No slurs, harassment, threats or pile-ons.',
  },
  {
    icon: 'shield-outline' as const,
    title: 'No hate, no sexual content, no self-harm',
    body: 'These are removed immediately and can lead to a ban. If someone is in crisis, contact local emergency services.',
  },
  {
    icon: 'link-outline' as const,
    title: 'No spam, selling or farming',
    body: 'No promo links, crypto, follower services or repeat posting. Points are capped and purchases must be verified.',
  },
  {
    icon: 'person-outline' as const,
    title: 'Keep private things private',
    body: 'Do not post anyone’s address, phone number, school, workplace or screenshots of private messages.',
  },
  {
    icon: 'albums-outline' as const,
    title: 'Credit the art',
    body: 'Share remix ideas and edits you made or have permission to share. Do not upload the artist’s unreleased files.',
  },
  {
    icon: 'hand-left-outline' as const,
    title: 'Moderators have the last word',
    body: 'Content can be removed, accounts muted or banned, and every action is logged. Ask for a review instead of arguing in the thread.',
  },
];

export default function GuidelinesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const accept = useCommunityStore((state) => state.acceptGuidelines);
  const acceptedAt = useCommunityStore((state) => state.guidelinesAcceptedAt);
  const policy = useCommunityStore((state) => state.policy);
  const terms = useCommunityStore((state) => state.filterTerms);
  const blocked = useCommunityStore((state) => state.blockedUsers);
  const unblock = useCommunityStore((state) => state.unblockUser);

  return (
    <Screen back title="Community guidelines" eyebrow="The house rules" bottomInset={40}>
      <Card tone="accent" style={{ gap: 6 }}>
        <AppText variant="smallMedium">Short version</AppText>
        <AppText variant="small" color="textMuted">
          Be a person, not a problem. Respect the Gang, keep it legal, keep it kind. The filter is on
          and moderators can remove anything that breaks these rules.
        </AppText>
      </Card>

      {RULES.map((rule) => (
        <Card key={rule.title} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={rule.icon} size={16} color={theme.colors.accent} />
            <AppText variant="smallMedium" style={{ flex: 1 }}>
              {rule.title}
            </AppText>
          </View>
          <AppText variant="small" color="textMuted">
            {rule.body}
          </AppText>
        </Card>
      ))}

      <Card style={{ gap: 8 }}>
        <AppText variant="smallMedium">How moderation works</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={policy.mode === 'block' ? 'Filter blocks words' : 'Filter masks words'} size="sm" icon="shield-checkmark" />
          <Chip label={`${terms.length} filtered terms`} size="sm" />
          <Chip label="Reports reviewed" size="sm" icon="flag-outline" />
          <Chip label="Mute & ban tools" size="sm" icon="ban-outline" />
        </View>
        <AppText variant="small" color="textMuted">
          A post is checked before it appears: blocked words (including 5h1t-style obfuscation), link
          spam, shouting, floods, duplicates and rapid-fire posting. Reports go to a moderator queue
          where content can be removed or restored. Muted members cannot post; banned members are
          hidden from the community.
        </AppText>
      </Card>

      <Card style={{ gap: 8 }}>
        <AppText variant="smallMedium">Your privacy controls</AppText>
        <AppText variant="small" color="textMuted">
          Community participation is optional — music, the store, rewards and the journal work without
          it. Journal entries are never posted here. You can block any member privately; blocked posts
          are hidden on this device only.
        </AppText>
        {blocked.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {blocked.map((user) => (
              <Chip key={user.id} label={`Unblock ${user.displayName}`} size="sm" onPress={() => unblock(user.id)} />
            ))}
          </View>
        ) : null}
      </Card>

      <Button
        label={acceptedAt ? 'Guidelines accepted' : 'I accept these guidelines'}
        icon={acceptedAt ? 'checkmark-circle' : 'checkmark'}
        disabled={Boolean(acceptedAt)}
        fullWidth
        onPress={() => {
          accept();
          router.back();
        }}
      />
      <Button
        label="Open moderator tools"
        variant="ghost"
        icon="key-outline"
        fullWidth
        onPress={() => router.push('/moderation')}
      />
    </Screen>
  );
}
