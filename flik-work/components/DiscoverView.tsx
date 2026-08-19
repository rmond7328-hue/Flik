import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, Clock3, X } from 'lucide-react-native';
import { useAuthStore } from '../stores/auth-store';
import { searchPeople, searchCommunities, searchPosts } from '../services/social';
import { UserCard } from './UserCard';
import { CommunityCard } from './CommunityCard';
import { EmptyState } from './EmptyState';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing, type } from '../constants/theme';

export function DiscoverView() {
  const user = useAuthStore(s => s.user); const [q, setQ] = useState(''); const [results, setResults] = useState<any>({ people: [], communities: [], posts: [] }); const [campus, setCampus] = useState<string>(); const [loading, setLoading] = useState(false); const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { if (!user) return; supabase.from('profiles').select('campus_id').eq('id', user.id).single().then(({ data }) => setCampus(data?.campus_id)); }, [user]);
  useEffect(() => { if (!q.trim()) { setResults({ people: [], communities: [], posts: [] }); return; } const t = setTimeout(async () => { setLoading(true); const [p, c, ps] = await Promise.all([searchPeople(q.trim(), campus, user?.id), searchCommunities(q.trim(), campus), searchPosts(q.trim(), campus)]); setResults({ people: p.data || [], communities: c.data || [], posts: ps.data || [] }); setRecent(x => [q.trim(), ...x.filter(v => v.toLowerCase() !== q.trim().toLowerCase())].slice(0, 6)); setLoading(false); }, 300); return () => clearTimeout(t); }, [q, campus]);
  const has = results.people.length || results.communities.length || results.posts.length;
  return <View style={{ flex: 1 }}>
    <View style={styles.search}><Search size={20} color={colors.muted} /><TextInput value={q} onChangeText={setQ} placeholder="Search people, communities, posts" placeholderTextColor={colors.subtle} style={styles.input} /><Pressable onPress={() => setQ('')}><X size={18} color={colors.subtle} /></Pressable></View>
    {loading ? <Text style={styles.muted}>Searching your campus…</Text> : !q ? <View style={{ paddingTop: 10 }}><Text style={type.h2}>Recent searches</Text>{recent.length ? <View style={{ gap: 8, marginTop: 12 }}>{recent.map(x => <Pressable key={x} onPress={() => setQ(x)} style={styles.recent}><Clock3 size={16} color={colors.subtle} /><Text style={styles.recentText}>{x}</Text></Pressable>)}</View> : <Text style={[styles.muted, { marginTop: 8 }]}>Search for people, communities and posts.</Text>}</View> : !has ? <EmptyState title="Nothing found" message="Try another name or keyword." /> : <FlatList data={[...results.people.map((x: any) => ({ kind: 'person', data: x })), ...results.communities.map((x: any) => ({ kind: 'community', data: x })), ...results.posts.map((x: any) => ({ kind: 'post', data: x }))]} keyExtractor={(x, i) => `${x.kind}-${x.data.id}-${i}`} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, gap: 10 }} renderItem={({ item }) => item.kind === 'person' ? <UserCard user={item.data} /> : item.kind === 'community' ? <CommunityCard community={item.data} /> : <View style={styles.post}><Text style={styles.postName}>{item.data.profiles?.full_name || item.data.profiles?.username}</Text><Text numberOfLines={3} style={styles.postText}>{item.data.content}</Text></View>} />}
  </View>;
}
const styles = StyleSheet.create({ search: { height: 50, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text }, muted: { ...type.body, color: colors.muted }, recent: { minHeight: 46, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 9 }, recentText: { ...type.body, color: colors.text }, post: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, postName: { ...type.bodyMedium, color: colors.text, marginBottom: 5 }, postText: { ...type.body, color: colors.muted } });
