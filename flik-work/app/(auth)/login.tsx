import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Mail, ArrowRight } from 'lucide-react-native';
import { sendMagicLink } from '../../lib/auth';
import { colors, radius, spacing, type } from '../../constants/theme';
import { router } from 'expo-router';

export default function Login() {
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
      <View style={styles.content}>
        <View style={styles.brand}>
          <Image source={require('../../assets/flik-icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>Flik</Text>
        </View>

        {!sent ? (
          <>
            <Text style={styles.eyebrow}>WELCOME TO FLIK</Text>
            <Text style={styles.title}>Your campus, one tap away.</Text>
            <Text style={styles.subtitle}>Enter your email and we’ll send you a secure link. No password needed.</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={colors.muted} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={colors.subtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={submit}
                  style={styles.input}
                  editable={!busy}
                />
              </View>
              <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}>
                <Text style={styles.buttonText}>{busy ? 'Sending…' : 'Continue with email'}</Text>
                {!busy && <ArrowRight size={18} color={colors.white} />}
              </Pressable>
              <Text style={styles.note}>We’ll email you a one-click sign-in link.</Text>
            </View>
          </>
        ) : (
          <View style={styles.successCard}>
            <View style={styles.mailCircle}><Mail size={25} color={colors.accentStrong} /></View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successBody}>We sent a secure sign-in link to</Text>
            <Text style={styles.email}>{email.trim().toLowerCase()}</Text>
            <Text style={styles.successBody}>Tap the link in the email and Flik will open automatically.</Text>
            <Pressable onPress={() => setSent(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Use a different email</Text>
            </Pressable>
            <Text style={styles.smallNote}>If you don’t see it, check your spam or promotions folder.</Text>
          </View>
        )}

        <Pressable onPress={() => router.push('/signup')} style={styles.footer}>
          <Text style={styles.footerText}>New to Flik? <Text style={styles.link}>Create your campus account</Text></Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, paddingTop: 64, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 62, height: 62, borderRadius: 16 },
  brandName: { ...type.h2, color: colors.text, marginTop: 8 },
  eyebrow: { ...type.meta, color: colors.accentStrong, letterSpacing: 1.2 },
  title: { ...type.display, color: colors.text, marginTop: 6 },
  subtitle: { ...type.body, color: colors.muted, marginTop: 8, maxWidth: 350 },
  card: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  label: { ...type.label, color: colors.text, marginBottom: 7 },
  inputWrap: { height: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.text },
  button: { height: 54, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, flexDirection: 'row', gap: 8 },
  buttonText: { ...type.button, color: colors.white },
  note: { ...type.meta, color: colors.muted, textAlign: 'center', marginTop: 11 },
  successCard: { marginTop: spacing.md, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  mailCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { ...type.h2, color: colors.text, textAlign: 'center' },
  successBody: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: 8 },
  email: { ...type.label, color: colors.text, marginTop: 5 },
  secondaryButton: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  secondaryText: { ...type.button, color: colors.text },
  smallNote: { ...type.meta, color: colors.subtle, textAlign: 'center', marginTop: spacing.md },
  footer: { alignItems: 'center', marginTop: spacing.lg },
  footerText: { ...type.body, color: colors.muted, textAlign: 'center' },
  link: { color: colors.accentStrong, fontFamily: 'DMSans_700Bold' },
  pressed: { transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.65 },
});
