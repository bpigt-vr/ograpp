import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MembershipTierId } from '@/features/membership/plans';
import { newId } from '@/lib/ids';
import { StorageKeys } from '@/lib/storage';
import { hashPassphrase, verifyPassphrase } from '@/lib/vault';

export type Profile = {
  displayName: string;
  bio: string;
  avatarColor: string;
  isPrivate: boolean;
  showInCommunity: boolean;
};

export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
};

export type MembershipStatus = 'free' | 'preview' | 'verified';

export type Membership = {
  tier: MembershipTierId;
  status: MembershipStatus;
  since: number | null;
  source: 'none' | 'preview-unlock' | 'website';
};

export type AuthResult = { ok: boolean; error?: string };

export const GUEST_PROFILE: Profile = {
  displayName: 'Guest',
  bio: '',
  avatarColor: '#F2610C',
  isPrivate: true,
  showInCommunity: false,
};

export const FREE_MEMBERSHIP: Membership = {
  tier: 'free',
  status: 'free',
  since: null,
  source: 'none',
};

type AuthState = {
  account: Account | null;
  session: { accountId: string; startedAt: number } | null;
  profile: Profile;
  membership: Membership;
  hydrated: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setMembership: (tier: MembershipTierId, source: Membership['source']) => void;
  clearMembership: () => void;
  deleteAccount: () => Promise<void>;
  isSignedIn: () => boolean;
};

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      session: null,
      profile: GUEST_PROFILE,
      membership: FREE_MEMBERSHIP,
      hydrated: false,

      isSignedIn: () => Boolean(get().account && get().session),

      async signUp(email, password, displayName) {
        const cleanEmail = normaliseEmail(email);
        const name = displayName.trim();
        if (!validEmail(cleanEmail)) return { ok: false, error: 'Enter a valid email address.' };
        if (password.length < 8) {
          return { ok: false, error: 'Use at least 8 characters for your password.' };
        }
        if (name.length < 2) return { ok: false, error: 'Add a display name (2+ characters).' };
        if (get().account) {
          return { ok: false, error: 'This device already has an account. Sign out first.' };
        }
        const passwordHash = await hashPassphrase(password);
        const account: Account = {
          id: newId('acc'),
          email: cleanEmail,
          passwordHash,
          createdAt: Date.now(),
        };
        set({
          account,
          session: { accountId: account.id, startedAt: Date.now() },
          profile: { ...get().profile, displayName: name },
        });
        return { ok: true };
      },

      async signIn(email, password) {
        const account = get().account;
        if (!account) {
          return { ok: false, error: 'No account on this device yet. Create one first.' };
        }
        if (normaliseEmail(email) !== account.email) {
          return { ok: false, error: 'That email does not match this device’s account.' };
        }
        const valid = await verifyPassphrase(password, account.passwordHash);
        if (!valid) return { ok: false, error: 'Incorrect password.' };
        set({ session: { accountId: account.id, startedAt: Date.now() } });
        return { ok: true };
      },

      signOut() {
        set({ session: null });
      },

      updateProfile(patch) {
        set({ profile: { ...get().profile, ...patch } });
      },

      setMembership(tier, source) {
        set({
          membership: {
            tier,
            status: source === 'preview-unlock' ? 'preview' : tier === 'free' ? 'free' : 'verified',
            since: Date.now(),
            source,
          },
        });
      },

      clearMembership() {
        set({ membership: FREE_MEMBERSHIP });
      },

      async deleteAccount() {
        set({ account: null, session: null, profile: GUEST_PROFILE, membership: FREE_MEMBERSHIP });
      },
    }),
    {
      name: StorageKeys.auth,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ account, session, profile, membership }) => ({
        account,
        session,
        profile,
        membership,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export function useIsSignedIn(): boolean {
  return useAuthStore((state) => Boolean(state.account && state.session));
}

export function useMembershipTier(): MembershipTierId {
  return useAuthStore((state) => state.membership.tier);
}

export function useDisplayName(): string {
  return useAuthStore((state) => state.profile.displayName);
}

export function currentUserId(): string {
  const state = useAuthStore.getState();
  return state.account?.id ?? 'guest';
}
