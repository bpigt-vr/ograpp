import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { TextField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { PROMPTS } from '@/data/prompts';
import { JournalCalendar } from '@/features/journal/JournalCalendar';
import { summarizeStreak } from '@/features/journal/streak';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { formatDayLabel, toDayKey } from '@/lib/date';
import { truncate } from '@/lib/format';
import { useTheme } from '@/theme';

const MOOD_LABEL: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export default function JournalHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const [query, setQuery] = useState('');

  const days = Object.keys(entries).sort((a, b) => (a < b ? 1 : -1));
  const streak = summarizeStreak(days, toDayKey());
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return days;
    return days.filter((day) => {
      const entry = entries[day];
      return (
        entry.body.toLowerCase().includes(needle) ||
        entry.reflection.toLowerCase().includes(needle) ||
        entry.gratitude.join(' ').toLowerCase().includes(needle)
      );
    });
  }, [days, entries, query]);

  return (
    <Screen back title="Journal history" eyebrow={`${days.length} entries · ${streak.best} best streak`} bottomInset={40}>
      <Card style={{ gap: 14 }}>
        <JournalCalendar
          entryDays={days}
          onSelectDay={(day) => router.push({ pathname: '/journal/write', params: { date: day } })}
        />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label={`${streak.current}-day current`} icon="flame" size="sm" tone="accent" />
          <Chip label={`${streak.best}-day best`} icon="trophy-outline" size="sm" tone="gold" />
          {streak.nextMilestone ? (
            <Chip label={`Next: ${streak.nextMilestone}`} icon="flag-outline" size="sm" />
          ) : null}
        </View>
      </Card>

      {days.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No entries yet"
          message="Your first entry takes two minutes. The prompt is waiting on the journal tab."
          actionLabel="Write today’s entry"
          onAction={() => router.push('/journal/write')}
        />
      ) : (
        <>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search your entries"
            icon="search"
          />
          {filtered.length === 0 ? (
            <Card>
              <AppText variant="small" color="textMuted">
                Nothing matches “{query}”.
              </AppText>
            </Card>
          ) : (
            filtered.map((day) => {
              const entry = entries[day];
              const prompt = PROMPTS.find((item) => item.id === entry.promptId);
              return (
                <Pressable
                  key={day}
                  onPress={() => router.push({ pathname: '/journal/write', params: { date: day } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Open entry from ${formatDayLabel(day)}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Card style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <AppText variant="smallMedium" style={{ flex: 1 }}>
                        {formatDayLabel(day)}
                      </AppText>
                      {entry.mood ? (
                        <Chip label={MOOD_LABEL[entry.mood]} size="sm" />
                      ) : null}
                      <Ionicons name="chevron-forward" size={14} color={theme.colors.textFaint} />
                    </View>
                    {prompt ? (
                      <AppText variant="label" color="textFaint">
                        {truncate(prompt.prompt, 80).toUpperCase()}
                      </AppText>
                    ) : null}
                    <AppText variant="small" color="textMuted" numberOfLines={3}>
                      {entry.body || entry.reflection}
                    </AppText>
                  </Card>
                </Pressable>
              );
            })
          )}
        </>
      )}

      <Button label="Goals" variant="secondary" icon="flag-outline" onPress={() => router.push('/journal/goals')} />
    </Screen>
  );
}
