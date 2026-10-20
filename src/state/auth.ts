import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      initialized: true,
    }),
  reset: () =>
    set({
      session: null,
      user: null,
      initialized: true,
    }),
}));