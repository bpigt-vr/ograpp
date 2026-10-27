/**
 * Local notifications for the optional daily journal reminder.
 * Everything here is a *local* schedule — no push server, no analytics.
 */
import * as Notifications from 'expo-notifications';
import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';

export const REMINDER_CHANNEL_ID = 'daily-reflection';

const DEFAULT_TITLE = 'Your daily reflection is ready';
const DEFAULT_BODY = 'One prompt, a few honest lines. Be the greatest you can be.';

let handlerReady = false;

export function configureNotificationHandler(): void {
  if (handlerReady || Platform.OS === 'web') return;
  handlerReady = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export type PermissionState = 'granted' | 'denied' | 'unavailable';

export async function ensureNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      await ensureAndroidChannel();
      return 'granted';
    }
    if (!existing.canAskAgain) return 'denied';
    const request = await Notifications.requestPermissionsAsync();
    if (request.granted) {
      await ensureAndroidChannel();
      return 'granted';
    }
    return 'denied';
  } catch {
    return 'unavailable';
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Daily reflection',
      importance: AndroidImportance.DEFAULT,
      lightColor: '#F2610C',
    });
  } catch {
    // Channel setup is best-effort.
  }
}

export async function scheduleDailyReminder(options: {
  hour: number;
  minute: number;
  title?: string;
  body?: string;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title ?? DEFAULT_TITLE,
        body: options.body ?? DEFAULT_BODY,
        sound: false,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: options.hour,
        minute: options.minute,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
    return identifier;
  } catch {
    return null;
  }
}

export async function cancelReminder(identifier?: string | null): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    if (identifier) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      return;
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => item.identifier)
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  } catch {
    // Ignore — user can re-toggle the reminder.
  }
}
