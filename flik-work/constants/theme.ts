export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceStrong: '#EEEEEE',
  text: '#111111',
  textSoft: '#27272A',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#60A5FA',
  accentStrong: '#3B82F6',
  accentSoft: '#EAF4FF',
  danger: '#EF4444',
  success: '#16A34A',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.58)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const type = {
  display: { fontFamily: 'Syne_700Bold', fontSize: 30, lineHeight: 36 },
  h1: { fontFamily: 'Syne_700Bold', fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: 'Syne_700Bold', fontSize: 21, lineHeight: 27 },
  h3: { fontFamily: 'Syne_700Bold', fontSize: 18, lineHeight: 24 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22 },
  meta: { fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 17 },
  button: { fontFamily: 'DMSans_700Bold', fontSize: 14, lineHeight: 20 },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, lineHeight: 18 },
} as const;

export const shadow = {
  card: { shadowColor: '#000000', shadowOpacity: 0.055, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  floating: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
} as const;
