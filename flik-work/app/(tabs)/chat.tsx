import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle, Search, SlidersHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { listConversations } from '../../services/messages';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Chat() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => { if (!user) return; listConversations(user.id).then(r => { setItems(r.data || []); setLoading(false); }); }, [user]);
  const visible = items.filter(item => {
    const other = (item.conversations?.conversation_members || []).find((m: any) => m.profile_id !== user?.id)?.profiles;
    return !query.trim() || `${other?.full_name || ''} ${other?.username || ''}`.toLowerCase().includes(query.toLowerCase());
  });

  return <View style={[styles.page, { paddingTop: insets.top + 6 }]}>
    <View style={styles.header}>
      <View style={{ flex: 1 }}><Text style={type.h1}>Chat</Text><Text style={styles.subtitle}>Your campus conversations.</Text></View>
      <Pressable style={styles.icon}><SlidersHorizontal size={19} color={colors.text} /></Pressable>
    </View>
    <View style={styles.search}><Search size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search messages" placeholderTextColor={colors.subtle} style={styles.searchInput} /></View>
    {loading ? <View style={styles.skeletons}>{[1,2,3,4].map(x => <Skeleton key={x} height={70} radius={radius.md} />)}</View> : <FlatList
      data={visible}
      keyExtractor={x => x.conversation_id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState title="Start a conversation" message="Find someone in Discover and send them a message." />}
      renderItem={({ item }) => {
        const c = item.conversations;
        const other = (c?.conversation_members || []).find((m: any) => m.profile_id !== user?.id)?.profiles;
        const msgs = c?.messages || [];
        const last = [...msgs].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).pop();
        return <Pressable onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.conversation_id } })} style={styles.row}>
          <View><Avatar uri={other?.avatar_path} name={other?.full_name} size={54} />{last && last.sender_id !== user?.id ? <View style={styles.onlineDot} /> : null}</View>
          <View style={styles.rowBody}>
            <View style={styles.nameLine}><Text numberOfLines={1} style={styles.name}>{other?.full_name || other?.username || 'Conversation'}</Text>{last ? <Text style={styles.time}>{new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text> : null}</View>
            <View style={styles.previewLine}><Text numberOfLines={1} style={styles.preview}>{last?.content || 'Start a conversation'}</Text>{last && last.sender_id !== user?.id ? <View style={styles.unread}><Text style={styles.unreadText}>•</Text></View> : <MessageCircle size={16} color={colors.subtle} />}</View>
          </View>
        </Pressable>;
      }}
    />}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  subtitle: { ...type.meta, color: colors.muted, marginTop: 3 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: spacing.md, height: 48, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text },
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 28, flexGrow: 1 },
  skeletons: { padding: spacing.md, gap: 10 },
  row: { minHeight: 78, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  rowBody: { flex: 1, marginLeft: 12 },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  name: { ...type.bodyMedium, color: colors.text, flex: 1 },
  time: { ...type.meta, color: colors.subtle, marginLeft: 8 },
  previewLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  preview: { ...type.body, color: colors.muted, flex: 1 },
  unread: { width: 19, height: 19, borderRadius: 10, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: colors.white, fontSize: 15, lineHeight: 15 },
  onlineDot: { position: 'absolute', right: 0, bottom: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.white },
});
