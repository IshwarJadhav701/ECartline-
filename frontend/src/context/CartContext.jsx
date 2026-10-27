import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchCartApi, addToCartApi, updateCartApi, removeFromCartApi, clearCartApi, getToken } from "../services/api";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ec_cart") || "[]");
    } catch {
      return [];
    }
  });
  const { showToast } = useToast();

  const saveCartLocal = useCallback((newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem("ec_cart", JSON.stringify(newCart));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, []);

  // Sync server cart when logged in
  const loadServerCart = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await fetchCartApi();
      if (data && Array.isArray(data.items)) {
        const mapped = data.items.map((i) => ({ id: i.productId, qty: i.quantity }));
        saveCartLocal(mapped);
      }
    } catch (e) {
      console.warn("Failed to load server cart:", e.message);
    }
  }, [saveCartLocal]);

  useEffect(() => {
    loadServerCart();
  }, [loadServerCart]);

  const addToCart = useCallback(
    async (product, qty = 1) => {
      const id = product.id;
      const stock = product.stock ?? 10;
      if (stock <= 0) {
        showToast("Sorry, this product is currently out of stock.");
        return false;
      }

      const existing = cart.find((item) => item.id === id);
      const maxLimit = Math.min(10, stock);

      let updated;
      if (existing) {
        if (existing.qty >= maxLimit) {
          showToast(`Maximum available stock limit (${maxLimit}) reached.`);
          return false;
        }
        const newQty = Math.min(maxLimit, existing.qty + qty);
        updated = cart.map((item) => (item.id === id ? { ...item, qty: newQty } : item));
      } else {
        updated = [...cart, { id, qty: Math.min(maxLimit, Math.max(1, qty)) }];
      }

      saveCartLocal(updated);
      showToast("✓ Product added to your cart!");

      if (getToken()) {
        try {
          await addToCartApi(id, qty);
        } catch (e) {
          console.warn("Backend cart sync error:", e);
        }
      }
      return true;
    },
    [cart, saveCartLocal, showToast]
  );

  const removeFromCart = useCallback(
    async (id) => {
      const updated = cart.filter((item) => item.id !== id);
      saveCartLocal(updated);
      showToast("Item removed from cart");

      if (getToken()) {
        try {
          await removeFromCartApi(id);
        } catch (e) {
          console.warn("Backend cart remove error:", e);
        }
      }
    },
    [cart, saveCartLocal, showToast]
  );

  const updateQuantity = useCallback(
    async (id, delta, maxStock = 10) => {
      const item = cart.find((x) => x.id === id);
      if (!item) return;

      const maxLimit = Math.min(10, maxStock);
      if (delta > 0 && item.qty >= maxLimit) {
        showToast(`Maximum quantity available in stock (${maxLimit}) reached.`);
        return;
      }

      const nextQty = item.qty + delta;
      if (nextQty <= 0) {
        removeFromCart(id);
        return;
      }

      const updated = cart.map((x) => (x.id === id ? { ...x, qty: Math.min(maxLimit, nextQty) } : x));
      saveCartLocal(updated);

      if (getToken()) {
        try {
          await updateCartApi(id, Math.min(maxLimit, nextQty));
        } catch (e) {
          console.warn("Backend cart update error:", e);
        }
      }
    },
    [cart, removeFromCart, saveCartLocal, showToast]
  );

  const clearCart = useCallback(async () => {
    saveCartLocal([]);
    showToast("Cart has been cleared");

    if (getToken()) {
      try {
        await clearCartApi();
      } catch (e) {
        console.warn("Backend clear cart error:", e);
      }
    }
  }, [saveCartLocal, showToast]);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const calculateTotals = useCallback(
    (productsList) => {
      let mrp = 0;
      let subtotal = 0;

      cart.forEach((item) => {
        const prod = productsList.find((p) => p.id === item.id);
        if (prod) {
          mrp += (prod.oldPrice || prod.price) * item.qty;
          subtotal += prod.price * item.qty;
        }
      });

      const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 49;
      const discount = mrp - subtotal;
      const total = subtotal + delivery;

      return { mrp, subtotal, discount, delivery, total };
    },
    [cart]
  );

  const value = {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotals,
    loadServerCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
