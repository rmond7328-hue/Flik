import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { exchangeAuthCode, verifyMagicLink } from '../lib/auth';
import { colors, type } from '../constants/theme';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; token_hash?: string; type?: string; error_description?: string }>();
  const [message, setMessage] = useState('Signing you in securely…');

  useEffect(() => {
    let mounted = true;

    async function complete() {
      try {
        const url = await Linking.getInitialURL();
        const parsed = url ? Linking.parse(url) : null;
        const query = parsed?.queryParams ?? {};
        const code = String(params.code ?? query.code ?? '');
        const tokenHash = String(params.token_hash ?? query.token_hash ?? '');
        const errorDescription = String(params.error_description ?? query.error_description ?? '');

        if (errorDescription) throw new Error(errorDescription);

        const result = code ? await exchangeAuthCode(code) : tokenHash ? await verifyMagicLink(tokenHash) : null;
        if (!result) throw new Error('This sign-in link is missing or incomplete. Request a new link from Flik.');
        if (result.error) throw result.error;

        if (mounted) {
          setMessage('You’re in. Loading Flik…');
          setTimeout(() => router.replace('/(tabs)/home'), 250);
        }
      } catch (error) {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : 'This sign-in link could not be completed.');
        setTimeout(() => router.replace('/(auth)/login'), 1600);
      }
    }

    complete();
    return () => { mounted = false; };
  }, [params.code, params.token_hash, params.error_description]);

  return (
    <View style={styles.page}>
      <Text style={styles.logo}>Flik</Text>
      <ActivityIndicator size="small" color={colors.accentStrong} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 28 },
  logo: { ...type.display, color: colors.accentStrong, marginBottom: 24 },
  message: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: 14, maxWidth: 320 },
});
