import { Alert, Image, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { publicStorageUrl } from '../lib/media';
import { VideoPost } from './VideoPost';
import { deletePost } from '../services/feed';
import { reportTarget, savePost, unsavePost } from '../services/social';
import { useEffect, useRef, useState } from 'react';
import { colors, radius, spacing, shadow, type } from '../constants/theme';

export function PostCard({ post, currentUserId, onLike, liked }: { post: any; currentUserId?: string; onLike: () => Promise<void>; liked: boolean }) {
  const { width } = useWindowDimensions();
  const [saved, setSaved] = useState(false);
  const lastTap = useRef(0);
  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const community = Array.isArray(post.communities) ? post.communities[0] : post.communities;
  const media = [...(post.post_media || [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  const mediaHeight = Math.max(300, Math.min(610, ((width - spacing.md * 2) * 20) / 13));
  const date = new Date(post.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  useEffect(() => {
    if (currentUserId) import('../services/social').then(({ isPostSaved }) => isPostSaved(currentUserId, post.id).then(r => setSaved(!!r.data)));
  }, [currentUserId, post.id]);

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 320) { if (!liked) void onLike(); lastTap.current = 0; return; }
    lastTap.current = now;
  }
  async function share() { await Share.share({ message: `${post.content || 'A moment on Flik'}${community?.name ? ` · ${community.name}` : ''}` }); }
  async function save() {
    if (!currentUserId) return;
    const r = saved ? await unsavePost(currentUserId, post.id) : await savePost(currentUserId, post.id);
    if (!r.error) setSaved(!saved);
  }
  async function report() {
    if (!currentUserId) return;
    const r = await reportTarget(currentUserId, 'post', post.id, 'Inappropriate or unwanted content');
    Alert.alert(r.error ? 'Report failed' : 'Reported', r.error ? r.error.message : 'Thanks. We’ll review this content.');
  }
  function options() {
    const own = currentUserId === post.author_id;
    Alert.alert('Post options', 'Choose an action', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', onPress: report },
      ...(own ? [{ text: 'Delete', style: 'destructive' as const, onPress: async () => { const r = await deletePost(post.id); if (r.error) Alert.alert('Could not delete', r.error.message); } }] : []),
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push({ pathname: '/profile/[id]', params: { id: post.author_id } })}>
          <Avatar uri={author?.avatar_path} name={author?.full_name} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{author?.full_name || author?.username || 'Flik user'}</Text>
          <Text style={styles.meta}>{community?.name ? `${community.name} · ` : ''}{date}</Text>
        </View>
        <Pressable onPress={options} hitSlop={10} style={styles.iconButton}><MoreHorizontal size={21} color={colors.text} /></Pressable>
      </View>

      {post.content ? <Pressable onPress={handleDoubleTap}><Text style={styles.caption}>{post.content}</Text></Pressable> : null}

      {media.map((m: any) => m.media_type === 'image' ? (
        <Pressable key={m.id} onPress={handleDoubleTap} style={{ position: 'relative' }}>
          <Image source={{ uri: publicStorageUrl('post-media', m.storage_path) }} style={[styles.media, { height: mediaHeight }]} resizeMode="cover" />
          <View style={styles.mediaActions}>
            <Pressable onPress={onLike} style={styles.floatingAction}><Heart size={21} color={colors.white} fill={liked ? colors.accentStrong : 'transparent'} strokeWidth={2.2} /><Text style={styles.floatingCount}>{post.likes?.[0]?.count || 0}</Text></Pressable>
            <Pressable onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} style={styles.floatingAction}><MessageCircle size={21} color={colors.white} strokeWidth={2.2} /><Text style={styles.floatingCount}>{post.comments?.[0]?.count || 0}</Text></Pressable>
            <Pressable onPress={share} style={styles.floatingAction}><Send size={21} color={colors.white} strokeWidth={2.2} /></Pressable>
            <Pressable onPress={save} style={styles.floatingAction}><Bookmark size={21} color={colors.white} fill={saved ? colors.white : 'transparent'} strokeWidth={2.2} /></Pressable>
          </View>
        </Pressable>
      ) : <VideoPost key={m.id} path={m.storage_path} />)}

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Pressable onPress={onLike} style={styles.action}><Heart size={20} color={liked ? colors.accentStrong : colors.text} fill={liked ? colors.accentStrong : 'transparent'} /><Text style={[styles.actionText, liked && { color: colors.accentStrong }]}>{post.likes?.[0]?.count || 0}</Text></Pressable>
          <Pressable onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} style={styles.action}><MessageCircle size={20} color={colors.text} /><Text style={styles.actionText}>{post.comments?.[0]?.count || 0}</Text></Pressable>
          <Pressable onPress={share} style={styles.action}><Send size={20} color={colors.text} /><Text style={styles.actionText}>Share</Text></Pressable>
          <Pressable onPress={save} style={[styles.action, { marginLeft: 'auto' }]}><Bookmark size={20} color={saved ? colors.accentStrong : colors.text} fill={saved ? colors.accentStrong : 'transparent'} /><Text style={[styles.actionText, saved && { color: colors.accentStrong }]}>Save</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow.card },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  name: { ...type.bodyMedium, color: colors.text },
  meta: { ...type.meta, color: colors.muted, marginTop: 2 },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  caption: { ...type.body, color: colors.text, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  media: { width: '100%', backgroundColor: colors.surface },
  mediaActions: { position: 'absolute', right: 12, bottom: 14, gap: 10, alignItems: 'center' },
  floatingAction: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,17,17,0.58)' },
  floatingCount: { color: colors.white, fontFamily: 'DM Sans', fontSize: 10, fontWeight: '700', marginTop: 1 },
  footer: { padding: spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 },
  actionText: { ...type.meta, color: colors.text, fontWeight: '700' },
});
