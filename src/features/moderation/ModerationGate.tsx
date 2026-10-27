import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/Inputs';
import { Card } from '@/components/Surfaces';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { MODERATION_SESSION_MINUTES } from '@/features/moderation/config';
import { useNow } from '@/lib/clock';
import { useTheme } from '@/theme';

export function ModerationGate({ onUnlocked }: { onUnlocked: () => void }) {
  const theme = useTheme();
  const verify = useCommunityStore((state) => state.verifyModeration);
  const session = useCommunityStore((state) => state.session);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const now = useNow();
  const lockedFor = session.lockedUntil ? Math.max(0, session.lockedUntil - now) : 0;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = await verify(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not unlock.');
      setPassword('');
      return;
    }
    setPassword('');
    onUnlocked();
  };

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 26 }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.accentSoft,
          }}
        >
          <Ionicons name="shield-checkmark" size={28} color={theme.colors.accent} />
        </View>
        <AppText variant="subheading" align="center">
          Moderator access
        </AppText>
        <AppText variant="small" color="textMuted" align="center" style={{ maxWidth: 300 }}>
          This area can remove posts, mute or ban members and edit the word filter. It needs the
          moderator passphrase.
        </AppText>
        <TextField
          label="Passphrase"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          icon="key-outline"
          placeholder="Enter moderator passphrase"
          error={error ?? undefined}
          onSubmitEditing={() => void submit()}
          returnKeyType="go"
          editable={lockedFor === 0}
        />
        {lockedFor > 0 ? (
          <AppText variant="small" style={{ color: theme.colors.danger }} align="center">
            Too many attempts. Try again in {Math.ceil(lockedFor / 1000)} seconds.
          </AppText>
        ) : null}
        <Button
          label={busy ? 'Checking…' : 'Unlock moderator tools'}
          icon="lock-open-outline"
          loading={busy}
          onPress={() => void submit()}
          disabled={password.length === 0 || lockedFor > 0}
          fullWidth
        />
        <AppText variant="small" color="textFaint" align="center">
          Sessions last {MODERATION_SESSION_MINUTES} minutes. Five failed attempts trigger a 60 second
          lockout.
        </AppText>
      </Card>

      <Card tone="alt" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.gold} />
          <AppText variant="smallMedium">How this lock works</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          The app stores only a PBKDF2 hash of the passphrase, never the phrase itself. Change it from
          the Security tab after unlocking. On a shipping build, moderation should also be enforced by
          the backend so the lock is not the only line of defence.
        </AppText>
      </Card>
    </View>
  );
}
