import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth-store';
import { listConversations } from '../../services/messages';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Chat() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!user) return; listConversations(user.id).then(r => { setItems(r.data || []); setLoading(false); }); }, [user]);

  return <View style={[styles.page, { paddingTop: insets.top + 8 }]}>
    <View style={styles.header}>
      <View style={{ flex: 1 }}><Text style={type.h1}>Messages</Text><Text style={styles.subtitle}>Stay connected to your campus.</Text></View>
      <Pressable style={styles.icon}><Search size={21} color={colors.text} /></Pressable>
    </View>
    {loading ? <View style={{ padding: spacing.md }}><Text style={styles.muted}>Loading conversations…</Text></View> : <FlatList
      data={items}
      keyExtractor={x => x.conversation_id}
      contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 24, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState title="Start a conversation" message="Find someone in Discover and send them a message." />}
      renderItem={({ item }) => {
        const c = item.conversations;
        const other = (c?.conversation_members || []).find((m: any) => m.profile_id !== user?.id)?.profiles;
        const msgs = c?.messages || [];
        const last = [...msgs].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).pop();
        return <Pressable onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.conversation_id } })} style={styles.row}>
          <Avatar uri={other?.avatar_path} name={other?.full_name} size={52} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={styles.name}>{other?.full_name || other?.username || 'Conversation'}</Text>{last ? <Text style={styles.time}>{new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text> : null}</View>
            <Text numberOfLines={1} style={styles.preview}>{last?.content || 'Start a conversation'}</Text>
          </View>
          <MessageCircle size={18} color={colors.subtle} />
        </Pressable>;
      }}
    />}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  subtitle: { ...type.meta, color: colors.muted, marginTop: 3 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 78, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { ...type.bodyMedium, color: colors.text, flex: 1 },
  time: { ...type.meta, color: colors.subtle, marginLeft: 8 },
  preview: { ...type.body, color: colors.muted, marginTop: 4 },
  muted: { ...type.body, color: colors.muted },
});
