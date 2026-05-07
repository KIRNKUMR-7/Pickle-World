import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  default_address: string;
  default_pincode: string;
};

type AuthStore = {
  profile: Profile | null;
  sessionEmail: string | null;
  sessionUserId: string | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: Profile | null) => void;
  setSession: (userId: string | null, email: string | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<() => void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      profile: null,
      sessionEmail: null,
      sessionUserId: null,
      loading: true,
      initialized: false,

      setProfile: (profile) => set({ profile }),
      setSession: (sessionUserId, sessionEmail) => set({ sessionUserId, sessionEmail }),

      fetchProfile: async (userId: string) => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (data) set({ profile: data as Profile });
      },

      initialize: async () => {
        set({ loading: true });

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({ sessionUserId: session.user.id, sessionEmail: session.user.email ?? null });
          await get().fetchProfile(session.user.id);
        }
        set({ loading: false, initialized: true });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            set({ sessionUserId: session.user.id, sessionEmail: session.user.email ?? null });
            await get().fetchProfile(session.user.id);
          } else {
            set({ profile: null, sessionEmail: null, sessionUserId: null });
          }
        });

        return () => subscription.unsubscribe();
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ profile: null, sessionEmail: null, sessionUserId: null });
      },
    }),
    {
      name: 'pickleworld-auth',
      partialize: (state) => ({
        profile: state.profile,
        sessionEmail: state.sessionEmail,
        sessionUserId: state.sessionUserId,
      }),
    }
  )
);
