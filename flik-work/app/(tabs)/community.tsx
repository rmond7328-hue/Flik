import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, Search, UsersRound, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { listCommunities, createCommunity } from '../../services/feed';
import { supabase } from '../../lib/supabase';
import { CommunityCard } from '../../components/CommunityCard';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, spacing, type, shadow } from '../../constants/theme';

export default function Community() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<any[]>([]); const [campus, setCampus] = useState<string>(); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [rules, setRules] = useState(''); const [privateC, setPrivateC] = useState(false); const [creating, setCreating] = useState(false); const [query, setQuery] = useState('');
  async function load() { if (!user) return; const p = await supabase.from('profiles').select('campus_id').eq('id', user.id).single(); setCampus(p.data?.campus_id); if (p.data?.campus_id) { const r = await listCommunities(p.data.campus_id); setItems(r.data || []); } setLoading(false); }
  useEffect(() => { load(); }, [user]);
  async function create() { if (!user || !campus || name.trim().length < 3) return Alert.alert('Community name required', 'Use at least 3 characters.'); setCreating(true); const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const r = await createCommunity({ name: name.trim(), slug, description: desc.trim(), rules: rules.trim(), campus_id: campus, created_by: user.id, visibility: privateC ? 'private' : 'public' }); setCreating(false); if (r.error) return Alert.alert('Could not create community', r.error.message); setOpen(false); setName(''); setDesc(''); setRules(''); setPrivateC(false); load(); router.push({ pathname: '/community/[id]', params: { id: r.data.id } }); }
  const filtered = items.filter(x => !query.trim() || `${x.name} ${x.description || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <View style={[styles.page, { paddingTop: insets.top + 6 }]}>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={type.h1}>Community</Text><Text style={styles.subtitle}>Find your people on campus.</Text></View><Pressable onPress={() => setOpen(true)} style={styles.create}><Plus size={17} color={colors.white} /><Text style={styles.createText}>Create</Text></Pressable></View>
    <View style={styles.search}><Search size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search communities" placeholderTextColor={colors.subtle} style={styles.searchInput} /></View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>For your campus</Text><Text style={styles.count}>{filtered.length} communities</Text></View>
    {loading ? <View style={styles.skeletons}>{[1, 2, 3].map(x => <Skeleton key={x} height={132} radius={radius.lg} />)}</View> : <FlatList contentContainerStyle={styles.list} data={filtered} keyExtractor={x => x.id} renderItem={({ item }) => <CommunityCard community={item} />} ListEmptyComponent={<EmptyState title={query ? 'Nothing found' : 'Find your people'} message={query ? 'Try a different community name.' : 'Create the first community for your campus.'} actionLabel={!query ? 'Create community' : undefined} onAction={!query ? () => setOpen(true) : undefined} />} />}
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={type.h2}>Create community</Text><Text style={styles.sheetHint}>Give students a place to connect.</Text></View><Pressable onPress={() => setOpen(false)} style={styles.close}><X size={20} color={colors.text} /></Pressable></View><TextInput placeholder="Community name" placeholderTextColor={colors.subtle} value={name} onChangeText={setName} style={styles.input} /><TextInput placeholder="Description" placeholderTextColor={colors.subtle} value={desc} onChangeText={setDesc} multiline style={[styles.input, { minHeight: 82, textAlignVertical: 'top' }]} /><TextInput placeholder="Community rules" placeholderTextColor={colors.subtle} value={rules} onChangeText={setRules} multiline style={[styles.input, { minHeight: 82, textAlignVertical: 'top' }]} /><Pressable onPress={() => setPrivateC(!privateC)} style={[styles.visibility, privateC && styles.visibilityActive]}><UsersRound size={18} color={colors.accentStrong} /><View style={{ flex: 1 }}><Text style={styles.visibilityText}>{privateC ? 'Private community' : 'Public community'}</Text><Text style={styles.visibilityHint}>{privateC ? 'New members require approval.' : 'Anyone on your campus can join.'}</Text></View><Text style={styles.change}>Change</Text></Pressable><View style={styles.modalActions}><Pressable onPress={() => setOpen(false)} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable><Pressable onPress={create} disabled={creating} style={styles.primary}><Text style={styles.primaryText}>{creating ? 'Creating…' : 'Create'}</Text></Pressable></View></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  subtitle: { ...type.meta, color: colors.muted, marginTop: 3 },
  create: { height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: colors.accentStrong, flexDirection: 'row', gap: 6, alignItems: 'center', ...shadow.floating },
  createText: { ...type.button, color: colors.white },
  search: { marginHorizontal: spacing.md, height: 48, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text },
  sectionHead: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'baseline' },
  sectionTitle: { ...type.h3, color: colors.text, flex: 1 },
  count: { ...type.meta, color: colors.muted },
  list: { paddingHorizontal: spacing.md, paddingBottom: 28, gap: 12, flexGrow: 1 },
  skeletons: { paddingHorizontal: spacing.md, gap: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { backgroundColor: colors.white, padding: spacing.lg, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, gap: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  sheetHint: { ...type.meta, color: colors.muted, marginTop: 2 },
  close: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  visibility: { minHeight: 62, borderRadius: radius.md, backgroundColor: colors.accentSoft, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  visibilityActive: { borderWidth: 1, borderColor: colors.accent },
  visibilityText: { ...type.bodyMedium, color: colors.text },
  visibilityHint: { ...type.meta, color: colors.muted, marginTop: 1 },
  change: { ...type.meta, color: colors.accentStrong, fontFamily: 'DMSans_700Bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 3 },
  primary: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  primaryText: { ...type.button, color: colors.white },
  secondary: { flex: 1, height: 50, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...type.button, color: colors.text },
});
