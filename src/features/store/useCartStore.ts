import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys } from '@/lib/storage';
import { addLine, setQuantity, type CartLine } from './cart';

type CartState = {
  lines: CartLine[];
  hydrated: boolean;
  add: (line: CartLine) => void;
  updateQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      add: (line) => set({ lines: addLine(get().lines, line) }),
      updateQuantity: (id, quantity) => set({ lines: setQuantity(get().lines, id, quantity) }),
      remove: (id) => set({ lines: get().lines.filter((line) => line.id !== id) }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: StorageKeys.cart,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ lines }) => ({ lines }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
