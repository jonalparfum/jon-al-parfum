"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Product, CartItem, cartItemKey } from "@/types";
import { productHasStock } from "@/lib/product-variants";

type CartState = {
  items: CartItem[];
};

type AddItemPayload = {
  product: Product;
  variantId?: string;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: AddItemPayload }
  | { type: "REMOVE_ITEM"; key: string }
  | { type: "UPDATE_QUANTITY"; key: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] };

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, variantId?: string) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildCartItem(product: Product, variantId?: string): CartItem | null {
  if (product.variants?.length) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant || variant.stock <= 0) return null;
    return {
      product,
      quantity: 1,
      variantId: variant.id,
      variantLabel: variant.label,
      unitPrice: variant.price,
      maxStock: variant.stock,
    };
  }

  if (!productHasStock(product.stock)) return null;

  return {
    product,
    quantity: 1,
    unitPrice: product.price,
    maxStock: product.stock,
  };
}

function normalizeStoredItem(raw: Partial<CartItem>): CartItem | null {
  if (!raw?.product?.id) return null;

  const unitPrice = raw.unitPrice ?? raw.product.price ?? 0;
  const maxStock = raw.maxStock ?? raw.product.stock ?? 0;

  return {
    product: raw.product,
    quantity: Math.max(1, raw.quantity ?? 1),
    variantId: raw.variantId,
    variantLabel: raw.variantLabel,
    unitPrice,
    maxStock,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const nextItem = buildCartItem(
        action.payload.product,
        action.payload.variantId
      );
      if (!nextItem) return state;

      const key = cartItemKey(nextItem);
      const existing = state.items.find((item) => cartItemKey(item) === key);

      if (existing) {
        const quantity = Math.min(existing.quantity + 1, existing.maxStock);
        return {
          items: state.items.map((item) =>
            cartItemKey(item) === key ? { ...item, quantity } : item
          ),
        };
      }

      return { items: [...state.items, nextItem] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => cartItemKey(item) !== action.key),
      };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => cartItemKey(item) !== action.key
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          cartItemKey(item) === action.key
            ? {
                ...item,
                quantity: Math.min(action.quantity, item.maxStock),
              }
            : item
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      return {
        items: action.items
          .map((item) => normalizeStoredItem(item))
          .filter((item): item is CartItem => item !== null),
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("jon-al-parfum-cart");
    if (saved) {
      try {
        dispatch({ type: "LOAD_CART", items: JSON.parse(saved) });
      } catch {
        // ignore invalid cart data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jon-al-parfum-cart", JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (product, variantId) =>
          dispatch({ type: "ADD_ITEM", payload: { product, variantId } }),
        removeItem: (key) => dispatch({ type: "REMOVE_ITEM", key }),
        updateQuantity: (key, quantity) =>
          dispatch({ type: "UPDATE_QUANTITY", key, quantity }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
