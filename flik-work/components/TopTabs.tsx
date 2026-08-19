import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../constants/theme';

export function TopTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {['feed', 'following', 'discover'].map(x => (
        <Pressable
          key={x}
          onPress={() => onChange(x)}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === x }}
          style={styles.tab}
        >
          <Text style={[styles.label, value === x && styles.activeLabel]}>
            {x === 'feed' ? 'For You' : x === 'following' ? 'Following' : 'Discover'}
          </Text>
          <View style={[styles.indicator, value === x && styles.activeIndicator]} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'flex-end', paddingTop: spacing.xs },
  label: { ...type.button, color: colors.muted, paddingBottom: spacing.sm },
  activeLabel: { color: colors.text },
  indicator: { width: 30, height: 2, borderRadius: 2, backgroundColor: 'transparent' },
  activeIndicator: { backgroundColor: colors.accentStrong },
});
