export const colors = {
  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceStrong: '#F1F3F5',
  text: '#111111',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E8EAED',
  accent: '#60A5FA',
  accentStrong: '#3B82F6',
  accentSoft: '#EAF4FF',
  danger: '#EF4444',
  success: '#16A34A',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

export const type = {
  display: { fontFamily: 'Syne_700Bold', fontSize: 30, lineHeight: 36 },
  h1: { fontFamily: 'Syne_700Bold', fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: 'Syne_700Bold', fontSize: 21, lineHeight: 27 },
  body: { fontFamily: 'DM Sans', fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: 'DM Sans', fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  meta: { fontFamily: 'DM Sans', fontSize: 12, lineHeight: 17 },
  button: { fontFamily: 'DM Sans', fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
} as const;

export const shadow = {
  card: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
} as const;
