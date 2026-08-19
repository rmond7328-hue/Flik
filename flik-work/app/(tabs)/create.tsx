import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown, ImagePlus, Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { createPost, uploadPostMedia, attachPostMedia, listCommunities } from '../../services/feed';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing, type, shadow } from '../../constants/theme';

export default function Create() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('campus_id').eq('id', user.id).single().then(async ({ data }) => {
      if (data?.campus_id) {
        const r = await listCommunities(data.campus_id);
        setCommunities(r.data || []);
      }
    });
  }, [user]);

  async function pick() {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) return Alert.alert('Photos permission needed', 'Allow Flik to choose photos or videos for your post.');
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsMultipleSelection: true, quality: 0.82 });
    if (!r.canceled) setMedia(r.assets);
  }

  async function submit() {
    if (!user || (!content.trim() && !media.length)) return Alert.alert('Add something', 'Write a post or attach media.');
    setBusy(true);
    const profile = await supabase.from('profiles').select('campus_id').eq('id', user.id).single();
    if (!profile.data?.campus_id) { setBusy(false); return Alert.alert('Campus required', 'Complete your campus setup first.'); }
    const created = await createPost({ author_id: user.id, campus_id: profile.data.campus_id, community_id: selected, content: content.trim() });
    if (created.error || !created.data) { setBusy(false); return Alert.alert('Could not create post', 'We could not publish your post. Try again.'); }
    const attached: any[] = [];
    for (let i = 0; i < media.length; i++) {
      setProgress(`Uploading ${i + 1} of ${media.length}…`);
      const a = media[i];
      const mime = a.mimeType || (a.type === 'video' ? 'video/mp4' : 'image/jpeg');
      const up = await uploadPostMedia(a.uri, user.id, created.data.id, mime);
      if (up.error) { await supabase.from('posts').delete().eq('id', created.data.id); setBusy(false); return Alert.alert('Upload failed', 'Your post was not published because media upload failed.'); }
      attached.push({ media_type: a.type === 'video' ? 'video' : 'image', storage_path: up.data.path, sort_order: i });
    }
    const linked = await attachPostMedia(created.data.id, attached);
    setBusy(false);
    if (linked.error) { await supabase.from('posts').delete().eq('id', created.data.id); return Alert.alert('Could not finish post', 'Please try again.'); }
    setContent(''); setMedia([]); setSelected(null); setProgress('');
    router.replace('/home');
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 6 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.close}><X size={20} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        <Pressable onPress={submit} disabled={busy} style={[styles.publish, busy && { opacity: 0.55 }]}><Text style={styles.publishText}>{busy ? 'Posting…' : 'Post'}</Text></Pressable>
      </View>

      <View style={styles.authorRow}>
        <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetter}>{(user?.email?.[0] || 'F').toUpperCase()}</Text></View>
        <View><Text style={styles.authorName}>Your Flik moment</Text><Pressable style={styles.audience}><Text style={styles.audienceText}>{communities.find(c => c.id === selected)?.name || 'Your campus'}</Text><ChevronDown size={13} color={colors.muted} /></Pressable></View>
      </View>

      <TextInput value={content} onChangeText={setContent} multiline autoFocus={false} placeholder="What's on your mind?" placeholderTextColor={colors.subtle} style={styles.textarea} />

      {media.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>{media.map((m, i) => <View key={m.assetId || i} style={styles.mediaItem}>{m.type === 'image' ? <Image source={{ uri: m.uri }} style={styles.mediaImage} /> : <View style={styles.videoPreview}><Camera size={22} color={colors.white} /><Text style={styles.videoLabel}>Video</Text></View>}<Pressable onPress={() => setMedia(x => x.filter((_, j) => j !== i))} style={styles.remove}><X size={14} color={colors.text} /></Pressable></View>)}<Pressable onPress={pick} style={styles.addMedia}><Plus size={22} color={colors.accentStrong} /></Pressable></ScrollView> : null}

      <View style={styles.toolsCard}>
        <Text style={styles.toolsTitle}>Add to your post</Text>
        <View style={styles.toolsRow}>
          <Pressable onPress={pick} style={styles.tool}><ImagePlus size={20} color={colors.accentStrong} /><Text style={styles.toolText}>Photo</Text></Pressable>
          <Pressable onPress={pick} style={styles.tool}><Camera size={20} color={colors.accentStrong} /><Text style={styles.toolText}>Video</Text></Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Community</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Pressable onPress={() => setSelected(null)} style={[styles.chip, !selected && styles.chipSelected]}><Text style={[styles.chipText, !selected && styles.chipTextSelected]}>Campus</Text></Pressable>
        {communities.map(c => <Pressable key={c.id} onPress={() => setSelected(selected === c.id ? null : c.id)} style={[styles.chip, selected === c.id && styles.chipSelected]}><Text style={[styles.chipText, selected === c.id && styles.chipTextSelected]}>{c.name}</Text></Pressable>)}
      </ScrollView>
      {busy ? <Text style={styles.progress}>{progress || 'Posting…'}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingBottom: 40, backgroundColor: colors.white },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { ...type.h3, color: colors.text },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  publish: { minWidth: 58, height: 38, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  publishText: { ...type.button, color: colors.white },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: spacing.md },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { ...type.h3, color: colors.accentStrong },
  authorName: { ...type.bodyMedium, color: colors.text },
  audience: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  audienceText: { ...type.meta, color: colors.muted },
  textarea: { minHeight: 190, marginTop: spacing.lg, fontFamily: 'DMSans_400Regular', fontSize: 20, lineHeight: 29, color: colors.text, textAlignVertical: 'top' },
  mediaStrip: { gap: 10, paddingBottom: 8 },
  mediaItem: { width: 110, height: 140, borderRadius: radius.md, overflow: 'hidden', position: 'relative', backgroundColor: colors.surface },
  mediaImage: { width: '100%', height: '100%' },
  videoPreview: { flex: 1, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', gap: 6 },
  videoLabel: { ...type.meta, color: colors.white },
  remove: { position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  addMedia: { width: 110, height: 140, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  toolsCard: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  toolsTitle: { ...type.label, color: colors.text, marginBottom: 10 },
  toolsRow: { flexDirection: 'row', gap: 10 },
  tool: { flex: 1, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  toolText: { ...type.button, color: colors.text },
  sectionTitle: { ...type.label, color: colors.text, marginTop: spacing.lg, marginBottom: 10 },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  chipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { ...type.meta, color: colors.text },
  chipTextSelected: { color: colors.accentStrong, fontFamily: 'DMSans_700Bold' },
  progress: { ...type.meta, color: colors.accentStrong, textAlign: 'center', marginTop: spacing.md },
});
