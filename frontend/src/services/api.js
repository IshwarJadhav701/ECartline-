/* ===== ECartline Centralized API Service ===== */

// Uses Vite proxy in development (/api -> http://localhost:3000), or targets port 3000 directly when opened from Apache, Live Server or build
const API_BASE =
  typeof window !== "undefined" && window.location.port !== "3000" && window.location.port !== "5173"
    ? "http://localhost:3000"
    : "";

export const getToken = () => {
  try {
    return localStorage.getItem("ec_token");
  } catch {
    return null;
  }
};

export const getUser = () => {
  try {
    const u = localStorage.getItem("ec_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const saveSession = (token, user) => {
  try {
    localStorage.setItem("ec_token", token);
    localStorage.setItem("ec_user", JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save session:", e);
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem("ec_token");
    localStorage.removeItem("ec_user");
  } catch (e) {
    console.error("Failed to clear session:", e);
  }
};

// Generic fetch wrapper with Authorization header, timeout, and error handling
export async function apiFetch(path, { method = "GET", body, timeout = 10000 } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctl.signal
    });

    let json = {};
    try {
      json = await res.json();
    } catch {}

    if (!res.ok) {
      if (res.status === 401 && token) {
        clearSession();
      }
      const err = new Error(json.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.field = json.field;
      throw err;
    }
    return json;
  } catch (e) {
    if (e.status !== undefined) throw e;
    if (e.name === "AbortError") {
      const err = new Error("Request timed out. Please check your network connection.");
      err.status = 408;
      throw err;
    }
    const err = new Error("Cannot reach the server. Please ensure the backend is running on port 3000.");
    err.status = 0;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Normalizes API product object into frontend shape
export function fromApi(r) {
  const price = Number(r.price || 0);
  const oldPrice = Number(r.oldPrice || r.price || 0);
  const pct = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  return {
    id: r.id,
    name: r.name || "Untitled Product",
    category: r.category || "General",
    price,
    oldPrice,
    pct,
    discount: pct > 0 ? `${pct}% OFF` : "",
    rating: Number(r.rating) || 0,
    reviews: Number(r.reviews) || 0,
    description: r.description || "",
    image: r.image || "",
    images: Array.isArray(r.images) && r.images.length ? r.images : [r.image].filter(Boolean),
    stock: Number(r.stock) || 0,
    inStock: (Number(r.stock) || 0) > 0,
    createdAt: r.createdAt
  };
}

/* ---- Products API ---- */
export const fetchAllProducts = async (params = "") => {
  const res = await apiFetch("/api/products" + (params ? `?${params}` : "?limit=500"));
  return (res.data || []).map(fromApi);
};
export const fetchProductsApi = fetchAllProducts;

export const fetchProduct = async (id) => {
  const res = await apiFetch("/api/products/" + encodeURIComponent(id));
  return fromApi(res.data);
};

export const fetchSuggestions = async (q) => {
  const res = await apiFetch("/api/products/suggestions?q=" + encodeURIComponent(q));
  return (res.data || []).map(fromApi);
};

export const createProductApi = async (data) => {
  const res = await apiFetch("/api/products", { method: "POST", body: data });
  return fromApi(res.data);
};

export const updateProductApi = async (id, data) => {
  const res = await apiFetch("/api/products/" + encodeURIComponent(id), { method: "PUT", body: data });
  return fromApi(res.data);
};

export const deleteProductApi = async (id) => {
  return await apiFetch("/api/products/" + encodeURIComponent(id), { method: "DELETE" });
};

/* ---- Orders API ---- */
export const placeOrder = async (orderData) => {
  return await apiFetch("/api/orders", { method: "POST", body: orderData });
};

export const fetchOrders = async () => {
  const res = await apiFetch("/api/orders");
  return res.data || [];
};

export const fetchOrder = async (id) => {
  const res = await apiFetch("/api/orders/" + encodeURIComponent(id));
  return res.data;
};

export const cancelOrder = async (id) => {
  return await apiFetch("/api/orders/" + encodeURIComponent(id) + "/cancel", { method: "PUT" });
};

export const fetchAdminOrders = async () => {
  const res = await apiFetch("/api/orders/admin/all");
  return res.data || [];
};

export const updateOrderStatus = async (id, statusData) => {
  return await apiFetch("/api/orders/admin/" + encodeURIComponent(id) + "/status", { method: "PUT", body: statusData });
};

/* ---- Cart API ---- */
export const fetchCartApi = async () => {
  const res = await apiFetch("/api/cart");
  return res.data || { items: [] };
};

export const addToCartApi = async (productId, quantity = 1) => {
  return await apiFetch("/api/cart", { method: "POST", body: { productId, quantity } });
};

export const updateCartApi = async (productId, quantity) => {
  return await apiFetch(`/api/cart/${encodeURIComponent(productId)}`, { method: "PUT", body: { quantity } });
};

export const removeFromCartApi = async (productId) => {
  return await apiFetch(`/api/cart/${encodeURIComponent(productId)}`, { method: "DELETE" });
};

export const clearCartApi = async () => {
  return await apiFetch("/api/cart", { method: "DELETE" });
};

export const mergeCartApi = async (items) => {
  return await apiFetch("/api/cart/merge", { method: "POST", body: { items } });
};

/* ---- Wishlist API ---- */
export const fetchWishlistApi = async () => {
  return await apiFetch("/api/wishlist");
};

export const addToWishlistApi = async (productId) => {
  return await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "POST" });
};

export const removeFromWishlistApi = async (productId) => {
  return await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
};

export const syncWishlistApi = async (productIds) => {
  return await apiFetch("/api/wishlist/sync", { method: "POST", body: { productIds } });
};

/* ---- Addresses API ---- */
export const fetchAddresses = async () => {
  const res = await apiFetch("/api/addresses");
  return res.data || [];
};

export const saveAddress = async (data) => {
  const res = await apiFetch("/api/addresses", { method: "POST", body: data });
  return res.data;
};

export const updateAddress = async (id, data) => {
  const res = await apiFetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "PUT", body: data });
  return res.data;
};

export const deleteAddress = async (id) => {
  return await apiFetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
};

export const setDefaultAddress = async (id) => {
  return await apiFetch(`/api/addresses/${encodeURIComponent(id)}/default`, { method: "PUT" });
};

/* ---- Reviews API ---- */
export const fetchReviews = async (productId) => {
  return await apiFetch(`/api/reviews/product/${encodeURIComponent(productId)}`);
};

export const submitReview = async (productId, data) => {
  return await apiFetch(`/api/reviews/product/${encodeURIComponent(productId)}`, { method: "POST", body: data });
};

/* ---- Auth & Profile API ---- */
export const loginApi = async (credentials) => {
  return await apiFetch("/api/auth/login", { method: "POST", body: credentials });
};

export const registerApi = async (userData) => {
  return await apiFetch("/api/auth/register", { method: "POST", body: userData });
};

export const updateProfile = async (data) => {
  return await apiFetch("/api/auth/profile", { method: "PUT", body: data });
};

export const changePassword = async (data) => {
  return await apiFetch("/api/auth/change-password", { method: "PUT", body: data });
};

export const fetchAdminStats = async () => {
  const res = await apiFetch("/api/auth/admin/stats");
  return res.data || {};
};

/* ---- Contact Inquiries API ---- */
export const fetchContactMessages = async () => {
  const res = await apiFetch("/api/contact");
  return res.data || [];
};

export const submitContactMessage = async (data) => {
  return await apiFetch("/api/contact", { method: "POST", body: data });
};
