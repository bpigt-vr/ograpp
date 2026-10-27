import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { TextField } from '@/components/Inputs';
import { Card, Divider } from '@/components/Surfaces';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import type { FilterSeverity } from '@/features/community/moderation';
import { useTheme } from '@/theme';

export function FilterPanel() {
  const theme = useTheme();
  const terms = useCommunityStore((state) => state.filterTerms);
  const policy = useCommunityStore((state) => state.policy);
  const addTerm = useCommunityStore((state) => state.addFilterTerm);
  const removeTerm = useCommunityStore((state) => state.removeFilterTerm);
  const setMode = useCommunityStore((state) => state.setFilterMode);
  const updatePolicy = useCommunityStore((state) => state.updatePolicy);

  const [term, setTerm] = useState('');
  const [severity, setSeverity] = useState<FilterSeverity>('medium');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query
    ? terms.filter((item) => item.term.includes(query.trim().toLowerCase()))
    : terms;

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">Filter behaviour</AppText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip
            label="Block message"
            icon="close-circle-outline"
            selected={policy.mode === 'block'}
            onPress={() => setMode('block')}
          />
          <Chip
            label="Mask words"
            icon="eye-off-outline"
            selected={policy.mode === 'mask'}
            onPress={() => setMode('mask')}
          />
        </View>
        <AppText variant="small" color="textFaint">
          {policy.mode === 'block'
            ? 'Posts containing a filtered word are rejected before they appear.'
            : 'Filtered words are replaced with asterisks and the post is allowed.'}
        </AppText>
        <Divider />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip
            label={policy.blockDuplicate ? 'Duplicates blocked' : 'Duplicates allowed'}
            icon="copy-outline"
            size="sm"
            selected={policy.blockDuplicate}
            onPress={() => updatePolicy({ blockDuplicate: !policy.blockDuplicate })}
          />
          <Chip
            label={policy.blockFloods ? 'Flood guard on' : 'Flood guard off'}
            icon="water-outline"
            size="sm"
            selected={policy.blockFloods}
            onPress={() => updatePolicy({ blockFloods: !policy.blockFloods })}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText variant="small" color="textMuted" style={{ flex: 1 }}>
            Max links per post: {policy.maxLinks}
          </AppText>
          <Button label="-" size="sm" variant="ghost" onPress={() => updatePolicy({ maxLinks: Math.max(0, policy.maxLinks - 1) })} />
          <Button label="+" size="sm" variant="ghost" onPress={() => updatePolicy({ maxLinks: Math.min(5, policy.maxLinks + 1) })} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText variant="small" color="textMuted" style={{ flex: 1 }}>
            Minimum characters: {policy.minLength}
          </AppText>
          <Button label="-" size="sm" variant="ghost" onPress={() => updatePolicy({ minLength: Math.max(1, policy.minLength - 1) })} />
          <Button label="+" size="sm" variant="ghost" onPress={() => updatePolicy({ minLength: Math.min(40, policy.minLength + 1) })} />
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.success} />
          <AppText variant="small" color="textFaint" style={{ flex: 1 }}>
            The filter also blocks link spam, all-caps shouting, character floods, duplicate posts and
            posting faster than three times a minute.
          </AppText>
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <AppText variant="smallMedium">Add a filtered word or phrase</AppText>
        <TextField
          value={term}
          onChangeText={(value) => {
            setTerm(value);
            setError(null);
          }}
          placeholder="e.g. slur, scam phrase, spam link"
          autoCapitalize="none"
          error={error ?? undefined}
          hint="Obfuscation (sh1t, s h i t, shiiit) is handled automatically."
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['low', 'medium', 'high'] as FilterSeverity[]).map((level) => (
            <Chip
              key={level}
              label={level}
              size="sm"
              selected={severity === level}
              onPress={() => setSeverity(level)}
              tone={level === 'high' ? 'danger' : level === 'medium' ? 'gold' : 'neutral'}
            />
          ))}
        </View>
        <Button
          label="Add to filter"
          size="sm"
          icon="add-circle-outline"
          onPress={() => {
            const result = addTerm(term, severity);
            if (!result.ok) {
              setError(result.error ?? 'Could not add that term.');
              return;
            }
            setTerm('');
          }}
        />
      </Card>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppText variant="smallMedium" style={{ flex: 1 }}>
            Filtered terms ({terms.length})
          </AppText>
          <Ionicons name="search" size={15} color={theme.colors.textFaint} />
        </View>
        <TextField value={query} onChangeText={setQuery} placeholder="Search the list" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {filtered.map((item) => (
            <Chip
              key={item.id}
              label={`${item.term} · ${item.severity}`}
              size="sm"
              tone={
                item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'gold' : 'neutral'
              }
              onPress={() => removeTerm(item.id)}
            />
          ))}
        </View>
        <AppText variant="small" color="textFaint">
          Tap a term to remove it. Changes apply to the very next post.
        </AppText>
      </Card>
    </View>
  );
}
