// /home/thyrook/GolandProjects/REST-API(with GIN)/mobile-app/src/theme/typography.ts

/**
 * Type definition for a typography variant in Material Design 3.
 */
export interface TypographyVariant {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  letterSpacing: number;
}

/**
 * Font family constants for cross-platform compatibility.
 * Uses 'System' as the default font family, which maps to platform-specific system fonts
 * (e.g., Roboto on Android, San Francisco on iOS). Custom fonts can be loaded and substituted here.
 */
export const FONT_FAMILIES = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

/**
 * Font weight constants following Material Design 3 specifications.
 */
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  bold: '700',
} as const;

/**
 * Material Design 3 typography scale variants.
 * Values are based on the official MD3 type scale specifications.
 * All measurements are in density-independent pixels (dp).
 */
export const typography = {
  displayLarge: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 57,
    lineHeight: 64,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: -0.25,
  } as TypographyVariant,
  displayMedium: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 45,
    lineHeight: 52,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  displaySmall: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  headlineLarge: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  headlineMedium: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  headlineSmall: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  titleLarge: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
  } as TypographyVariant,
  titleMedium: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.15,
  } as TypographyVariant,
  titleSmall: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.1,
  } as TypographyVariant,
  bodyLarge: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.5,
  } as TypographyVariant,
  bodyMedium: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.25,
  } as TypographyVariant,
  bodySmall: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.4,
  } as TypographyVariant,
  labelLarge: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.1,
  } as TypographyVariant,
  labelMedium: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.5,
  } as TypographyVariant,
  labelSmall: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.5,
  } as TypographyVariant,
} as const;