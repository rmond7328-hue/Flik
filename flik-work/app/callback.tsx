import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { exchangeAuthCode, setAuthSession, verifyMagicLink } from '../lib/auth';
import { colors, radius, spacing, type } from '../constants/theme';

type AuthParams = {
  code?: string;
  token_hash?: string;
  access_token?: string;
  refresh_token?: string;
  error_description?: string;
};

function decode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function readParams(url: string | null): AuthParams {
  if (!url) return {};

  const output: AuthParams = {};
  const sections: string[] = [];
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');

  if (queryIndex >= 0) {
    const end = hashIndex >= 0 && hashIndex > queryIndex ? hashIndex : url.length;
    sections.push(url.slice(queryIndex + 1, end));
  }
  if (hashIndex >= 0) sections.push(url.slice(hashIndex + 1));

  for (const section of sections) {
    for (const pair of section.split('&')) {
      if (!pair) continue;
      const equals = pair.indexOf('=');
      const rawKey = equals >= 0 ? pair.slice(0, equals) : pair;
      const rawValue = equals >= 0 ? pair.slice(equals + 1) : '';
      const key = decode(rawKey) as keyof AuthParams;
      if (['code', 'token_hash', 'access_token', 'refresh_token', 'error_description'].includes(key)) {
        output[key] = decode(rawValue);
      }
    }
  }

  return output;
}

export default function AuthCallback() {
  const params = useLocalSearchParams<AuthParams>();
  const [message, setMessage] = useState('Signing you in securely…');
  const [failed, setFailed] = useState(false);

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

        if (!result) throw new Error('This sign-in link is incomplete. Request a new link from Flik.');
        if (result.error) throw result.error;

        completed = true;
        if (mounted) setMessage('You’re in. Loading Flik…');
        // The root auth guard decides whether this user needs onboarding or can enter Home.
        if (mounted) setTimeout(() => router.replace('/'), 200);
      } catch (error) {
        completed = true;
        if (!mounted) return;
        setFailed(true);
        setMessage(error instanceof Error ? error.message : 'This sign-in link could not be completed.');
      }
    }

    Linking.getInitialURL().then(complete);
    const subscription = Linking.addEventListener('url', ({ url }) => complete(url));

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [params.code, params.token_hash, params.access_token, params.refresh_token, params.error_description]);

  return (
    <View style={styles.page}>
      <Text style={styles.logo}>Flik</Text>
      {failed ? null : <ActivityIndicator size="small" color={colors.accentStrong} />}
      <Text style={styles.title}>{failed ? 'Sign-in link unavailable' : 'Welcome back'}</Text>
      <Text style={styles.message}>{message}</Text>
      {failed && (
        <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.button}>
          <Text style={styles.buttonText}>Request a new link</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  logo: { ...type.display, color: colors.accentStrong, marginBottom: spacing.xl },
  title: { ...type.h2, color: colors.text, textAlign: 'center', marginBottom: 8 },
  message: { ...type.body, color: colors.muted, textAlign: 'center', maxWidth: 330 },
  button: { marginTop: spacing.lg, minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  buttonText: { ...type.button, color: colors.white },
});
