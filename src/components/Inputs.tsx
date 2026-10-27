import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

export function TextField({
  label,
  hint,
  error,
  icon,
  right,
  ...rest
}: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AppText variant="smallMedium" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={17} color={theme.colors.textFaint} /> : null}
        <TextInput
          placeholderTextColor={theme.colors.textFaint}
          style={[
            styles.input,
            { color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 15 },
          ]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <AppText variant="small" style={{ color: theme.colors.danger }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" color="textFaint">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function TextArea({
  label,
  hint,
  error,
  minHeight = 120,
  ...rest
}: TextInputProps & { label?: string; hint?: string; error?: string; minHeight?: number }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AppText variant="smallMedium" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={theme.colors.textFaint}
        style={[
          styles.textArea,
          {
            minHeight,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontSize: 15,
            lineHeight: 23,
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="small" style={{ color: theme.colors.danger }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" color="textFaint">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.segment,
        { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.pill },
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[
              styles.segmentItem,
              {
                backgroundColor: selected ? theme.colors.accent : 'transparent',
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <AppText
              variant="smallMedium"
              style={{ color: selected ? theme.colors.accentText : theme.colors.textMuted }}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyMedium">{title}</AppText>
        {subtitle ? (
          <AppText variant="small" color="textFaint">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={title}
        trackColor={{ true: theme.colors.accent, false: theme.colors.surfaceHi }}
        thumbColor={theme.colors.bgElevated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 46,
  },
  input: { flex: 1, paddingVertical: 11 },
  textArea: {
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: { flexDirection: 'row', padding: 4, gap: 4 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
});
