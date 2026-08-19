import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { exchangeAuthCode, setAuthSession, verifyMagicLink } from '../lib/auth';
import { colors, type } from '../constants/theme';

type AuthParams = {
  code?: string;
  token_hash?: string;
  access_token?: string;
  refresh_token?: string;
  error_description?: string;
};

function readParams(url: string | null): AuthParams {
  if (!url) return {};
  const [, queryPart = '', hashPart = ''] = url.split(/\?|#/);
  const parts = `${queryPart}&${hashPart}`.split('&').filter(Boolean);
  return parts.reduce<AuthParams>((result, item) => {
    const [rawKey, ...rawValue] = item.split('=');
    if (!rawKey) return result;
    const key = decodeURIComponent(rawKey) as keyof AuthParams;
    const value = decodeURIComponent(rawValue.join('=').replace(/\+/g, ' '));
    if (['code', 'token_hash', 'access_token', 'refresh_token', 'error_description'].includes(key)) result[key] = value;
    return result;
  }, {});
}

export default function AuthCallback() {
  const params = useLocalSearchParams<AuthParams>();
  const [message, setMessage] = useState('Signing you in securely…');

  useEffect(() => {
    let mounted = true;
    let completed = false;

    async function complete(url?: string | null) {
      if (completed) return;
      const urlParams = readParams(url ?? null);
      const merged: AuthParams = { ...urlParams, ...params };

      try {
        const code = merged.code ?? '';
        const tokenHash = merged.token_hash ?? '';
        const accessToken = merged.access_token ?? '';
        const refreshToken = merged.refresh_token ?? '';
        const errorDescription = merged.error_description ?? '';

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

        completed = true;
        if (mounted) {
          setMessage('You’re in. Loading Flik…');
          setTimeout(() => router.replace('/(tabs)/home'), 250);
        }
      } catch (error) {
        completed = true;
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : 'This sign-in link could not be completed.');
        setTimeout(() => router.replace('/(auth)/login'), 1600);
      }
    }

    Linking.getInitialURL().then((url) => complete(url));
    const subscription = Linking.addEventListener('url', ({ url }) => complete(url));
    return () => {
      mounted = false;
      subscription.remove();
    };
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
