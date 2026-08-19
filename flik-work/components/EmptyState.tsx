import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, radius, spacing, type } from '../constants/theme';

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return <View style={styles.container}>
    <View style={styles.icon}><Sparkles size={22} color={colors.accentStrong} /></View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction ? <Pressable onPress={onAction} style={styles.button}><Text style={styles.buttonText}>{actionLabel}</Text></Pressable> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 220 },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.h2, color: colors.text, textAlign: 'center' },
  message: { ...type.body, color: colors.muted, textAlign: 'center', maxWidth: 300 },
  button: { marginTop: 8, paddingHorizontal: 18, height: 46, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  buttonText: { ...type.button, color: colors.white },
});
