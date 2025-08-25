import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface CartStore {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, variantSize?: string) => void;
  updateQuantity: (itemId: string, quantity: number, variantSize?: string) => void;
  clearCart: () => void;
}

// Helper to generate a unique key for cart items with variants
const getItemKey = (id: string, variant?: { size?: string; color?: string }) => {
  if (!variant) return id;
  return `${id}-${variant.size || ''}-${variant.color || ''}`;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,
      
      addItem: (item) => {
        const items = [...get().items];
        const itemKey = getItemKey(item.id, item.variant);
        
        // Check if item with same ID and variant already exists
        const existingItemIndex = items.findIndex(i => 
          getItemKey(i.id, i.variant) === itemKey
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          items.push(item);
        }
        
        // Update totals
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items, itemCount, total });
      },
      
      removeItem: (itemId, variantSize) => {
        const items = get().items.filter(item => {
          if (variantSize) {
            return !(item.id === itemId && item.variant?.size === variantSize);
          }
          return item.id !== itemId;
        });
        
        // Update totals
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({ items, itemCount, total });
      },
      
      updateQuantity: (itemId, quantity, variantSize) => {
        const items = [...get().items];
        
        const itemIndex = items.findIndex(item => {
          if (variantSize) {
            return item.id === itemId && item.variant?.size === variantSize;
          }
          return item.id === itemId;
        });
        
        if (itemIndex >= 0) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            items.splice(itemIndex, 1);
          } else {
            // Update quantity
            items[itemIndex].quantity = quantity;
          }
          
          // Update totals
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({ items, itemCount, total });
        }
      },
      
      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
