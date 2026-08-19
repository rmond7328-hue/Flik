import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { sendMagicLink } from '../../lib/auth';
import { colors, radius, spacing, type } from '../../constants/theme';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      Alert.alert('Check your email', 'Enter a valid email address to continue.');
      return;
    }
    setBusy(true);
    const { error } = await sendMagicLink(value);
    setBusy(false);
    if (error) {
      Alert.alert('Couldn’t send your link', error.message);
      return;
    }
    setSent(true);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      <View style={styles.container}>
        <Image source={require('../../assets/flik-icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.kicker}>JOIN YOUR CAMPUS</Text>
        <Text style={styles.title}>Create your Flik.</Text>
        <Text style={styles.subtitle}>One email. One tap. No password to remember.</Text>
        {!sent ? (
          <View style={styles.card}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrap}>
              <Mail size={18} color={colors.muted} />
              <TextInput placeholder="you@example.com" placeholderTextColor={colors.subtle} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} editable={!busy} onSubmitEditing={submit} />
            </View>
            <Pressable onPress={submit} disabled={busy} style={[styles.button, busy && { opacity: 0.65 }]}>
              <Text style={styles.buttonText}>{busy ? 'Sending…' : 'Email me a sign-in link'}</Text>
            </Pressable>
            <Text style={styles.note}>Your secure link will open Flik automatically.</Text>
          </View>
        ) : (
          <View style={styles.successCard}>
            <View style={styles.mailCircle}><Mail size={25} color={colors.accentStrong} /></View>
            <Text style={styles.successTitle}>You’re almost in.</Text>
            <Text style={styles.successBody}>We sent a secure link to</Text>
            <Text style={styles.email}>{email.trim().toLowerCase()}</Text>
            <Text style={styles.successBody}>Tap it once to return to Flik and finish your profile.</Text>
            <Pressable onPress={() => setSent(false)} style={styles.secondaryButton}><Text style={styles.secondaryText}>Use a different email</Text></Pressable>
          </View>
        )}
        <Pressable onPress={() => router.back()} style={styles.footer}>
          <Text style={styles.footerText}>Already have Flik? <Text style={styles.link}>Log in with email</Text></Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  logo: { width: 68, height: 68, alignSelf: 'center', marginBottom: 20, borderRadius: 18 },
  kicker: { ...type.meta, color: colors.accentStrong, fontFamily: 'DMSans_700Bold', letterSpacing: 1.2, textAlign: 'center' },
  title: { ...type.display, color: colors.text, textAlign: 'center', marginTop: 5 },
  subtitle: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: 8, marginHorizontal: 18 },
  card: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { ...type.label, color: colors.text, marginBottom: 7 },
  inputWrap: { height: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text },
  button: { height: 54, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  buttonText: { ...type.button, color: colors.white, fontSize: 15 },
  note: { ...type.meta, color: colors.muted, textAlign: 'center', marginTop: 11 },
  successCard: { marginTop: spacing.xl, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  mailCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { ...type.h2, color: colors.text, textAlign: 'center' },
  successBody: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: 8 },
  email: { ...type.label, color: colors.text, marginTop: 5 },
  secondaryButton: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  secondaryText: { ...type.button, color: colors.text },
  footer: { alignItems: 'center', marginTop: spacing.lg },
  footerText: { ...type.body, color: colors.muted },
  link: { color: colors.accentStrong, fontFamily: 'DMSans_700Bold' },
});
