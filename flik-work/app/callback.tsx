import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { exchangeAuthCode, setAuthSession, verifyMagicLink } from '../lib/auth';
import { colors, type } from '../constants/theme';

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    code?: string;
    token_hash?: string;
    access_token?: string;
    refresh_token?: string;
    error_description?: string;
  }>();
  const [message, setMessage] = useState('Signing you in securely…');

  useEffect(() => {
    let mounted = true;

    async function complete() {
      try {
        const code = typeof params.code === 'string' ? params.code : '';
        const tokenHash = typeof params.token_hash === 'string' ? params.token_hash : '';
        const accessToken = typeof params.access_token === 'string' ? params.access_token : '';
        const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : '';
        const errorDescription = typeof params.error_description === 'string' ? params.error_description : '';

        if (errorDescription) throw new Error(errorDescription);

        const result = code
          ? await exchangeAuthCode(code)
          : tokenHash
            ? await verifyMagicLink(tokenHash)
            : accessToken && refreshToken
              ? await setAuthSession(accessToken, refreshToken)
              : null;

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
  }, [params.code, params.token_hash, params.access_token, params.refresh_token, params.error_description]);

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
