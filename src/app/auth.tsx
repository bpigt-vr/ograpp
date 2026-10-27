import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useTheme } from '@/theme';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const account = useAuthStore((state) => state.account);
  const session = useAuthStore((state) => state.session);
  const signUp = useAuthStore((state) => state.signUp);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);

  const [mode, setMode] = useState<Mode>(account ? 'signin' : 'signup');
  const [email, setEmail] = useState(account?.email ?? '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result =
      mode === 'signup' ? await signUp(email, password, name) : await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    toast.show(mode === 'signup' ? 'Account created on this device' : 'Welcome back', 'success');
    router.back();
  };

  return (
    <Screen back title={session ? 'Account' : mode === 'signup' ? 'Create account' : 'Sign in'} eyebrow="Overgrowth Renaissance" bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="person-circle-outline" size={18} color={theme.colors.accent} />
          <AppText variant="smallMedium">
            {session ? 'You are signed in on this device' : 'Guest browsing is always available'}
          </AppText>
        </View>
        <AppText variant="small" color="textMuted">
          {session
            ? 'Your saves, journal, rewards and community posts are tied to this account on this device.'
            : 'An account unlocks community posting, saved music and cross-session rewards. Journaling, streaming and shopping work without one.'}
        </AppText>
      </Card>

      {session ? (
        <>
          <Card style={{ gap: 8 }}>
            <AppText variant="smallMedium">{account?.email}</AppText>
            <AppText variant="small" color="textFaint">
              Signed in since {new Date(session.startedAt).toLocaleString()}
            </AppText>
          </Card>
          <Button label="Sign out" variant="secondary" icon="log-out-outline" onPress={() => { signOut(); router.back(); }} />
          <Button label="Account settings" variant="ghost" icon="settings-outline" onPress={() => router.replace('/settings/account')} />
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Sign in" size="sm" variant={mode === 'signin' ? 'primary' : 'ghost'} onPress={() => setMode('signin')} />
            <Button label="Create account" size="sm" variant={mode === 'signup' ? 'primary' : 'ghost'} onPress={() => setMode('signup')} />
          </View>

          {mode === 'signup' ? (
            <TextField label="Display name" value={name} onChangeText={setName} placeholder="Your name in the community" maxLength={32} />
          ) : null}
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon="mail-outline"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            icon="lock-closed-outline"
            error={error ?? undefined}
            onSubmitEditing={() => void submit()}
            returnKeyType="go"
          />
          <Button
            label={busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            loading={busy}
            fullWidth
            onPress={() => void submit()}
          />

          <Card tone="alt" style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="shield-half-outline" size={15} color={theme.colors.gold} />
              <AppText variant="smallMedium">How accounts work in this build</AppText>
            </View>
            <AppText variant="small" color="textMuted">
              Accounts are device-local: credentials are salted and PBKDF2-hashed, and never sent
              anywhere. Multi-device sync and the artist’s website login require the backend
              connection documented in docs/INTEGRATIONS.md.
            </AppText>
            <Button
              label="Manage membership on the website"
              size="sm"
              variant="ghost"
              onPress={() => router.push('/membership')}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
