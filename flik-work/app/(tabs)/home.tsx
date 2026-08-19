import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth-store';
import { useFeed } from '../../hooks/use-feed';
import { PostCard } from '../../components/PostCard';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { TopTabs } from '../../components/TopTabs';
import { DiscoverView } from '../../components/DiscoverView';
import { useFollowingFeed } from '../../hooks/use-following-feed';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Home() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState('feed');
  const [campusId, setCampusId] = useState<string>();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const following = useFollowingFeed(user?.id);
  const listRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('campus_id').eq('id', user.id).single().then(({ data }) => setCampusId(data?.campus_id || undefined));
  }, [user]);

  const feed = useFeed(campusId, user?.id);
  const posts = feed.data?.pages.flatMap(p => p.data || []) || [];
  const followingPosts = following.data?.pages.flatMap(p => p.data || []) || [];

  useEffect(() => {
    if (!user || !posts.length) return;
    supabase.from('likes').select('post_id').eq('profile_id', user.id).in('post_id', posts.map((p: any) => p.id))
      .then(({ data }) => setLiked(Object.fromEntries((data || []).map(x => [x.post_id, true]))));
  }, [user, posts.length]);

  async function like(id: string) {
    if (!user) return;
    const next = !liked[id];
    setLiked(s => ({ ...s, [id]: next }));
    const existing = await supabase.from('likes').select('post_id').eq('post_id', id).eq('profile_id', user.id).maybeSingle();
    const mutation = existing.data
      ? await supabase.from('likes').delete().eq('post_id', id).eq('profile_id', user.id)
      : await supabase.from('likes').insert({ post_id: id, profile_id: user.id });
    if (mutation.error) setLiked(s => ({ ...s, [id]: !next }));
  }

  const renderFeed = (data: any[], loading: boolean, refresh?: () => void) => (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.feedContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <PostCard post={item} currentUserId={user?.id} liked={!!liked[item.id]} onLike={() => like(item.id)} />}
      refreshControl={refresh ? <RefreshControl refreshing={feed.isRefetching} onRefresh={refresh} tintColor={colors.accentStrong} /> : undefined}
      onEndReached={() => {
        if (tab === 'feed' && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
        if (tab === 'following' && following.hasNextPage && !following.isFetchingNextPage) following.fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={loading ? <View style={styles.skeletonList}>{[1, 2, 3].map(x => <Skeleton key={x} height={310} radius={radius.lg} />)}</View> : null}
      ListEmptyComponent={!loading ? <EmptyState title={tab === 'following' ? 'Your following feed is quiet' : 'Be the first to post'} message={tab === 'following' ? 'Follow more students to build your feed.' : 'Share what is happening on campus.'} /> : null}
      ListFooterComponent={(feed.isFetchingNextPage || following.isFetchingNextPage) ? <ActivityIndicator style={styles.footerLoader} color={colors.accentStrong} /> : null}
    />
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.logo}>flik</Text>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Search" hitSlop={10} onPress={() => setTab('discover')} style={styles.headerButton}>
              <Search size={21} color={colors.text} strokeWidth={2.2} />
            </Pressable>
            <Pressable accessibilityLabel="Notifications" hitSlop={10} onPress={() => router.push('/notifications')} style={styles.headerButton}>
              <Bell size={21} color={colors.text} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
        <TopTabs value={tab} onChange={setTab} />
      </View>

      {tab === 'discover' ? (
        <View style={styles.discover}><DiscoverView /></View>
      ) : renderFeed(tab === 'following' ? followingPosts : posts, tab === 'following' ? following.isPending : feed.isPending, () => feed.refetch())}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  brandRow: { height: 50, flexDirection: 'row', alignItems: 'center' },
  logo: { ...type.display, color: colors.accentStrong, letterSpacing: -1.5 },
  headerActions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  feedContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 28, gap: spacing.md, flexGrow: 1 },
  skeletonList: { gap: spacing.md, paddingTop: 2 },
  footerLoader: { paddingVertical: spacing.lg },
  discover: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
});
