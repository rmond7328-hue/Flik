import { supabase } from './supabase';

const AUTH_REDIRECT = 'flik://callback';

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: AUTH_REDIRECT,
      shouldCreateUser: true,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function exchangeAuthCode(code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}

export async function verifyMagicLink(tokenHash: string) {
  return supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });
}

export async function setAuthSession(accessToken: string, refreshToken: string) {
  return supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
}
