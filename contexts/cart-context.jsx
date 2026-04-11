'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);
const STORAGE = 'nexus_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const addItem = useCallback((product, qty = 1) => {
    const id = product.product_id;
    const max = Number(product.stock_quantity) || 0;
    setItems((prev) => {
      const list = [...prev];
      const i = list.findIndex((x) => x.product_id === id);
      if (i >= 0) {
        const nextQty = Math.min(max, list[i].quantity + qty);
        list[i] = { ...list[i], quantity: nextQty };
      } else {
        list.push({
          product_id: id,
          product_name: product.product_name,
          unit_price: Number(product.price),
          quantity: Math.min(max, qty),
          stock_quantity: max,
        });
      }
      try {
        localStorage.setItem(STORAGE, JSON.stringify(list));
      } catch {
        /* ignore */
      }
      return list;
    });
  }, []);

  const setQty = useCallback((productId, quantity) => {
    setItems((prev) => {
      const next = prev
        .map((x) =>
          x.product_id === productId
            ? {
                ...x,
                quantity: Math.max(
                  1,
                  Math.min(x.stock_quantity, quantity)
                ),
              }
            : x
        )
        .filter((x) => x.quantity > 0);
      try {
        localStorage.setItem(STORAGE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.product_id !== productId);
      try {
        localStorage.setItem(STORAGE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE);
    } catch {
      /* ignore */
    }
  }, []);

  const count = useMemo(
    () => items.reduce((s, x) => s + x.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((s, x) => s + x.unit_price * x.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      setQty,
      removeItem,
      clear,
    }),
    [items, count, subtotal, addItem, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
