import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme, type ThemeColors } from '@/theme';
import { AppText } from './AppText';

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  tone = 'neutral',
  size = 'md',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'gold';
  size?: 'sm' | 'md';
}) {
  const theme = useTheme();
  const toneColor: Record<string, string> = {
    neutral: theme.colors.textMuted,
    accent: theme.colors.accent,
    success: theme.colors.success,
    danger: theme.colors.danger,
    gold: theme.colors.gold,
  };
  const background = selected ? theme.colors.accentSoft : theme.colors.surfaceAlt;
  const foreground = selected ? theme.colors.accent : toneColor[tone];
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={size === 'sm' ? 12 : 14} color={foreground} /> : null}
      <AppText
        variant={size === 'sm' ? 'label' : 'smallMedium'}
        style={{ color: foreground, letterSpacing: size === 'sm' ? 0.8 : 0 }}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </>
  );
  const baseStyle = [
    styles.chip,
    {
      backgroundColor: background,
      borderColor: selected ? theme.colors.accent : theme.colors.border,
      paddingVertical: size === 'sm' ? 4 : 7,
      paddingHorizontal: size === 'sm' ? 8 : 12,
    },
  ];

  if (!onPress) return <View style={baseStyle}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [...baseStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

export function Avatar({
  name,
  color,
  size = 40,
  ring = false,
}: {
  name: string;
  color?: string;
  size?: number;
  ring?: boolean;
}) {
  const theme = useTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? theme.colors.surfaceHi,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 2 : 0,
        borderColor: theme.colors.accent,
      }}
    >
      <AppText
        style={{
          color: theme.colors.text,
          fontFamily: theme.fonts.semibold,
          fontSize: size * 0.36,
        }}
      >
        {initials || 'OG'}
      </AppText>
    </View>
  );
}

export function ProgressBar({
  value,
  height = 8,
  color,
  trackColor,
}: {
  value: number;
  height?: number;
  color?: string;
  trackColor?: string;
}) {
  const theme = useTheme();
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor ?? theme.colors.surfaceHi,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color ?? theme.colors.accent,
        }}
      />
    </View>
  );
}

export function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: keyof ThemeColors;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      {icon ? (
        <Ionicons name={icon} size={16} color={color ? theme.colors[color] : theme.colors.accent} />
      ) : null}
      <AppText
        variant="subheading"
        style={{ color: color ? theme.colors[color] : theme.colors.text }}
      >
        {value}
      </AppText>
      <AppText variant="label" color="textFaint">
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

export function Pill({
  text,
  tone = 'accent',
}: {
  text: string;
  tone?: 'accent' | 'success' | 'danger' | 'gold' | 'neutral';
}) {
  const theme = useTheme();
  const color = {
    accent: theme.colors.accent,
    success: theme.colors.success,
    danger: theme.colors.danger,
    gold: theme.colors.gold,
    neutral: theme.colors.textMuted,
  }[tone];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: color,
      }}
    >
      <AppText variant="label" style={{ color }}>
        {text.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  stat: { alignItems: 'center', gap: 2, minWidth: 64 },
});
