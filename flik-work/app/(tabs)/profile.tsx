import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Bell, Bookmark, ChevronRight, LogOut, Settings, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { getMyProfile, updateProfile, usernameAvailable } from '../../services/profile';
import { getFollowCounts, uploadAvatar } from '../../services/social';
import { signOut } from '../../lib/auth';
import { Avatar } from '../../components/Avatar';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Profile() {
  const insets = useSafeAreaInsets(); const user = useAuthStore(s => s.user); const [p, setP] = useState<any>(); const [counts, setCounts] = useState({ followers: 0, following: 0 }); const [editing, setEditing] = useState(false); const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [bio, setBio] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!user) return; Promise.all([getMyProfile(user.id), getFollowCounts(user.id)]).then(([a, c]) => { setP(a.data); setName(a.data?.full_name || ''); setUsername(a.data?.username || ''); setBio(a.data?.bio || ''); setCounts(c); }); }, [user]);
  async function avatar() { if (!user) return; const perm = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!perm.granted) return; const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .8 }); if (r.canceled) return; const a = r.assets[0]; const up = await uploadAvatar(a.uri, user.id, a.mimeType || 'image/jpeg'); if (up.error) return Alert.alert('Upload failed', 'We could not upload that image.'); const next = await updateProfile(user.id, { full_name: p.full_name, username: p.username, bio: p.bio || '', avatar_path: up.data?.path }); if (next.error) Alert.alert('Could not update', next.error.message); else setP(next.data); }
  async function save() { if (!user) return; setBusy(true); const valid = await usernameAvailable(username.trim().toLowerCase(), user.id); if (!valid.available) { setBusy(false); return Alert.alert('Username unavailable', 'Choose another username.'); } const r = await updateProfile(user.id, { full_name: name.trim(), username: username.trim().toLowerCase(), bio: bio.trim(), avatar_path: p.avatar_path }); setBusy(false); if (r.error) return Alert.alert('Could not save', r.error.message); setP(r.data); setEditing(false); }
  async function logout() { const r = await signOut(); if (r.error) Alert.alert('Could not log out', r.error.message); }
  if (!p) return <View style={styles.loading}><Text style={styles.muted}>Loading profile…</Text></View>;
  return <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.md, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
    <View style={styles.top}><Text style={type.h1}>Profile</Text><Pressable onPress={() => router.push('/notifications')} style={styles.icon}><Bell size={20} color={colors.text} /></Pressable></View>
    <View style={styles.profileHero}><Pressable onPress={avatar}><Avatar uri={p.avatar_path} name={p.full_name} size={94} /></Pressable><Text style={styles.name}>{p.full_name}</Text><Text style={styles.username}>@{p.username}</Text><Text style={styles.bio}>{p.bio || 'Share your moment on Flik.'}</Text><Text style={styles.campus}>{p.campuses?.name || 'Campus'}</Text></View>
    <View style={styles.stats}><Pressable onPress={() => router.push({ pathname: '/followers/[id]', params: { id: user?.id } })} style={styles.stat}><Text style={styles.statNumber}>{counts.followers}</Text><Text style={styles.statLabel}>Followers</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/following/[id]', params: { id: user?.id } })} style={styles.stat}><Text style={styles.statNumber}>{counts.following}</Text><Text style={styles.statLabel}>Following</Text></Pressable></View>
    {editing ? <View style={{ gap: 10, marginTop: 18 }}><Text style={styles.label}>Full name</Text><TextInput value={name} onChangeText={setName} style={styles.input} /><Text style={styles.label}>Username</Text><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} /><Text style={styles.label}>Bio</Text><TextInput value={bio} onChangeText={setBio} multiline style={[styles.input, { minHeight: 92, textAlignVertical: 'top' }]} /><Pressable onPress={save} disabled={busy} style={styles.primary}><Text style={styles.primaryText}>{busy ? 'Saving…' : 'Save changes'}</Text></Pressable></View> : <View style={{ gap: 10, marginTop: 18 }}><Pressable onPress={() => setEditing(true)} style={styles.primary}><UserRound size={18} color={colors.white} /><Text style={styles.primaryText}>Edit profile</Text></Pressable><Pressable onPress={() => router.push('/saved')} style={styles.row}><Bookmark size={19} color={colors.text} /><Text style={styles.rowText}>Saved posts</Text><ChevronRight size={18} color={colors.subtle} /></Pressable><Pressable onPress={() => router.push('/settings')} style={styles.row}><Settings size={19} color={colors.text} /><Text style={styles.rowText}>Settings</Text><ChevronRight size={18} color={colors.subtle} /></Pressable><Pressable onPress={logout} style={styles.logout}><LogOut size={18} color={colors.danger} /><Text style={styles.logoutText}>Log out</Text></Pressable></View>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  muted: { ...type.body, color: colors.muted },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  profileHero: { alignItems: 'center', paddingVertical: 8 },
  name: { ...type.h2, color: colors.text, marginTop: 12 },
  username: { ...type.meta, color: colors.muted, marginTop: 2 },
  bio: { ...type.body, color: colors.text, textAlign: 'center', marginTop: 10, maxWidth: 330 },
  campus: { ...type.meta, color: colors.accentStrong, marginTop: 7, fontWeight: '700' },
  stats: { flexDirection: 'row', marginTop: 20, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { ...type.h2, color: colors.text },
  statLabel: { ...type.meta, color: colors.muted, marginTop: 2 },
  label: { ...type.meta, color: colors.text, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  primary: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryText: { ...type.button, color: colors.white },
  row: { minHeight: 56, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border },
  rowText: { ...type.bodyMedium, color: colors.text, flex: 1 },
  logout: { minHeight: 52, borderRadius: radius.md, backgroundColor: '#FEF2F2', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { ...type.button, color: colors.danger },
});
