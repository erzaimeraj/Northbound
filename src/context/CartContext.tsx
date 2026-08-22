import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, ProductWithImages } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: ProductWithImages,
    quantity: number,
    variant: string | null,
  ) => void;
  removeItem: (productId: string, variant: string | null) => void;
  updateQuantity: (
    productId: string,
    variant: string | null,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'northbound-cart';

interface StoredItem {
  product_id: string;
  product_name: string;
  slug: string;
  unit_price_cents: number;
  quantity: number;
  variant: string | null;
  image_url: string;
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i.product_id && i.product_name && typeof i.unit_price_cents === 'number',
    );
  } catch {
    return [];
  }
}

function sameLine(
  a: { product_id: string; variant: string | null },
  b: { product_id: string; variant: string | null },
): boolean {
  return a.product_id === b.product_id && a.variant === b.variant;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [items]);

  const addItem = (
    product: ProductWithImages,
    quantity: number,
    variant: string | null,
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        sameLine(i, { product_id: product.id, variant }),
      );
      if (existing) {
        return prev.map((i) =>
          sameLine(i, { product_id: product.id, variant })
            ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
            : i,
        );
      }
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        slug: product.slug,
        unit_price_cents: product.price_cents,
        quantity: Math.min(quantity, 99),
        variant,
        image_url: product.images[0]?.url ?? '',
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, variant: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !sameLine(i, { product_id: productId, variant })),
    );
  };

  const updateQuantity = (
    productId: string,
    variant: string | null,
    quantity: number,
  ) => {
    if (quantity < 1) {
      removeItem(productId, variant);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, { product_id: productId, variant })
          ? { ...i, quantity: Math.min(quantity, 99) }
          : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.unit_price_cents * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
