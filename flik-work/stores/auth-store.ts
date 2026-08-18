import { create } from 'zustand';
import type { Session, User } from 'supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  setAuth: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  setAuth: (session) => set({ session, user: session?.user ?? null }),
  setInitialized: (initialized) => set({ initialized }),
}));