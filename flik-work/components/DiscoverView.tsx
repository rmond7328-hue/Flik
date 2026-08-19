import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, Clock3, X, Users, UserRound, FileText, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '../stores/auth-store';
import { searchPeople, searchCommunities, searchPosts } from '../services/social';
import { UserCard } from './UserCard';
import { CommunityCard } from './CommunityCard';
import { EmptyState } from './EmptyState';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing, type, shadow } from '../constants/theme';

export function DiscoverView() {
  const user = useAuthStore(s => s.user); const [q, setQ] = useState(''); const [results, setResults] = useState<any>({ people: [], communities: [], posts: [] }); const [campus, setCampus] = useState<string>(); const [loading, setLoading] = useState(false); const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { if (!user) return; supabase.from('profiles').select('campus_id').eq('id', user.id).single().then(({ data }) => setCampus(data?.campus_id)); }, [user]);
  useEffect(() => { if (!q.trim()) { setResults({ people: [], communities: [], posts: [] }); return; } const t = setTimeout(async () => { setLoading(true); const [p, c, ps] = await Promise.all([searchPeople(q.trim(), campus, user?.id), searchCommunities(q.trim(), campus), searchPosts(q.trim(), campus)]); setResults({ people: p.data || [], communities: c.data || [], posts: ps.data || [] }); setRecent(x => [q.trim(), ...x.filter(v => v.toLowerCase() !== q.trim().toLowerCase())].slice(0, 6)); setLoading(false); }, 300); return () => clearTimeout(t); }, [q, campus]);
  const has = results.people.length || results.communities.length || results.posts.length;
  const clear = () => { setQ(''); setResults({ people: [], communities: [], posts: [] }); };
  const data = [...results.people.map((x: any) => ({ kind: 'person', data: x })), ...results.communities.map((x: any) => ({ kind: 'community', data: x })), ...results.posts.map((x: any) => ({ kind: 'post', data: x }))];
  return <View style={{ flex: 1 }}>
    <View style={styles.search}><Search size={19} color={colors.muted} /><TextInput value={q} onChangeText={setQ} placeholder="Search people, communities, posts" placeholderTextColor={colors.subtle} style={styles.input} returnKeyType="search" /><Pressable onPress={clear} hitSlop={8}><X size={18} color={colors.subtle} /></Pressable></View>
    {loading ? <View style={styles.loading}><Text style={styles.muted}>Searching your campus…</Text></View> : !q ? <View style={styles.discovery}>
      <View style={styles.intro}><View style={styles.introIcon}><TrendingUp size={20} color={colors.accentStrong} /></View><View style={{ flex: 1 }}><Text style={styles.introTitle}>Discover your campus</Text><Text style={styles.introText}>Find students, communities and moments around you.</Text></View></View>
      <Text style={styles.sectionTitle}>Recent searches</Text>
      {recent.length ? <View style={styles.recentList}>{recent.map(x => <Pressable key={x} onPress={() => setQ(x)} style={styles.recent}><Clock3 size={16} color={colors.subtle} /><Text style={styles.recentText}>{x}</Text><X size={15} color={colors.subtle} /></Pressable>)}</View> : <Text style={styles.muted}>Your recent searches will appear here.</Text>}
      <Text style={styles.sectionTitle}>Explore</Text>
      <View style={styles.exploreGrid}><View style={styles.exploreCard}><UserRound size={19} color={colors.accentStrong} /><Text style={styles.exploreTitle}>People</Text><Text style={styles.exploreText}>Meet students</Text></View><View style={styles.exploreCard}><Users size={19} color={colors.accentStrong} /><Text style={styles.exploreTitle}>Communities</Text><Text style={styles.exploreText}>Find your groups</Text></View><View style={styles.exploreCard}><FileText size={19} color={colors.accentStrong} /><Text style={styles.exploreTitle}>Posts</Text><Text style={styles.exploreText}>See what's trending</Text></View></View>
    </View> : !has ? <EmptyState title="Nothing found" message="Try another name or keyword." /> : <FlatList data={data} keyExtractor={(x, i) => `${x.kind}-${x.data.id}-${i}`} contentContainerStyle={styles.results} renderItem={({ item }) => item.kind === 'person' ? <UserCard user={item.data} /> : item.kind === 'community' ? <CommunityCard community={item.data} /> : <View style={styles.post}><Text style={styles.postLabel}>POST</Text><Text style={styles.postName}>{item.data.profiles?.full_name || item.data.profiles?.username}</Text><Text numberOfLines={4} style={styles.postText}>{item.data.content}</Text></View>} />}
  </View>;
}
const styles = StyleSheet.create({
  search: { height: 50, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text },
  loading: { paddingTop: spacing.md },
  discovery: { paddingTop: spacing.md },
  intro: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#D9ECFF', flexDirection: 'row', gap: 11, alignItems: 'center', marginBottom: spacing.lg },
  introIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  introTitle: { ...type.bodyMedium, color: colors.text },
  introText: { ...type.meta, color: colors.muted, marginTop: 2 },
  sectionTitle: { ...type.h3, color: colors.text, marginBottom: 10 },
  recentList: { gap: 8, marginBottom: spacing.lg },
  recent: { minHeight: 46, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 9 },
  recentText: { ...type.body, color: colors.text, flex: 1 },
  exploreGrid: { flexDirection: 'row', gap: 8 },
  exploreCard: { flex: 1, minHeight: 112, padding: 12, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  exploreTitle: { ...type.label, color: colors.text, marginTop: 10 },
  exploreText: { ...type.meta, color: colors.muted, marginTop: 2 },
  results: { paddingTop: 12, paddingBottom: 24, gap: 10 },
  post: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, ...shadow.card },
  postLabel: { ...type.meta, color: colors.accentStrong, fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  postName: { ...type.bodyMedium, color: colors.text, marginBottom: 5 },
  postText: { ...type.body, color: colors.muted },
  muted: { ...type.body, color: colors.muted },
});
