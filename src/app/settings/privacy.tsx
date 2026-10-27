import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { SwitchRow } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card, Divider, ListRow } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { shareJSON } from '@/lib/export';
import { isSecureVaultAvailable } from '@/lib/vault';
import { useTheme } from '@/theme';

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const entries = useJournalStore((state) => state.entries);
  const goals = useJournalStore((state) => state.goals);
  const clearJournal = useJournalStore((state) => state.clearJournal);
  const favorites = useLibraryStore((state) => state.favoriteTrackIds);
  const listens = useLibraryStore((state) => state.listens);
  const rewards = useRewardsStore((state) => state.state);
  const blocked = useCommunityStore((state) => state.blockedUsers);
  const analytics = useSettingsStore((state) => state.analyticsOptIn);
  const setAnalytics = useSettingsStore((state) => state.setAnalyticsOptIn);

  const exportJournal = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Overgrowth Renaissance',
      journal: Object.values(entries).sort((a, b) => (a.dayKey < b.dayKey ? -1 : 1)),
      goals,
    };
    const result = await shareJSON(`ogr-journal-${new Date().toISOString().slice(0, 10)}.json`, payload);
    toast.show(result.ok ? 'Journal export ready' : result.error ?? 'Export failed', result.ok ? 'success' : 'error');
  };

  const exportEverything = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      journal: Object.values(entries),
      goals,
      library: { favorites, listens },
      rewards,
      settings: { analyticsOptIn: analytics },
    };
    const result = await shareJSON(`ogr-data-${new Date().toISOString().slice(0, 10)}.json`, payload);
    toast.show(result.ok ? 'Data export ready' : result.error ?? 'Export failed', result.ok ? 'success' : 'error');
  };

  return (
    <Screen back title="Privacy & data" eyebrow="Private by default" bottomInset={40}>
      <Card style={{ gap: 8 }} tone={isSecureVaultAvailable() ? 'surface' : 'alt'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={isSecureVaultAvailable() ? 'lock-closed' : 'warning-outline'} size={16} color={isSecureVaultAvailable() ? theme.colors.success : theme.colors.danger} />
          <AppText variant="smallMedium">
            {isSecureVaultAvailable() ? 'Journal encryption is active' : 'Secure keystore unavailable'}
          </AppText>
        </View>
        <AppText variant="small" color="textMuted">
          {isSecureVaultAvailable()
            ? 'Every journal entry is encrypted with AES-256-GCM before it touches storage. The key lives in the iOS Keychain / Android Keystore and never leaves the device. Entries are never posted, never analysed and never uploaded.'
            : 'This platform has no secure keystore (web preview). Entries are still encrypted, but the key cannot be hardware-protected. Use the iOS or Android build for the real privacy guarantee.'}
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="AES-256-GCM" size="sm" icon="shield-checkmark-outline" />
          <Chip label="PBKDF2 passphrases" size="sm" icon="key-outline" />
          <Chip label="No trackers" size="sm" icon="eye-off-outline" />
        </View>
      </Card>

      <Card style={{ gap: 2 }}>
        <AppText variant="smallMedium" style={{ marginBottom: 6 }}>
          What is stored on this device
        </AppText>
        <ListRow title="Journal entries" subtitle="Encrypted · only you can read them" icon="book-outline" />
        <Divider />
        <ListRow title="Saved music & play counts" subtitle="For your library and rewards" icon="heart-outline" />
        <Divider />
        <ListRow title="Rewards ledger" subtitle="Points, badges, redemptions" icon="trophy-outline" />
        <Divider />
        <ListRow title="Community posts you wrote" subtitle="Public in the community" icon="people-outline" />
        <Divider />
        <ListRow title="Blocked accounts" subtitle={`${blocked.length} blocked · private`} icon="eye-off-outline" />
      </Card>

      <Card style={{ gap: 2 }}>
        <SwitchRow
          title="Anonymous analytics"
          subtitle="Off by default. Screens opened only — no text, no audio, no purchases."
          value={analytics}
          onValueChange={setAnalytics}
        />
      </Card>

      <View style={{ gap: 8 }}>
        <Button label="Export journal (JSON)" icon="share-outline" onPress={() => void exportJournal()} fullWidth />
        <Button label="Export all my data" variant="secondary" icon="download-outline" onPress={() => void exportEverything()} fullWidth />
        <Button
          label="Delete all journal entries"
          variant="danger"
          icon="trash-outline"
          fullWidth
          onPress={() =>
            Alert.alert('Delete all journal entries?', 'The encrypted copies and their key references are removed from this device.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete everything',
                style: 'destructive',
                onPress: async () => {
                  await clearJournal();
                  toast.show('All journal entries deleted', 'success');
                },
              },
            ])
          }
        />
        <Button label="Delete my account" variant="danger" icon="person-remove-outline" onPress={() => router.push('/settings/account')} fullWidth />
      </View>

      <Card tone="alt" style={{ gap: 4 }}>
        <AppText variant="smallMedium">Data retention</AppText>
        <AppText variant="small" color="textMuted">
          Deleting the app removes the encryption key, which makes every entry unreadable. Nothing is
          backed up to a server in this build. If cloud sync is added later, it will be opt-in and
          end-to-end encrypted with this same key.
        </AppText>
      </Card>
    </Screen>
  );
}
