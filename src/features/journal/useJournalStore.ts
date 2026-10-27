import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/ids';
import { StorageKeys } from '@/lib/storage';
import { openJSON, sealJSON } from '@/lib/vault';

export type Mood = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  dayKey: string;
  promptId: string;
  body: string;
  reflection: string;
  mood: Mood | null;
  gratitude: string[];
  createdAt: number;
  updatedAt: number;
};

export type GoalCategory = 'career' | 'health' | 'creative' | 'mindset' | 'money';

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  target: number;
  progress: number;
  unit: string;
  dueDate: string | null;
  createdAt: number;
  completedAt: number | null;
};

type JournalState = {
  /** Ciphertext only — this is what lands on disk. */
  vault: Record<string, string>;
  /** Decrypted working copy, never persisted. */
  entries: Record<string, JournalEntry>;
  goals: Goal[];
  unlocked: boolean;
  unlockError: string | null;
  hydrated: boolean;
  unlock: () => Promise<void>;
  saveEntry: (entry: JournalEntry) => Promise<{ ok: boolean; error?: string }>;
  deleteEntry: (dayKey: string) => Promise<void>;
  clearJournal: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completedAt' | 'progress'> & { progress?: number }) => string;
  progressGoal: (id: string, delta: number) => void;
  setGoalProgress: (id: string, progress: number) => void;
  completeGoal: (id: string) => void;
  removeGoal: (id: string) => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      vault: {},
      entries: {},
      goals: [],
      unlocked: false,
      unlockError: null,
      hydrated: false,

      async unlock() {
        const { vault } = get();
        const entries: Record<string, JournalEntry> = {};
        let failed = 0;
        for (const [dayKey, sealed] of Object.entries(vault)) {
          const entry = await openJSON<JournalEntry>(sealed);
          if (entry) entries[dayKey] = entry;
          else failed += 1;
        }
        set({
          entries,
          unlocked: true,
          unlockError:
            failed > 0
              ? `${failed} entr${failed === 1 ? 'y' : 'ies'} could not be opened on this device.`
              : null,
        });
      },

      async saveEntry(entry) {
        try {
          const sealed = await sealJSON(entry);
          set({
            vault: { ...get().vault, [entry.dayKey]: sealed },
            entries: { ...get().entries, [entry.dayKey]: entry },
          });
          return { ok: true };
        } catch {
          return {
            ok: false,
            error: 'Could not encrypt this entry. Check device keychain access and try again.',
          };
        }
      },

      async deleteEntry(dayKey) {
        const vault = { ...get().vault };
        const entries = { ...get().entries };
        delete vault[dayKey];
        delete entries[dayKey];
        set({ vault, entries });
      },

      async clearJournal() {
        set({ vault: {}, entries: {} });
      },

      addGoal(goal) {
        const id = newId('goal');
        set({
          goals: [
            {
              ...goal,
              id,
              progress: goal.progress ?? 0,
              createdAt: Date.now(),
              completedAt: null,
            },
            ...get().goals,
          ],
        });
        return id;
      },

      progressGoal(id, delta) {
        set({
          goals: get().goals.map((goal) => {
            if (goal.id !== id || goal.completedAt) return goal;
            const progress = Math.max(0, Math.min(goal.target, goal.progress + delta));
            return {
              ...goal,
              progress,
              completedAt: progress >= goal.target ? Date.now() : null,
            };
          }),
        });
      },

      setGoalProgress(id, progress) {
        set({
          goals: get().goals.map((goal) => {
            if (goal.id !== id) return goal;
            const clamped = Math.max(0, Math.min(goal.target, progress));
            return {
              ...goal,
              progress: clamped,
              completedAt: clamped >= goal.target ? (goal.completedAt ?? Date.now()) : null,
            };
          }),
        });
      },

      completeGoal(id) {
        set({
          goals: get().goals.map((goal) =>
            goal.id === id ? { ...goal, progress: goal.target, completedAt: Date.now() } : goal
          ),
        });
      },

      removeGoal(id) {
        set({ goals: get().goals.filter((goal) => goal.id !== id) });
      },
    }),
    {
      name: StorageKeys.journal,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ vault, goals }) => ({ vault, goals }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export function journalStats() {
  const state = useJournalStore.getState();
  return {
    entryCount: Object.keys(state.entries).length,
    days: Object.keys(state.entries),
    goalsCompleted: state.goals.filter((goal) => goal.completedAt).length,
  };
}
