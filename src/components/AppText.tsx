import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type ThemeColors } from '@/theme';
import { typography } from '@/theme/tokens';

export type TextVariant = keyof typeof typography;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: keyof ThemeColors;
  align?: TextStyle['textAlign'];
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
};

const WEIGHTS: Record<NonNullable<AppTextProps['weight']>, TextStyle> = {
  normal: { fontFamily: 'Inter_400Regular' },
  medium: { fontFamily: 'Inter_500Medium' },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
};

/**
 * Typographic component. Uses the theme's type ramp so every screen shares the
 * same rhythm, and allows colour + weight overrides without losing that rhythm.
 */
export function AppText({
  variant = 'body',
  color = 'text',
  align,
  weight,
  style,
  allowFontScaling = true,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={1.6}
      style={[
        typography[variant],
        { color: theme.colors[color] },
        weight ? WEIGHTS[weight] : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}
