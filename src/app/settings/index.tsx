import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Elements';
import { SegmentedControl, SwitchRow } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card, Divider, ListRow, SectionHeader } from '@/components/Surfaces';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import type { ThemePreference } from '@/theme';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const preference = useSettingsStore((state) => state.themePreference);
  const setTheme = useSettingsStore((state) => state.setThemePreference);
  const haptics = useSettingsStore((state) => state.hapticsEnabled);
  const setHaptics = useSettingsStore((state) => state.setHaptics);
  const analytics = useSettingsStore((state) => state.analyticsOptIn);
  const setAnalytics = useSettingsStore((state) => state.setAnalyticsOptIn);
  const sample = useSettingsStore((state) => state.sampleCatalogueEnabled);
  const setSample = useSettingsStore((state) => state.setSampleCatalogue);

  return (
    <Screen back title="Settings" eyebrow="Make it yours" bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">Appearance</AppText>
        <SegmentedControl<ThemePreference>
          value={preference}
          onChange={setTheme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
        <AppText variant="small" color="textFaint">
          Dark is the brand default: the ember artwork carries the screens.
        </AppText>
      </Card>

      <Card style={{ gap: 2 }}>
        <SwitchRow
          title="Haptics"
          subtitle="Small taps on play, save and rewards"
          value={haptics}
          onValueChange={setHaptics}
        />
        <Divider />
        <SwitchRow
          title="Anonymous usage analytics"
          subtitle="Off by default. No journal, community or purchase content is ever collected."
          value={analytics}
          onValueChange={setAnalytics}
        />
        <Divider />
        <SwitchRow
          title="Show sample shop catalogue"
          subtitle="Preview products used to test the cart flow"
          value={sample}
          onValueChange={setSample}
        />
      </Card>

      <View>
        <SectionHeader title="Privacy & account" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Privacy & data" subtitle="Encryption, exports, deletions" icon="lock-closed-outline" onPress={() => router.push('/settings/privacy')} />
          <Divider />
          <ListRow title="Notifications" subtitle="Daily reflection reminder" icon="notifications-outline" onPress={() => router.push('/settings/notifications')} />
          <Divider />
          <ListRow title="Account" icon="person-circle-outline" onPress={() => router.push('/settings/account')} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Community safety" />
        <Card style={{ gap: 2 }}>
          <ListRow title="Guidelines" icon="document-text-outline" onPress={() => router.push('/community/guidelines')} />
          <Divider />
          <ListRow title="Moderation dashboard" subtitle="Passphrase protected" icon="shield-checkmark-outline" onPress={() => router.push('/moderation')} />
        </Card>
      </View>

      <Card tone="alt" style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.textMuted} />
          <AppText variant="smallMedium">About this build</AppText>
          <View style={{ flex: 1 }} />
          <Chip label={`v1.0.0 · ${theme.mode}`} size="sm" />
        </View>
        <AppText variant="small" color="textFaint">
          Music catalogue, store inventory and membership entitlements connect to
          overgrowthrenaissance.com. See docs/INTEGRATIONS.md in the project for the exact status of
          each dependency.
        </AppText>
      </Card>
    </Screen>
  );
}
