import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { resendOtp, verifyOtp } from '../../lib/auth';

export default function OTP() {
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const [token, setToken] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  async function verify() {
    if (token.length < 6) return;
    setBusy(true);
    const { data, error } = await verifyOtp(email, token);
    setBusy(false);
    if (error) return Alert.alert('Verification failed', error.message);
    if (data.session) router.replace('/(onboarding)/profile');
  }

  async function resend() {
    if (seconds) return;
    const { error } = await resendOtp(email);
    if (error) Alert.alert('Could not resend', error.message);
    else setSeconds(30);
  }

  return <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
    <Text style={{ fontSize: 32, fontWeight: '800' }}>Verify your email</Text>
    <Text style={{ color: '#6B7280' }}>Enter the 6-digit code sent to {email}.</Text>
    <TextInput autoFocus keyboardType="number-pad" maxLength={6} value={token} onChangeText={setToken} style={input} />
    <Pressable onPress={verify} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Verifying…' : 'Verify'}</Text></Pressable>
    <Pressable onPress={resend} disabled={!!seconds}><Text style={link}>{seconds ? `Resend in ${seconds}s` : 'Resend code'}</Text></Pressable>
  </View>;
}
const input = { height: 58, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 18, fontSize: 24, letterSpacing: 8, textAlign: 'center' as const };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };
const link = { textAlign: 'center' as const, color: '#2563EB', fontWeight: '600' as const };