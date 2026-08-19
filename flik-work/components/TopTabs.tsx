import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, type } from '../constants/theme';

export function TopTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.container}>
      {['feed', 'following', 'discover'].map(x => (
        <Pressable key={x} onPress={() => onChange(x)} style={[styles.tab, value === x && styles.active]}>
          <Text style={[styles.label, value === x && styles.activeLabel]}>{x === 'feed' ? 'For You' : x === 'following' ? 'Following' : 'Discover'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.white },
  label: { ...type.button, color: colors.muted },
  activeLabel: { color: colors.text },
});
