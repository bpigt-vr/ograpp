/**
 * Brand tokens for Overgrowth Renaissance.
 *
 * The palette is sampled from the Overgrowth Renaissance logo: a fiery maple
 * leaf with a black brush "OGR" wordmark. Ink-black surfaces keep the artwork
 * loud, ember orange carries every call to action and warm cream keeps long
 * reading screens (journal, guidelines) comfortable.
 */

export const brand = {
  ember: '#F2610C',
  emberBright: '#FF8A3D',
  emberDeep: '#B93A06',
  crimson: '#7E1508',
  maple: '#D93A0B',
  gold: '#F5B841',
  ink: '#0B0A09',
  inkRaised: '#141110',
  cream: '#F7F0E4',
  moss: '#2F4A34',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 32,
  pill: 999,
} as const;

export const fonts = {
  display: 'Anton_400Regular',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  serif: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifSemi: 'Fraunces_600SemiBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: 0.4 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: 0.3 },
  heading: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 25 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  smallMedium: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 21, lineHeight: 31 },
} as const;

export const limits = {
  contentMaxWidth: 720,
  tabBarHeight: 62,
} as const;

export type ColorSchemeName = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceAlt: string;
  surfaceHi: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  gold: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  overlay: string;
  scrim: string;
  shadow: string;
  onImage: string;
};

export const darkColors: ThemeColors = {
  bg: '#0B0A09',
  bgElevated: '#121010',
  surface: '#171413',
  surfaceAlt: '#201C19',
  surfaceHi: '#2A2421',
  border: 'rgba(247,240,228,0.10)',
  borderStrong: 'rgba(247,240,228,0.26)',
  text: '#F7F0E4',
  textMuted: '#B5A997',
  textFaint: '#7E7367',
  accent: '#FF6A15',
  accentSoft: 'rgba(255,106,21,0.16)',
  accentText: '#17110C',
  gold: '#F5B841',
  success: '#6FCB94',
  successSoft: 'rgba(111,203,148,0.16)',
  danger: '#F4756A',
  dangerSoft: 'rgba(244,117,106,0.16)',
  warning: '#F5B841',
  overlay: 'rgba(11,10,9,0.66)',
  scrim: 'rgba(11,10,9,0.94)',
  shadow: '#000000',
  onImage: '#F7F0E4',
};

export const lightColors: ThemeColors = {
  bg: '#FBF6ED',
  bgElevated: '#FFFDF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F4EBDE',
  surfaceHi: '#EDE1D0',
  border: 'rgba(24,18,14,0.10)',
  borderStrong: 'rgba(24,18,14,0.26)',
  text: '#1A1512',
  textMuted: '#6B6055',
  textFaint: '#91867A',
  accent: '#C8470B',
  accentSoft: 'rgba(200,71,11,0.12)',
  accentText: '#FFF9F2',
  gold: '#9A6B12',
  success: '#2F7D4F',
  successSoft: 'rgba(47,125,79,0.12)',
  danger: '#B23A2A',
  dangerSoft: 'rgba(178,58,42,0.12)',
  warning: '#8A5B00',
  overlay: 'rgba(26,21,18,0.42)',
  scrim: 'rgba(251,246,237,0.94)',
  shadow: '#4A3526',
  onImage: '#FFF9F2',
};

export const gradients = {
  ember: ['#FF9A4D', '#F2610C', '#8E1B12'] as const,
  emberShort: ['#FF8A3D', '#D93A0B'] as const,
  ink: ['rgba(11,10,9,0)', 'rgba(11,10,9,0.55)', 'rgba(11,10,9,0.95)'] as const,
  gold: ['#F5B841', '#F2610C'] as const,
  moss: ['#3F6B47', '#14261A'] as const,
  plum: ['#5B2A63', '#1B0F1D'] as const,
  midnight: ['#243B55', '#0B1220'] as const,
  crimson: ['#D93A0B', '#4A0E06'] as const,
};
