import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { updateProfile, usernameAvailable } from '../../services/profile';

export default function ProfileSetup() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  async function next() {
    if (!user || name.trim().length < 2 || !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      return Alert.alert('Complete your profile', 'Use a name and a username with 3–24 letters, numbers, or underscores.');
    }
    setBusy(true);
    const check = await usernameAvailable(username.toLowerCase(), user.id);
    if (!check.available) {
      setBusy(false);
      return Alert.alert('Username unavailable', 'Try another username.');
    }
    const { error } = await updateProfile(user.id, {
      full_name: name.trim(),
      username: username.toLowerCase(),
      bio: bio.trim(),
    });
    setBusy(false);
    if (error) return Alert.alert('Could not save profile', error.message);
    router.push('/(onboarding)/campus');
  }

  return <View style={{ flex: 1, padding: 24, paddingTop: 80, gap: 14 }}>
    <Text style={{ fontSize: 32, fontWeight: '800' }}>Make your profile yours.</Text>
    <Text style={{ color: '#6B7280' }}>You can change these details later.</Text>
    <TextInput placeholder="Full name" value={name} onChangeText={setName} style={input} />
    <TextInput placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} style={input} />
    <TextInput placeholder="Bio (optional)" value={bio} onChangeText={setBio} multiline style={[input, { height: 100, paddingTop: 14 }]} />
    <Pressable onPress={next} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Saving…' : 'Continue'}</Text></Pressable>
  </View>;
}
const input = { height: 52, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, fontSize: 16 };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };