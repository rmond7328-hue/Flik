import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { signIn } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || password.length < 6) return Alert.alert('Check your details', 'Enter a valid email and a password of at least 6 characters.');
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) return Alert.alert('Login failed', error.message);
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 14 }}>
      <Text style={{ fontSize: 42, fontWeight: '800' }}>flik</Text>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Welcome back.</Text>
      <Text style={{ color: '#6B7280' }}>See your campus. Share your moment.</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={input} />
      <Pressable onPress={submit} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Signing in…' : 'Log in'}</Text></Pressable>
      <Pressable onPress={() => router.push('/signup')}><Text style={link}>Create an account</Text></Pressable>
      <Pressable onPress={() => router.push('/forgot-password')}><Text style={link}>Forgot password?</Text></Pressable>
    </View>
  </KeyboardAvoidingView>;
}
const input = { height: 52, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, fontSize: 16 };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };
const link = { textAlign: 'center' as const, color: '#2563EB', fontWeight: '600' as const };