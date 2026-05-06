import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // e.g. "chicken-pickle-100g"
  slug: string;
  name: string;
  variant: string; // e.g. "100g" or "300g"
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (item) => {
        const id = `${item.slug}-${item.variant}`;
        set((state) => {
          const existingItem = state.items.find((i) => i.id === id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isCartOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, id, quantity: 1 }],
            isCartOpen: true,
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: (isOpen) =>
        set((state) => ({
          isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen,
        })),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'pickleworld-cart',
    }
  )
);
