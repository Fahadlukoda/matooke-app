export const fills = {
  matooke: {
    50: '#F5F7EE',
    100: '#E8EDDC',
    200: '#D4DCC2',
    300: '#B8C4A0',
    400: '#94A676',
    500: '#6B8E23',
    600: '#557319',
    700: '#3E5412',
    800: '#2A3A0C',
    900: '#1A2507',
  },
  gold: {
    100: '#F7EFD6',
    400: '#E5C766',
    500: '#D4AF37',
    600: '#A8891F',
  },
  clay: {
    100: '#FAE8DD',
    500: '#C85A2C',
  },
  ink: {
    900: '#17181A',
    700: '#3E3F42',
    500: '#6B6C70',
    300: '#A8A9AC',
  },
  paper: '#FBFBF7',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  runTrack: '#6B8E23',
  runActive: '#E5C766',
} as const;

export const textColors = {
  matooke: {
    50: '#F5F7EE',
    100: '#E8EDDC',
    200: '#D4DCC2',
    300: '#B8C4A0',
    400: '#94A676',
    600: '#557319',
    700: '#3E5412',
    800: '#2A3A0C',
    900: '#1A2507',
  },
  gold: {
    100: '#F7EFD6',
    400: '#E5C766',
    500: '#D4AF37',
    600: '#A8891F',
  },
  clay: {
    100: '#FAE8DD',
    500: '#C85A2C',
  },
  ink: {
    900: '#17181A',
    700: '#3E3F42',
    500: '#6B6C70',
    300: '#A8A9AC',
  },
  paper: '#FBFBF7',
  white: '#FFFFFF',
} as const;

export type Fills = typeof fills;
export type TextColors = typeof textColors;