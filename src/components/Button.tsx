import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

type IconName = keyof typeof Ionicons.glyphMap;

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const haptics = useSettingsStore((state) => state.hapticsEnabled);
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: theme.colors.accent, fg: theme.colors.accentText, border: 'transparent' },
    secondary: { bg: theme.colors.surfaceAlt, fg: theme.colors.text, border: theme.colors.border },
    ghost: { bg: 'transparent', fg: theme.colors.text, border: theme.colors.border },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger, border: 'transparent' },
  }[variant];

  const heights = { sm: 38, md: 48, lg: 56 }[size];
  const fontSizes = { sm: 13, md: 15, lg: 16 }[size];

  const handlePress = () => {
    if (isDisabled) return;
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: theme.radius.pill,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          paddingHorizontal: size === 'sm' ? 14 : 20,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={palette.fg} /> : null}
          <AppText
            style={{ color: palette.fg, fontSize: fontSizes, fontFamily: theme.fonts.semibold }}
            numberOfLines={1}
          >
            {label}
          </AppText>
          {iconRight ? (
            <Ionicons name={iconRight} size={size === 'sm' ? 15 : 18} color={palette.fg} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  label: string;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
};

export function IconButton({
  icon,
  onPress,
  label,
  size = 20,
  color,
  filled = false,
  style,
  disabled,
}: IconButtonProps) {
  const theme = useTheme();
  const haptics = useSettingsStore((state) => state.hapticsEnabled);
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        if (haptics) void Haptics.selectionAsync();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      disabled={disabled}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: filled ? theme.colors.surfaceAlt : 'transparent',
          borderColor: filled ? theme.colors.border : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color ?? theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
