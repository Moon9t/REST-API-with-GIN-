export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  surfaceDisabled: string;
  onSurfaceDisabled: string;
  backdrop: string;
}

export const lightColors: ColorScheme = {
  primary: '#0061A6',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1E4FF',
  onPrimaryContainer: '#001D35',
  secondary: '#535F70',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D7E3F7',
  onSecondaryContainer: '#111C2B',
  tertiary: '#6B5778',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F2DAFF',
  onTertiaryContainer: '#251431',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FEFBFF',
  onBackground: '#1A1C1E',
  surface: '#FEFBFF',
  onSurface: '#1A1C1E',
  surfaceVariant: '#DDE3EA',
  onSurfaceVariant: '#41484D',
  outline: '#71787E',
  outlineVariant: '#C1C7CE',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2E3133',
  inverseOnSurface: '#F0F0F4',
  inversePrimary: '#9ECAFF',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#F7F9FC',
    level3: '#F1F3F6',
    level4: '#EBEEF2',
    level5: '#E5E9ED',
  },
  surfaceDisabled: '#1A1C1E1F',
  onSurfaceDisabled: '#1A1C1E61',
  backdrop: '#00000033',
};

export const darkColors: ColorScheme = {
  primary: '#9ECAFF',
  onPrimary: '#003257',
  primaryContainer: '#00497D',
  onPrimaryContainer: '#D1E4FF',
  secondary: '#BBC7DB',
  onSecondary: '#263141',
  secondaryContainer: '#3C4759',
  onSecondaryContainer: '#D7E3F7',
  tertiary: '#D6BEE4',
  onTertiary: '#3B2948',
  tertiaryContainer: '#523F5F',
  onTertiaryContainer: '#F2DAFF',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#0F1419',
  onBackground: '#E0E2E8',
  surface: '#0F1419',
  onSurface: '#E0E2E8',
  surfaceVariant: '#41484D',
  onSurfaceVariant: '#C1C7CE',
  outline: '#8B9198',
  outlineVariant: '#41484D',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E0E2E8',
  inverseOnSurface: '#2E3133',
  inversePrimary: '#0061A6',
  elevation: {
    level0: 'transparent',
    level1: '#0F14191F',
    level2: '#0F141933',
    level3: '#0F14194A',
    level4: '#0F141961',
    level5: '#0F141978',
  },
  surfaceDisabled: '#E0E2E833',
  onSurfaceDisabled: '#E0E2E84D',
  backdrop: '#0000004D',
};

export const fallbackColors: ColorScheme = lightColors;