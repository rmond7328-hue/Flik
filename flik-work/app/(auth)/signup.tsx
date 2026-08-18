import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { signUp } from '../../lib/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return Alert.alert('Check your details', 'Use a valid email and a password of at least 8 characters.');
    setBusy(true);
    const { data, error } = await signUp(email.trim(), password);
    setBusy(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    if (data.session) router.replace('/(onboarding)/profile');
    else router.replace({ pathname: '/otp', params: { email: email.trim() } });
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 14 }}>
      <Text style={{ fontSize: 42, fontWeight: '800' }}>flik</Text>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Join Flik.</Text>
      <Text style={{ color: '#6B7280' }}>Start with your campus community.</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={input} />
      <Pressable onPress={submit} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Creating…' : 'Create account'}</Text></Pressable>
      <Pressable onPress={() => router.back()}><Text style={link}>Already have an account? Log in</Text></Pressable>
    </View>
  </KeyboardAvoidingView>;
}
const input = { height: 52, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, fontSize: 16 };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };
const link = { textAlign: 'center' as const, color: '#2563EB', fontWeight: '600' as const };