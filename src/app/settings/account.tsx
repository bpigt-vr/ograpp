import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Avatar, Chip } from '@/components/Elements';
import { TextField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card, Divider } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useLibraryStore } from '@/features/music/useLibraryStore';
import { useRewardsStore } from '@/features/rewards/useRewardsStore';
import { useCartStore } from '@/features/store/useCartStore';
import { shareJSON } from '@/lib/export';
import { useTheme } from '@/theme';
import { useState } from 'react';

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const account = useAuthStore((state) => state.account);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const entries = useJournalStore((state) => state.entries);
  const goals = useJournalStore((state) => state.goals);
  const [name, setName] = useState(profile.displayName);
  const [confirm, setConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const signedIn = Boolean(account);

  const wipeEverything = async () => {
    await deleteAccount();
    await useJournalStore.getState().clearJournal();
    useLibraryStore.getState().clearLibrary();
    useCartStore.getState().clear();
    useRewardsStore.getState().reset();
    useCommunityStore.getState().clearCommunity();
    setShowDelete(false);
    toast.show('Account and local data deleted', 'success');
    router.replace('/');
  };

  const exportAll = async () => {
    const result = await shareJSON('ogr-account-export.json', {
      exportedAt: new Date().toISOString(),
      account: account ? { email: account.email, createdAt: account.createdAt } : null,
      profile,
      journal: Object.values(entries),
      goals,
    });
    toast.show(result.ok ? 'Export ready' : result.error ?? 'Export failed', result.ok ? 'success' : 'error');
  };

  return (
    <Screen back title="Account" eyebrow="Your data, your call" bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={profile.displayName} color={profile.avatarColor} size={48} ring />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="subheading">{profile.displayName}</AppText>
            <AppText variant="small" color="textFaint">
              {signedIn ? account?.email : 'Guest · device only'}
            </AppText>
          </View>
          <Chip label={signedIn ? 'Signed in' : 'Guest'} size="sm" tone={signedIn ? 'success' : 'neutral'} />
        </View>
        {!signedIn ? (
          <Button label="Sign in or create an account" onPress={() => router.push('/auth')} fullWidth />
        ) : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">Display name</AppText>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="How you appear in the community"
          maxLength={32}
          hint="This is public only when you post in the community."
        />
        <Button
          label="Save display name"
          size="sm"
          onPress={() => {
            if (name.trim().length < 2) {
              toast.show('Use at least 2 characters.', 'error');
              return;
            }
            updateProfile({ displayName: name.trim() });
            toast.show('Display name updated', 'success');
          }}
        />
      </Card>

      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.gold} />
          <AppText variant="smallMedium">Account scope in this build</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Accounts are device-local: your password is hashed with PBKDF2 and stored on this phone. There
          is no server, so there is no multi-device sync, no password reset by email, and no website
          login sharing yet. The integration document describes the backend needed for those.
        </AppText>
      </Card>

      <View style={{ gap: 8 }}>
        <Button label="Export my data" variant="secondary" icon="share-outline" onPress={() => void exportAll()} fullWidth />
        {signedIn ? (
          <Button
            label="Sign out"
            variant="ghost"
            icon="log-out-outline"
            fullWidth
            onPress={() => {
              signOut();
              toast.show('Signed out — guest mode', 'default');
            }}
          />
        ) : null}
      </View>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="warning-outline" size={15} color={theme.colors.danger} />
          <AppText variant="smallMedium">Danger zone</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Deleting your account also deletes the encrypted journal, saved music, rewards, cart and your
          community posts on this device. This cannot be undone.
        </AppText>
        {!showDelete ? (
          <Button label="Delete account & data" variant="danger" icon="trash-outline" onPress={() => setShowDelete(true)} />
        ) : (
          <>
            <Divider />
            <TextField
              label="Type DELETE to confirm"
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="characters"
              placeholder="DELETE"
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                label="Permanently delete"
                variant="danger"
                size="sm"
                disabled={confirm.trim().toUpperCase() !== 'DELETE'}
                onPress={() => void wipeEverything()}
              />
              <Button label="Cancel" variant="ghost" size="sm" onPress={() => { setShowDelete(false); setConfirm(''); }} />
            </View>
          </>
        )}
        {session === null && !signedIn ? (
          <AppText variant="small" color="textFaint">
            You can still delete your guest data above — it removes everything stored on this device.
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}
