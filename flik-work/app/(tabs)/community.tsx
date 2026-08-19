import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, UsersRound, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { listCommunities, createCommunity } from '../../services/feed';
import { supabase } from '../../lib/supabase';
import { CommunityCard } from '../../components/CommunityCard';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Community() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<any[]>([]); const [campus, setCampus] = useState<string>(); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [rules, setRules] = useState(''); const [privateC, setPrivateC] = useState(false); const [creating, setCreating] = useState(false);
  async function load() { if (!user) return; const p = await supabase.from('profiles').select('campus_id').eq('id', user.id).single(); setCampus(p.data?.campus_id); if (p.data?.campus_id) { const r = await listCommunities(p.data.campus_id); setItems(r.data || []); } setLoading(false); }
  useEffect(() => { load(); }, [user]);
  async function create() { if (!user || !campus || name.trim().length < 3) return; setCreating(true); const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const r = await createCommunity({ name: name.trim(), slug, description: desc.trim(), rules: rules.trim(), campus_id: campus, created_by: user.id, visibility: privateC ? 'private' : 'public' }); setCreating(false); if (r.error) return Alert.alert('Could not create community', r.error.message); setOpen(false); setName(''); setDesc(''); setRules(''); setPrivateC(false); load(); router.push({ pathname: '/community/[id]', params: { id: r.data.id } }); }
  return <View style={[styles.page, { paddingTop: insets.top + 8 }]}>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={type.h1}>Community</Text><Text style={styles.subtitle}>Find your people on campus.</Text></View><Pressable onPress={() => setOpen(true)} style={styles.create}><Plus size={18} color={colors.white} /><Text style={styles.createText}>Create</Text></Pressable></View>
    {loading ? <View style={{ padding: spacing.md, gap: 12 }}>{[1, 2, 3].map(x => <Skeleton key={x} height={132} radius={radius.lg} />)}</View> : <FlatList contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 24, gap: 12, flexGrow: 1 }} data={items} keyExtractor={x => x.id} renderItem={({ item }) => <CommunityCard community={item} />} ListEmptyComponent={<EmptyState title="Find your people" message="Create the first community for your campus." actionLabel="Create community" onAction={() => setOpen(true)} />} />}
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><Text style={type.h2}>New community</Text><Pressable onPress={() => setOpen(false)}><X size={22} color={colors.text} /></Pressable></View><TextInput placeholder="Community name" placeholderTextColor={colors.subtle} value={name} onChangeText={setName} style={styles.input} /><TextInput placeholder="Description" placeholderTextColor={colors.subtle} value={desc} onChangeText={setDesc} multiline style={[styles.input, { minHeight: 82, textAlignVertical: 'top' }]} /><TextInput placeholder="Community rules" placeholderTextColor={colors.subtle} value={rules} onChangeText={setRules} multiline style={[styles.input, { minHeight: 82, textAlignVertical: 'top' }]} /><Pressable onPress={() => setPrivateC(!privateC)} style={styles.visibility}><UsersRound size={18} color={colors.accentStrong} /><Text style={styles.visibilityText}>{privateC ? 'Private community' : 'Public community'}</Text><Text style={styles.change}>Change</Text></Pressable><View style={{ flexDirection: 'row', gap: 10 }}><Pressable onPress={() => setOpen(false)} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable><Pressable onPress={create} disabled={creating} style={styles.primary}><Text style={styles.primaryText}>{creating ? 'Creating…' : 'Create'}</Text></Pressable></View></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  subtitle: { ...type.meta, color: colors.muted, marginTop: 3 },
  create: { height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: colors.accentStrong, flexDirection: 'row', gap: 6, alignItems: 'center' },
  createText: { ...type.button, color: colors.white },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { backgroundColor: colors.white, padding: spacing.lg, paddingBottom: 30, borderTopLeftRadius: 26, borderTopRightRadius: 26, gap: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  visibility: { height: 50, borderRadius: radius.md, backgroundColor: colors.accentSoft, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  visibilityText: { ...type.bodyMedium, color: colors.text, flex: 1 },
  change: { ...type.meta, color: colors.accentStrong, fontWeight: '700' },
  primary: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...type.button, color: colors.white },
  secondary: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...type.button, color: colors.text },
});
