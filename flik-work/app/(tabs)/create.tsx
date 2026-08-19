import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { createPost, uploadPostMedia, attachPostMedia, listCommunities } from '../../services/feed';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Create() {
  const insets = useSafeAreaInsets(); const user = useAuthStore(s => s.user); const [content, setContent] = useState(''); const [media, setMedia] = useState<any[]>([]); const [communities, setCommunities] = useState<any[]>([]); const [selected, setSelected] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [progress, setProgress] = useState('');
  useEffect(() => { if (!user) return; supabase.from('profiles').select('campus_id').eq('id', user.id).single().then(async ({ data }) => { if (data?.campus_id) { const r = await listCommunities(data.campus_id); setCommunities(r.data || []); } }); }, [user]);
  async function pick() { const p = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsMultipleSelection: true, quality: .8 }); if (!r.canceled) setMedia(r.assets); }
  async function submit() { if (!user || (!content.trim() && !media.length)) return Alert.alert('Add something', 'Write a post or attach media.'); setBusy(true); const profile = await supabase.from('profiles').select('campus_id').eq('id', user.id).single(); if (!profile.data?.campus_id) { setBusy(false); return Alert.alert('Campus required', 'Complete your campus setup first.'); } const created = await createPost({ author_id: user.id, campus_id: profile.data.campus_id, community_id: selected, content: content.trim() }); if (created.error || !created.data) { setBusy(false); return Alert.alert('Could not create post', 'We could not publish your post. Try again.'); } const attached: any[] = []; for (let i = 0; i < media.length; i++) { setProgress(`Uploading ${i + 1} of ${media.length}…`); const a = media[i]; const mime = a.mimeType || (a.type === 'video' ? 'video/mp4' : 'image/jpeg'); const up = await uploadPostMedia(a.uri, user.id, created.data.id, mime); if (up.error) { await supabase.from('posts').delete().eq('id', created.data.id); setBusy(false); return Alert.alert('Upload failed', 'Your post was not published because media upload failed.'); } attached.push({ media_type: a.type === 'video' ? 'video' : 'image', storage_path: up.data.path, sort_order: i }); } const linked = await attachPostMedia(created.data.id, attached); setBusy(false); if (linked.error) { await supabase.from('posts').delete().eq('id', created.data.id); return Alert.alert('Could not finish post', 'Please try again.'); } setContent(''); setMedia([]); setSelected(null); setProgress(''); Alert.alert('Posted', 'Your moment is now on campus.'); router.replace('/home'); }
  return <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 8 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Text style={type.h1}>Create</Text><Pressable onPress={() => router.back()} style={styles.close}><X size={20} color={colors.text} /></Pressable></View>
    <View style={styles.composer}><Text style={styles.prompt}>What’s happening on campus?</Text><TextInput value={content} onChangeText={setContent} multiline placeholder="Share a moment, thought, event or question…" placeholderTextColor={colors.subtle} style={styles.textarea} /></View>
    <View style={styles.mediaTools}><Pressable onPress={pick} style={styles.tool}><ImagePlus size={20} color={colors.accentStrong} /><Text style={styles.toolText}>Photo / Video</Text></Pressable><Pressable onPress={pick} style={styles.tool}><Camera size={20} color={colors.accentStrong} /><Text style={styles.toolText}>Camera</Text></Pressable></View>
    {media.map((m, i) => <View key={m.assetId || i} style={styles.preview}>{m.type === 'image' ? <Image source={{ uri: m.uri }} style={styles.previewImage} /> : <View style={styles.videoPreview}><Text style={styles.videoText}>Video selected</Text></View>}<Pressable onPress={() => setMedia(x => x.filter((_, j) => j !== i))} style={styles.remove}><X size={16} color={colors.text} /></Pressable></View>)}
    <Text style={styles.sectionTitle}>Post to a community <Text style={styles.optional}>(optional)</Text></Text>
    <View style={styles.chips}>{communities.map(c => <Pressable key={c.id} onPress={() => setSelected(selected === c.id ? null : c.id)} style={[styles.chip, selected === c.id && styles.chipSelected]}><Text style={[styles.chipText, selected === c.id && { color: colors.accentStrong }]}>{c.name}</Text></Pressable>)}</View>
    <Pressable onPress={submit} disabled={busy} style={[styles.postButton, busy && { opacity: .7 }]}><Text style={styles.postText}>{busy ? progress || 'Posting…' : 'Post to Flik'}</Text></Pressable>
  </ScrollView>;
}
const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingBottom: 36, gap: 16, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  composer: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.md },
  prompt: { ...type.bodyMedium, color: colors.text, marginBottom: 10 },
  textarea: { minHeight: 150, fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, color: colors.text, textAlignVertical: 'top' },
  mediaTools: { flexDirection: 'row', gap: 10 },
  tool: { flex: 1, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  toolText: { ...type.button, color: colors.accentStrong },
  preview: { position: 'relative', overflow: 'hidden', borderRadius: radius.lg },
  previewImage: { width: '100%', height: 230, backgroundColor: colors.surface },
  videoPreview: { height: 160, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  videoText: { ...type.button, color: colors.white },
  remove: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { ...type.bodyMedium, color: colors.text, marginTop: 4 },
  optional: { ...type.meta, color: colors.muted, fontWeight: '400' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { ...type.meta, color: colors.text, fontWeight: '700' },
  postButton: { height: 52, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  postText: { ...type.button, color: colors.white, fontSize: 15 },
});
