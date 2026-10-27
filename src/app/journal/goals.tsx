import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip, ProgressBar } from '@/components/Elements';
import { TextField } from '@/components/Inputs';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Surfaces';
import { EmptyState } from '@/components/States';
import { useToast } from '@/components/Toast';
import type { GoalCategory } from '@/features/journal/useJournalStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { useTheme } from '@/theme';

const CATEGORIES: { id: GoalCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'creative', label: 'Creative', icon: 'color-palette-outline' },
  { id: 'health', label: 'Health', icon: 'fitness-outline' },
  { id: 'career', label: 'Career', icon: 'briefcase-outline' },
  { id: 'mindset', label: 'Mindset', icon: 'leaf-outline' },
  { id: 'money', label: 'Money', icon: 'cash-outline' },
];

export default function GoalsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const grant = useRewardGrant();
  const goals = useJournalStore((state) => state.goals);
  const addGoal = useJournalStore((state) => state.addGoal);
  const progressGoal = useJournalStore((state) => state.progressGoal);
  const completeGoal = useJournalStore((state) => state.completeGoal);
  const removeGoal = useJournalStore((state) => state.removeGoal);

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('7');
  const [unit, setUnit] = useState('sessions');
  const [category, setCategory] = useState<GoalCategory>('creative');
  const [error, setError] = useState<string | null>(null);

  const active = goals.filter((goal) => !goal.completedAt);
  const completed = goals.filter((goal) => goal.completedAt);

  const create = () => {
    const parsed = Number.parseInt(target, 10);
    if (title.trim().length < 3) {
      setError('Give the goal a name (3+ characters).');
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1_000) {
      setError('Target must be between 1 and 1000.');
      return;
    }
    addGoal({
      title: title.trim(),
      category,
      target: parsed,
      unit: unit.trim() || 'times',
      dueDate: null,
    });
    setTitle('');
    setError(null);
    toast.show('Goal added', 'success');
  };

  return (
    <Screen back title="Goals" eyebrow="Progress, not perfection" bottomInset={40}>
      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">New goal</AppText>
        <TextField
          label="What are you moving toward?"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError(null);
          }}
          placeholder="e.g. Finish three beats"
          error={error ?? undefined}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <TextField label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Unit" value={unit} onChangeText={setUnit} placeholder="sessions" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              icon={item.icon}
              size="sm"
              selected={category === item.id}
              onPress={() => setCategory(item.id)}
            />
          ))}
        </View>
        <Button label="Add goal" size="sm" icon="add-circle-outline" onPress={create} />
      </Card>

      {active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon="flag-outline"
          title="No goals yet"
          message="Pick one small, finishable thing. You can always add more once it is moving."
        />
      ) : null}

      {active.length > 0 ? (
        <View style={{ gap: 10 }}>
          <AppText variant="smallMedium" color="textMuted">
            In progress
          </AppText>
          {active.map((goal) => (
            <Card key={goal.id} style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppText variant="bodyMedium" style={{ flex: 1 }} numberOfLines={2}>
                  {goal.title}
                </AppText>
                <Chip label={goal.category} size="sm" />
              </View>
              <ProgressBar value={goal.target === 0 ? 0 : goal.progress / goal.target} height={7} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AppText variant="small" color="textFaint" style={{ flex: 1 }}>
                  {goal.progress} of {goal.target} {goal.unit}
                </AppText>
                <Button label="−" size="sm" variant="ghost" onPress={() => progressGoal(goal.id, -1)} />
                <Button label="+1" size="sm" variant="secondary" onPress={() => progressGoal(goal.id, 1)} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  label="Mark complete"
                  size="sm"
                  icon="checkmark-done"
                  onPress={() => {
                    completeGoal(goal.id);
                    grant('goal-complete', { key: goal.id, note: goal.title });
                    toast.show('Goal complete. Receipt collected.', 'success');
                  }}
                />
                <Button
                  label="Delete"
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    Alert.alert('Delete goal?', goal.title, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeGoal(goal.id) },
                    ])
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {completed.length > 0 ? (
        <View style={{ gap: 8 }}>
          <AppText variant="smallMedium" color="textMuted">
            Completed ({completed.length})
          </AppText>
          {completed.map((goal) => (
            <Card key={goal.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} tone="alt">
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <AppText variant="small" style={{ flex: 1 }} numberOfLines={2}>
                {goal.title}
              </AppText>
              <Button label="Remove" size="sm" variant="ghost" onPress={() => removeGoal(goal.id)} />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
