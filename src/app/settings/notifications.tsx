import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { SwitchRow } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import {
  cancelReminder,
  ensureNotificationPermission,
  scheduleDailyReminder,
  type PermissionState,
} from '@/lib/notifications';
import { useTheme } from '@/theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const reminder = useSettingsStore((state) => state.reminder);
  const updateReminder = useSettingsStore((state) => state.updateReminder);
  const [permission, setPermission] = useState<PermissionState>('granted');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureNotificationPermission().then(setPermission);
  }, []);

  const toggle = async (enabled: boolean) => {
    setBusy(true);
    if (!enabled) {
      await cancelReminder(reminder.scheduledId);
      updateReminder({ enabled: false, scheduledId: null });
      setBusy(false);
      toast.show('Daily reminder off', 'default');
      return;
    }
    const state = await ensureNotificationPermission();
    setPermission(state);
    if (state !== 'granted') {
      setBusy(false);
      toast.show(
        state === 'unavailable'
          ? 'Notifications are not available on this platform.'
          : 'Enable notifications in system settings to use reminders.',
        'error'
      );
      return;
    }
    const id = await scheduleDailyReminder({ hour: reminder.hour, minute: reminder.minute });
    updateReminder({ enabled: Boolean(id), scheduledId: id });
    setBusy(false);
    toast.show(id ? 'Daily reminder set' : 'Could not schedule the reminder', id ? 'success' : 'error');
  };

  const shift = async (deltaMinutes: number) => {
    const total = (reminder.hour * 60 + reminder.minute + deltaMinutes + 1440) % 1440;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    updateReminder({ hour, minute });
    if (reminder.enabled) {
      await cancelReminder(reminder.scheduledId);
      const id = await scheduleDailyReminder({ hour, minute });
      updateReminder({ scheduledId: id });
    }
  };

  const timeLabel = `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')}`;

  return (
    <Screen back title="Notifications" eyebrow="Quiet by design" bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <SwitchRow
          title="Daily reflection reminder"
          subtitle="One optional nudge to journal"
          value={reminder.enabled}
          onValueChange={(value) => void toggle(value)}
          disabled={busy}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppText variant="small" color="textMuted" style={{ flex: 1 }}>
            Reminder time
          </AppText>
          <Button label="−1h" size="sm" variant="ghost" onPress={() => void shift(-60)} />
          <Button label="−15m" size="sm" variant="ghost" onPress={() => void shift(-15)} />
          <AppText variant="subheading" color="accent">
            {timeLabel}
          </AppText>
          <Button label="+15m" size="sm" variant="ghost" onPress={() => void shift(15)} />
          <Button label="+1h" size="sm" variant="ghost" onPress={() => void shift(60)} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip
            label={
              permission === 'granted' ? 'Permission granted' : permission === 'denied' ? 'Permission denied' : 'Unavailable on this platform'
            }
            size="sm"
            tone={permission === 'granted' ? 'success' : permission === 'denied' ? 'danger' : 'neutral'}
            icon={permission === 'granted' ? 'checkmark-circle' : 'alert-circle-outline'}
          />
          <Chip label="Local schedule only" size="sm" icon="phone-portrait-outline" />
        </View>
      </Card>

      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.success} />
          <AppText variant="smallMedium">What we do not send</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          No marketing blasts, no streak guilt, no push server. The reminder is scheduled locally by the
          operating system and disappears if you turn it off. Missed days never trigger a notification.
        </AppText>
      </Card>
    </Screen>
  );
}
