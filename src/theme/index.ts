import { Easing } from 'react-native-reanimated';
import type { FontVariant } from 'react-native';
import { fills, textColors } from './palette';
import type { Fills, TextColors } from './palette';

export { fills, textColors };
export type { Fills, TextColors };

export const semantic = {
  bg: {
    page: fills.matooke[50],
    raised: fills.matooke[100],
    pop: fills.paper,
    inset: fills.matooke[100],
    overlay: 'rgba(23, 24, 26, 0.4)',
  },
  text: {
    primary: textColors.ink[900],
    secondary: textColors.ink[500],
    tertiary: textColors.ink[300],
    onBrand: textColors.paper,
    brand: textColors.matooke[700],
    brandStrong: textColors.matooke[800],
    gold: textColors.gold[600],
    goldBright: textColors.gold[500],
    danger: textColors.clay[500],
    disabled: textColors.matooke[400],
  },
  border: {
    muted: fills.matooke[200],
    focus: fills.matooke[700],
    danger: fills.clay[500],
  },
  brand: {
    base: fills.matooke[500],
    pressed: fills.matooke[600],
    deep: fills.matooke[700],
  },
  status: {
    pending: fills.gold[400],
    success: fills.matooke[500],
    danger: fills.clay[500],
    info: fills.matooke[400],
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
  '5xl': 72,
} as const;

export const radii = {
  badge: 8,
  button: 12,
  input: 12,
  row: 16,
  chip: 16,
  card: 24,
  sheet: 24,
  hero: 32,
  pill: 999,
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

const tabular: FontVariant[] = ['tabular-nums'];

export const type = {
  displayXL: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  displayL: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 29,
    letterSpacing: -0.3,
  },
  displayM: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  bodyL: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 26,
  },
  bodyM: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyS: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: tabular,
  },
} as const;

export const shadows = {
  raised: {
    shadowColor: '#C4CBAF',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 6, height: 6 },
    elevation: 6,
  },
  raisedLg: {
    shadowColor: '#C4CBAF',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 10, height: 10 },
    elevation: 12,
  },
  pressed: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: -3, height: -3 },
    elevation: 2,
  },
  raisedOnRaised: {
    shadowColor: '#B8C09E',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 6, height: 6 },
    elevation: 6,
  },
} as const;

export const motion = {
  duration: {
    fast: 120,
    base: 200,
    slow: 320,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    enter: Easing.bezier(0, 0, 0.2, 1),
    exit: Easing.bezier(0.4, 0, 1, 1),
  },
  press: {
    scale: 0.98,
  },
  lift: {
    translateY: -2,
  },
} as const;

export const theme = {
  fills,
  textColors,
  semantic,
  spacing,
  radii,
  fonts,
  type,
  shadows,
  motion,
} as const;

export type Theme = typeof theme;