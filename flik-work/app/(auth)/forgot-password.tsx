import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { requestPasswordReset } from '../../lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await requestPasswordReset(email.trim());
    setBusy(false);
    if (error) return Alert.alert('Could not send reset email', error.message);
    Alert.alert('Check your email', 'If an account exists for that email, we sent password recovery instructions.');
  }
  return <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
    <Text style={{ fontSize: 30, fontWeight: '800' }}>Reset password</Text>
    <Text style={{ color: '#6B7280' }}>Enter your email and we’ll send recovery instructions.</Text>
    <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={input} />
    <Pressable onPress={submit} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Sending…' : 'Send reset email'}</Text></Pressable>
    <Pressable onPress={() => router.back()}><Text style={link}>Back to login</Text></Pressable>
  </View>;
}
const input = { height: 52, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 16, fontSize: 16 };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };
const link = { textAlign: 'center' as const, color: '#2563EB', fontWeight: '600' as const };