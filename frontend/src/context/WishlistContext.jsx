import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchWishlistApi, addToWishlistApi, removeFromWishlistApi, getToken } from "../services/api";
import { useToast } from "./ToastContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ec_wish") || "[]");
    } catch {
      return [];
    }
  });
  const { showToast } = useToast();

  const saveWishlistLocal = useCallback((ids) => {
    setWishlist(ids);
    try {
      localStorage.setItem("ec_wish", JSON.stringify(ids));
    } catch (e) {
      console.error("Wishlist save error:", e);
    }
  }, []);

  const loadServerWishlist = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await fetchWishlistApi();
      if (res && Array.isArray(res.ids)) {
        saveWishlistLocal(res.ids);
      } else if (res && Array.isArray(res.data)) {
        saveWishlistLocal(res.data.map((p) => p.id));
      }
    } catch (e) {
      console.warn("Failed to load server wishlist:", e.message);
    }
  }, [saveWishlistLocal]);

  useEffect(() => {
    loadServerWishlist();
  }, [loadServerWishlist]);

  const isInWishlist = useCallback(
    (id) => {
      return wishlist.includes(Number(id));
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (id) => {
      const numId = Number(id);
      const isPresent = wishlist.includes(numId);

      let updated;
      if (isPresent) {
        updated = wishlist.filter((item) => item !== numId);
        showToast("Removed from Wishlist");
        if (getToken()) {
          try {
            await removeFromWishlistApi(numId);
          } catch (e) {
            console.warn("Server wishlist removal failed:", e);
          }
        }
      } else {
        updated = [...wishlist, numId];
        showToast("♥ Added to Wishlist");
        if (getToken()) {
          try {
            await addToWishlistApi(numId);
          } catch (e) {
            console.warn("Server wishlist addition failed:", e);
          }
        }
      }

      saveWishlistLocal(updated);
    },
    [wishlist, saveWishlistLocal, showToast]
  );

  const removeFromWishlist = useCallback(
    async (id) => {
      const numId = Number(id);
      const updated = wishlist.filter((item) => item !== numId);
      saveWishlistLocal(updated);
      showToast("Removed from Wishlist");

      if (getToken()) {
        try {
          await removeFromWishlistApi(numId);
        } catch (e) {
          console.warn("Server wishlist remove failed:", e);
        }
      }
    },
    [wishlist, saveWishlistLocal, showToast]
  );

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    loadServerWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
