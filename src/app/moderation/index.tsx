import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { SegmentedControl } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useCommunityStore, useModerationActive } from '@/features/community/useCommunityStore';
import { FilterPanel } from '@/features/moderation/FilterPanel';
import { MembersPanel } from '@/features/moderation/MembersPanel';
import { ModerationGate } from '@/features/moderation/ModerationGate';
import { ReportsPanel } from '@/features/moderation/ReportsPanel';
import { SecurityPanel } from '@/features/moderation/SecurityPanel';
import { MODERATION_SESSION_MINUTES } from '@/features/moderation/config';
import { useNow } from '@/lib/clock';
import { useTheme } from '@/theme';

type Section = 'reports' | 'filter' | 'members' | 'security';

export default function ModerationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const active = useModerationActive();
  const session = useCommunityStore((state) => state.session);
  const lock = useCommunityStore((state) => state.lockModeration);
  const reports = useCommunityStore((state) => state.reports);
  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const restrictions = useCommunityStore((state) => state.restrictions);
  const terms = useCommunityStore((state) => state.filterTerms);
  const [section, setSection] = useState<Section>('reports');
  const now = useNow();

  const openReports = reports.filter((report) => report.status === 'open').length;
  const hidden = posts.filter((post) => post.hidden).length + comments.filter((comment) => comment.hidden).length;
  const minutesLeft = session.verifiedAt
    ? Math.max(0, Math.ceil((session.verifiedAt + MODERATION_SESSION_MINUTES * 60_000 - now) / 60_000))
    : 0;

  return (
    <Screen
      back
      title="Moderation"
      eyebrow="Community safety"
      bottomInset={40}
      right={
        active ? (
          <IconButton icon="log-out-outline" label="Lock moderator tools" onPress={lock} />
        ) : (
          <IconButton icon="shield-outline" label="Locked" onPress={() => undefined} />
        )
      }
    >
      {!active ? (
        <ModerationGate onUnlocked={() => setSection('reports')} />
      ) : (
        <>
          <Card style={{ gap: 8 }} tone="accent">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.accent} />
              <AppText variant="smallMedium" style={{ flex: 1 }}>
                Moderator session active
              </AppText>
              <Chip label={`${minutesLeft} min left`} size="sm" tone="accent" />
            </View>
            <AppText variant="small" color="textMuted">
              {openReports} open reports · {hidden} hidden items · {terms.length} filtered terms ·{' '}
              {restrictions.length} restrictions
            </AppText>
          </Card>

          <SegmentedControl<Section>
            value={section}
            onChange={setSection}
            options={[
              { value: 'reports', label: 'Queue' },
              { value: 'filter', label: 'Filter' },
              { value: 'members', label: 'Members' },
              { value: 'security', label: 'Security' },
            ]}
          />

          {section === 'reports' ? <ReportsPanel /> : null}
          {section === 'filter' ? <FilterPanel /> : null}
          {section === 'members' ? <MembersPanel /> : null}
          {section === 'security' ? <SecurityPanel /> : null}

          <Card style={{ gap: 6 }}>
            <AppText variant="smallMedium">Policy reminder</AppText>
            <AppText variant="small" color="textMuted">
              Remove content that breaks the guidelines, not opinions you disagree with. Every action is
              logged with a timestamp and can be reversed from the queue.
            </AppText>
            <Button
              label="View community guidelines"
              size="sm"
              variant="ghost"
              onPress={() => router.push('/community/guidelines')}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
