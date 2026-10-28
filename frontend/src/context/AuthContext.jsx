import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser, getToken, saveSession, clearSession, loginApi, registerApi, mergeCartApi, syncWishlistApi } from "../services/api";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const { showToast } = useToast();

  useEffect(() => {
    // Sync storage events if multiple tabs are open
    const handleStorage = (e) => {
      if (e.key === "ec_user" || e.key === "ec_token") {
        setUser(getUser());
        setToken(getToken());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loginUser = (sessionToken, sessionUser) => {
    if (!sessionToken || !sessionUser) return;
    saveSession(sessionToken, sessionUser);
    setToken(sessionToken);
    setUser(sessionUser);

    // Merge any local guest cart items
    try {
      const localCart = JSON.parse(localStorage.getItem("ec_cart") || "[]");
      if (localCart.length) {
        const items = localCart.map((x) => ({ productId: x.id, quantity: x.qty }));
        mergeCartApi(items).catch((e) => console.warn("Guest cart merge error:", e));
      }
    } catch (e) {
      console.warn("Guest cart merge error:", e);
    }

    // Merge any guest wishlist items
    try {
      const localWish = JSON.parse(localStorage.getItem("ec_wish") || "[]");
      if (localWish.length) {
        syncWishlistApi(localWish).catch((e) => console.warn("Guest wishlist merge error:", e));
      }
    } catch (e) {
      console.warn("Guest wishlist merge error:", e);
    }
  };

  const login = async (id, password) => {
    const res = await loginApi({ id, password });
    if (res.token && res.user) {
      loginUser(res.token, res.user);
      showToast(`✓ Welcome back, ${res.user.name ? res.user.name.split(" ")[0] : "User"}!`);
      return res.user;
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    showToast("✓ Account created successfully! Please sign in.");
    return res;
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("ec_cart");
      localStorage.removeItem("ec_wish");
    } catch {}
    showToast("Signed out successfully");
  };

  const logoutUser = logout;

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem("ec_user", JSON.stringify(updatedUser));
    } catch {}
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === "admin",
    login,
    loginUser,
    register,
    logout,
    logoutUser,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
