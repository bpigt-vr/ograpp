import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

export function Card({
  children,
  style,
  padded = true,
  tone = 'surface',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'surface' | 'alt' | 'accent';
}) {
  const theme = useTheme();
  const background =
    tone === 'alt'
      ? theme.colors.surfaceAlt
      : tone === 'accent'
        ? theme.colors.accentSoft
        : theme.colors.surface;
  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: theme.radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  eyebrow,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <AppText variant="label" color="textFaint" style={{ marginBottom: 2 }}>
            {eyebrow.toUpperCase()}
          </AppText>
        ) : null}
        <AppText variant="heading">{title}</AppText>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <AppText variant="smallMedium" color="accent">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }, style]}
    />
  );
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor,
  right,
  onPress,
  destructive = false,
  showChevron = true,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}) {
  const theme = useTheme();
  const content = (
    <View style={styles.listRow}>
      {icon ? (
        <View
          style={[
            styles.listIcon,
            { backgroundColor: destructive ? theme.colors.dangerSoft : theme.colors.surfaceAlt },
          ]}
        >
          <Ionicons
            name={icon}
            size={17}
            color={iconColor ?? (destructive ? theme.colors.danger : theme.colors.text)}
          />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText
          variant="bodyMedium"
          style={{ color: destructive ? theme.colors.danger : theme.colors.text }}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" color="textFaint">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {onPress && showChevron ? (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      {content}
    </Pressable>
  );
}

export const surfaceStyles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  listIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
