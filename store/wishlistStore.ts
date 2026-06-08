import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  count: number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      addItem: (productId) => {
        const items = get().items;
        if (!items.includes(productId)) {
          const newItems = [...items, productId];
          set({ items: newItems, count: newItems.length });
        }
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((id) => id !== productId);
        set({ items: newItems, count: newItems.length });
      },

      toggleItem: (productId) => {
        const items = get().items;
        if (items.includes(productId)) {
          const newItems = items.filter((id) => id !== productId);
          set({ items: newItems, count: newItems.length });
        } else {
          const newItems = [...items, productId];
          set({ items: newItems, count: newItems.length });
        }
      },

      isWishlisted: (productId) => {
        return get().items.includes(productId);
      },

      clearWishlist: () => set({ items: [], count: 0 }),
    }),
    {
      name: "cleanora-wishlist",
    }
  )
);
