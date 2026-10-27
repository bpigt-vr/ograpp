import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip, ProgressBar } from '@/components/Elements';
import { Screen } from '@/components/Screen';
import { Card, SectionHeader } from '@/components/Surfaces';
import { promptForDay } from '@/data/prompts';
import { quoteForDay } from '@/data/quotes';
import { JournalCalendar } from '@/features/journal/JournalCalendar';
import { summarizeStreak, streakMessage } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { toDayKey } from '@/lib/date';
import { useTheme } from '@/theme';

export default function JournalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const goals = useJournalStore((state) => state.goals);
  const reminder = useSettingsStore((state) => state.reminder);

  const today = toDayKey();
  const prompt = promptForDay(today);
  const quote = quoteForDay(today);
  const dayKeys = Object.keys(entries).sort();
  const streak = summarizeStreak(dayKeys, today);
  const hasEntryToday = Boolean(entries[today]);
  const activeGoals = goals.filter((goal) => !goal.completedAt);
  const completedGoals = goals.filter((goal) => goal.completedAt).length;

  return (
    <Screen title="Journal" eyebrow="Be the greatest you can be" bottomInset={150}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Chip label={`${streak.current}-day streak`} icon="flame" size="sm" tone="accent" />
          <Chip label={`${dayKeys.length} entries`} icon="book-outline" size="sm" />
        </View>
        <AppText variant="quote">{quote.text}</AppText>
        <AppText variant="small" color="textFaint">
          {streakMessage(streak)}
        </AppText>
        <ProgressBar
          value={
            streak.nextMilestone ? Math.min(1, streak.current / streak.nextMilestone) : 1
          }
        />
        {streak.nextMilestone ? (
          <AppText variant="small" color="textFaint">
            Next milestone: {streak.nextMilestone} days · rest days are allowed
          </AppText>
        ) : null}
      </Card>

      <View>
        <SectionHeader title="Today’s prompt" eyebrow="Private by default" />
        <Card style={{ gap: 10 }} tone="alt">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="create-outline" size={15} color={theme.colors.accent} />
            <AppText variant="label" color="accent">
              {prompt.category.replace('-', ' ').toUpperCase()}
            </AppText>
          </View>
          <AppText variant="subheading">{prompt.prompt}</AppText>
          <AppText variant="small" color="textMuted">
            Reflection: {prompt.reflection}
          </AppText>
          <Button
            label={hasEntryToday ? 'Open today’s entry' : 'Write today’s entry'}
            icon={hasEntryToday ? 'checkmark-circle-outline' : 'arrow-forward'}
            onPress={() => router.push({ pathname: '/journal/write', params: { date: today } })}
          />
        </Card>
      </View>

      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
          <AppText variant="smallMedium">Your month</AppText>
          <View style={{ flex: 1 }} />
          <Button label="History" size="sm" variant="ghost" onPress={() => router.push('/journal/history')} />
        </View>
        <JournalCalendar
          entryDays={dayKeys}
          selectedDay={today}
          onSelectDay={(day) => router.push({ pathname: '/journal/write', params: { date: day } })}
        />
      </Card>

      <View>
        <SectionHeader
          title="Goals"
          actionLabel={goals.length > 0 ? 'Manage' : undefined}
          onAction={() => router.push('/journal/goals')}
        />
        {activeGoals.length === 0 ? (
          <Card style={{ gap: 8 }}>
            <AppText variant="small" color="textMuted">
              No open goals. Pick one thing to move forward this week — small counts.
            </AppText>
            <Button label="Set a goal" size="sm" icon="flag-outline" onPress={() => router.push('/journal/goals')} />
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {activeGoals.slice(0, 3).map((goal) => (
              <Card key={goal.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppText variant="smallMedium" style={{ flex: 1 }} numberOfLines={1}>
                    {goal.title}
                  </AppText>
                  <AppText variant="small" color="textFaint">
                    {goal.progress}/{goal.target} {goal.unit}
                  </AppText>
                </View>
                <ProgressBar value={goal.target === 0 ? 0 : goal.progress / goal.target} height={6} />
              </Card>
            ))}
            <Button label="Open goals" size="sm" variant="secondary" onPress={() => router.push('/journal/goals')} />
          </View>
        )}
        {completedGoals > 0 ? (
          <AppText variant="small" color="textFaint" style={{ marginTop: 6 }}>
            {completedGoals} completed so far.
          </AppText>
        ) : null}
      </View>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="notifications-outline" size={16} color={theme.colors.accent} />
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Daily reminder
          </AppText>
          <Chip
            label={reminder.enabled ? `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')}` : 'Off'}
            size="sm"
            tone={reminder.enabled ? 'success' : 'neutral'}
          />
        </View>
        <AppText variant="small" color="textMuted">
          Optional, local-only nudge to reflect. No push servers, no streak guilt — turn it off any time.
        </AppText>
        <Button
          label={reminder.enabled ? 'Change reminder' : 'Set a reminder'}
          size="sm"
          variant="secondary"
          onPress={() => router.push('/settings/notifications')}
        />
      </Card>

      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="lock-closed" size={14} color={theme.colors.success} />
          <AppText variant="smallMedium">Your entries stay private</AppText>
        </View>
        <AppText variant="small" color="textMuted">
          Every entry is encrypted on this device with a key stored in the system keystore. Entries
          are never posted to the community and never published automatically.
        </AppText>
        <Button label="Privacy details" size="sm" variant="ghost" onPress={() => router.push('/settings/privacy')} />
      </Card>
    </Screen>
  );
}
