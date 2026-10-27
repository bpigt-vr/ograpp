import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { TextArea } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { useToast } from '@/components/Toast';
import { promptForDay, PROMPT_CATEGORIES } from '@/data/prompts';
import { quoteForDay } from '@/data/quotes';
import type { Mood } from '@/features/journal/useJournalStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { formatDayLabel, isValidDayKey, toDayKey } from '@/lib/date';
import { nowMs } from '@/lib/clock';
import { useTheme } from '@/theme';

const MOODS: { value: Mood; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 1, label: 'Rough', icon: 'rainy-outline' },
  { value: 2, label: 'Low', icon: 'cloudy-outline' },
  { value: 3, label: 'Okay', icon: 'partly-sunny-outline' },
  { value: 4, label: 'Good', icon: 'sunny-outline' },
  { value: 5, label: 'Great', icon: 'flame-outline' },
];

export default function WriteEntryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const grant = useRewardGrant();
  const params = useLocalSearchParams<{ date?: string }>();
  const dayKey = params.date && isValidDayKey(params.date) ? params.date : toDayKey();
  const prompt = promptForDay(dayKey);
  const quote = quoteForDay(dayKey);
  const category = PROMPT_CATEGORIES.find((item) => item.id === prompt.category);

  const entries = useJournalStore((state) => state.entries);
  const saveEntry = useJournalStore((state) => state.saveEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);

  const existing = entries[dayKey];
  const [body, setBody] = useState(existing?.body ?? '');
  const [reflection, setReflection] = useState(existing?.reflection ?? '');
  const [mood, setMood] = useState<Mood | null>(existing?.mood ?? null);
  const [gratitude, setGratitude] = useState<string[]>(
    existing?.gratitude?.length ? [...existing.gratitude, '', '', ''].slice(0, 3) : ['', '', '']
  );
  const [saving, setSaving] = useState(false);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body]
  );

  const save = async () => {
    if (body.trim().length === 0 && reflection.trim().length === 0) {
      toast.show('Write at least a line before saving.', 'error');
      return;
    }
    setSaving(true);
    const now = nowMs();
    const result = await saveEntry({
      dayKey,
      promptId: prompt.id,
      body: body.trim(),
      reflection: reflection.trim(),
      mood,
      gratitude: gratitude.map((item) => item.trim()).filter(Boolean),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error ?? 'Could not save this entry.', 'error');
      return;
    }
    grant('journal-entry', { key: dayKey });
    toast.show('Entry saved — encrypted on this device', 'success');
    router.back();
  };

  const remove = () => {
    Alert.alert('Delete this entry?', 'This removes it permanently from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(dayKey);
          toast.show('Entry deleted', 'success');
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen back title={formatDayLabel(dayKey)} eyebrow="Journal entry" bottomInset={40}>
      <Card style={{ gap: 8 }} tone="alt">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles-outline" size={14} color={theme.colors.gold} />
          <AppText variant="label" style={{ color: category?.color ?? theme.colors.gold }}>
            {(category?.label ?? prompt.category).toUpperCase()}
          </AppText>
          <View style={{ flex: 1 }} />
          <Chip label="Encrypted" icon="lock-closed" size="sm" tone="success" />
        </View>
        <AppText variant="subheading">{prompt.prompt}</AppText>
        <AppText variant="small" color="textMuted">
          {prompt.reflection}
        </AppText>
        <AppText variant="quote" style={{ fontSize: 16, lineHeight: 24 }}>
          “{quote.text}”
        </AppText>
      </Card>

      <TextArea
        label="Write it out"
        value={body}
        onChangeText={setBody}
        placeholder="No performance needed. Just honest lines."
        minHeight={180}
        hint={`${wordCount} ${wordCount === 1 ? 'word' : 'words'} · saved only on this device`}
      />

      <View style={{ gap: 8 }}>
        <AppText variant="smallMedium" color="textMuted">
          How did today feel?
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {MOODS.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              icon={item.icon}
              size="sm"
              selected={mood === item.value}
              onPress={() => setMood(mood === item.value ? null : item.value)}
            />
          ))}
        </View>
      </View>

      <TextArea
        label="Reflection"
        value={reflection}
        onChangeText={setReflection}
        placeholder={prompt.reflection}
        minHeight={90}
      />

      <View style={{ gap: 8 }}>
        <AppText variant="smallMedium" color="textMuted">
          Three things that went right
        </AppText>
        {gratitude.map((value, index) => (
          <TextArea
            key={index}
            value={value}
            onChangeText={(next) =>
              setGratitude((current) => current.map((item, i) => (i === index ? next : item)))
            }
            placeholder={`${index + 1}. …`}
            minHeight={44}
          />
        ))}
      </View>

      <Button label={saving ? 'Saving…' : 'Save entry'} icon="checkmark" loading={saving} fullWidth onPress={() => void save()} />
      {existing ? (
        <Button label="Delete entry" variant="danger" icon="trash-outline" fullWidth onPress={remove} />
      ) : null}

      <Card tone="alt" style={{ gap: 4 }}>
        <AppText variant="small" color="textFaint">
          Entries are AES-256-GCM encrypted with a key held in the device keystore. They are never
          shared with the community or uploaded. Removing the app removes the key, so export anything
          you want to keep.
        </AppText>
      </Card>
    </Screen>
  );
}
