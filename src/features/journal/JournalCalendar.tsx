import { useMemo, useState } from 'react';
import { Pressable,StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { IconButton } from '@/components/Button';
import { formatMonthTitle, monthGrid, toDayKey, weekdayLabels, type DayKey } from '@/lib/date';
import { useTheme } from '@/theme';

/**
 * Month calendar with entry dots. Days without entries are simply empty — no
 * red "missed" markers, because the journal should never shame the user.
 */
export function JournalCalendar({
  entryDays,
  selectedDay,
  onSelectDay,
}: {
  entryDays: DayKey[];
  selectedDay?: DayKey;
  onSelectDay: (day: DayKey) => void;
}) {
  const theme = useTheme();
  const today = toDayKey();
  const todayDate = new Date();
  const [cursor, setCursor] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
  const entries = useMemo(() => new Set(entryDays), [entryDays]);
  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);

  const shift = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.headerRow}>
        <IconButton icon="chevron-back" label="Previous month" size={16} onPress={() => shift(-1)} />
        <AppText variant="smallMedium">{formatMonthTitle(cursor.year, cursor.month)}</AppText>
        <IconButton icon="chevron-forward" label="Next month" size={16} onPress={() => shift(1)} />
      </View>
      <View style={styles.weekRow}>
        {weekdayLabels().map((label, index) => (
          <View key={`${label}-${index}`} style={styles.cell}>
            <AppText variant="label" color="textFaint">
              {label}
            </AppText>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
          const hasEntry = entries.has(day);
          const isToday = day === today;
          const isSelected = day === selectedDay;
          return (
            <Pressable
              key={day}
              onPress={() => onSelectDay(day)}
              accessibilityRole="button"
              accessibilityLabel={`${day}${hasEntry ? ', entry saved' : ''}`}
              style={styles.cell}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected
                    ? theme.colors.accent
                    : hasEntry
                      ? theme.colors.accentSoft
                      : 'transparent',
                  borderWidth: isToday ? 1 : 0,
                  borderColor: theme.colors.accent,
                }}
              >
                <AppText
                  variant="small"
                  style={{
                    color: isSelected
                      ? theme.colors.accentText
                      : hasEntry
                        ? theme.colors.accent
                        : theme.colors.textMuted,
                    fontFamily: hasEntry ? theme.fonts.semibold : theme.fonts.body,
                  }}
                >
                  {Number(day.slice(-2))}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  weekRow: { flexDirection: 'row' },
  cell: { width: `${100 / 7}%`, height: 38, alignItems: 'center', justifyContent: 'center' },
});
