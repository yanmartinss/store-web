import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (productId: number, quantity: number, size?: string) => void;
  removeItem: (productId: number, size?: string) => void;
  updateQuantity: (
    productId: number,
    size: string | undefined,
    quantity: number,
  ) => void;
  clear: () => void;
  totalCount: () => number;
}

const sameLine = (a: CartItem, productId: number, size?: string) =>
  a.productId === productId && a.size === size;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, quantity, size) => {
        set((state) => {
          const existing = state.items.find((item) =>
            sameLine(item, productId, size),
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                sameLine(item, productId, size)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity, size }] };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter((item) => !sameLine(item, productId, size)),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            sameLine(item, productId, size) ? { ...item, quantity } : item,
          ),
        }));
      },

      clear: () => set({ items: [] }),

      totalCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "store-cart" },
  ),
);
