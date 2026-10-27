import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/Inputs';
import { Card, Divider } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { relativeTime } from '@/lib/date';
import { useTheme } from '@/theme';

export function SecurityPanel() {
  const theme = useTheme();
  const toast = useToast();
  const changePassphrase = useCommunityStore((state) => state.changePassphrase);
  const log = useCommunityStore((state) => state.log);
  const clearCommunity = useCommunityStore((state) => state.clearCommunity);
  const passphraseUpdatedAt = useCommunityStore((state) => state.passphraseUpdatedAt);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="key" size={16} color={theme.colors.accent} />
          <AppText variant="smallMedium">Change moderator passphrase</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          {passphraseUpdatedAt
            ? `Last changed ${relativeTime(passphraseUpdatedAt)}.`
            : 'Still using the provisioned passphrase — change it now.'}
        </AppText>
        <TextField
          label="Current passphrase"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="New passphrase"
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          hint="At least 8 characters. Stored as a salted PBKDF2 hash."
          error={error ?? undefined}
        />
        <Button
          label={busy ? 'Updating…' : 'Update passphrase'}
          size="sm"
          loading={busy}
          onPress={async () => {
            setBusy(true);
            setError(null);
            const result = await changePassphrase(current, next);
            setBusy(false);
            if (!result.ok) {
              setError(result.error ?? 'Could not update the passphrase.');
              return;
            }
            setCurrent('');
            setNext('');
            toast.show('Moderator passphrase updated', 'success');
          }}
        />
      </Card>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="list" size={16} color={theme.colors.textMuted} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Audit log ({log.length})
          </AppText>
        </View>
        {log.length === 0 ? (
          <AppText variant="small" color="textMuted">
            No moderation actions yet. Every removal, mute, ban and filter change is recorded here.
          </AppText>
        ) : (
          log.slice(0, 25).map((entry, index) => (
            <View key={entry.id} style={{ gap: 2 }}>
              {index > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="smallMedium" style={{ flex: 1 }} numberOfLines={1}>
                  {entry.action.replace(/-/g, ' ')}
                </AppText>
                <AppText variant="label" color="textFaint">
                  {entry.actor.toUpperCase()} · {relativeTime(entry.at).toUpperCase()}
                </AppText>
              </View>
              <AppText variant="small" color="textFaint">
                {entry.detail}
              </AppText>
            </View>
          ))
        )}
      </Card>

      <Card tone="alt" style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="warning-outline" size={15} color={theme.colors.danger} />
          <AppText variant="smallMedium">Reset community data</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Clears posts, comments, votes, reports, restrictions and the audit log on this device, and
          restores the artist’s announcements. Filter terms and the moderator passphrase are kept.
        </AppText>
        <Button
          label="Reset community"
          size="sm"
          variant="danger"
          onPress={() =>
            Alert.alert('Reset community data?', 'This cannot be undone on this device.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                  clearCommunity();
                  toast.show('Community reset to seed content', 'success');
                },
              },
            ])
          }
        />
      </Card>
    </View>
  );
}
