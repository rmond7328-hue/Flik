import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

// Development-only bypass. It is enabled only by an EAS development/preview
// environment variable and is explicitly disabled for production builds.
const DEV_BYPASS_AUTH = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

export default function RootLayout() {
  const { initialized, session, setAuth, setInitialized } = useAuthStore();
  const segments = useSegments();
  const [profileReady, setProfileReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Keep Supabase Auth fully initialized even in development bypass mode.
    // We intentionally do not create a fake session: production auth remains
    // unchanged and all real auth code can be re-enabled by disabling the flag.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      setAuth(data.session);

      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name,username,campus_id')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (mounted) {
          setNeedsOnboarding(
            !profile?.full_name || !profile?.username || !profile?.campus_id,
          );
        }
      } else if (mounted) {
        setNeedsOnboarding(false);
      }

      if (mounted) {
        setProfileReady(true);
        setInitialized(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setAuth(next);

      if (!next) {
        setNeedsOnboarding(false);
        setProfileReady(true);
        return;
      }

      setProfileReady(false);
      supabase
        .from('profiles')
        .select('full_name,username,campus_id')
        .eq('id', next.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!mounted) return;
          setNeedsOnboarding(
            !data?.full_name || !data?.username || !data?.campus_id,
          );
          setProfileReady(true);
        });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setAuth, setInitialized]);

  useEffect(() => {
    if (!initialized || !profileReady) return;

    const first = segments[0] as string | undefined;
    const inAuth = first === '(auth)';
    const inOnboarding = first === '(onboarding)';
    const inTabs = first === '(tabs)';

    // Development/preview builds can open directly into the real app UI.
    // This does not disable Supabase Auth; it only bypasses the route guard.
    if (DEV_BYPASS_AUTH) {
      if (!inTabs) router.replace('/(tabs)/home');
      return;
    }

    // Production/default behavior: real Supabase authentication is required.
    if (!session && !inAuth) router.replace('/(auth)/login');
    else if (session && needsOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/profile');
    } else if (session && !needsOnboarding && (inAuth || inOnboarding || !inTabs)) {
      router.replace('/(tabs)/home');
    }
  }, [initialized, profileReady, session, needsOnboarding, segments]);

  if (!initialized || !profileReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
