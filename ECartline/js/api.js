/* ===== ECartline API helper (talks to the Node/Express backend) ===== */
const API_BASE = window.ECARTLINE_API_BASE !== undefined ? window.ECARTLINE_API_BASE
  : (location.protocol === "file:" || (["localhost", "127.0.0.1"].includes(location.hostname) && location.port !== "3000")) ? "http://localhost:3000" : "";

const getToken = () => localStorage.getItem("ec_token");
const getUser = () => { try { return JSON.parse(localStorage.getItem("ec_user")); } catch { return null; } };
function saveSession(token, user) { localStorage.setItem("ec_token", token); localStorage.setItem("ec_user", JSON.stringify(user)); }
function clearSession() { localStorage.removeItem("ec_token"); localStorage.removeItem("ec_user"); }
function logout() {
  clearSession();
  localStorage.removeItem("ec_cart");
  localStorage.removeItem("ec_wish");
  if (typeof showToast === "function") showToast("Signed out successfully");
  setTimeout(() => { location.href = "index.html"; }, 500);
}

// fetch() wrapper: adds JSON headers + login token, throws Error(message) when the API says no.
async function apiFetch(path, { method = "GET", body, timeout = 9000 } = {}) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeout);
  const headers = { "Content-Type": "application/json" }, token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  try {
    const res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal });
    let json = {}; try { json = await res.json(); } catch {}
    if (!res.ok) {
      if (res.status === 401 && token) {
        clearSession();
        if (typeof showToast === "function") showToast("Session expired. Please log in again.");
      }
      const err = new Error(json.message || "Request failed"); err.status = res.status; err.field = json.field; throw err;
    }
    return json;
  } catch (e) {
    if (e.status !== undefined) throw e;
    const err = new Error("Cannot reach the server. Please ensure the backend is running."); err.status = 0; throw err;
  } finally { clearTimeout(timer); }
}

// Converts an API product into the shape the existing frontend code already uses.
function fromApi(r) {
  const price = Number(r.price), oldPrice = Number(r.oldPrice || r.price);
  const pct = oldPrice > price ? Math.round((oldPrice - price) / oldPrice * 100) : 0;
  return {
    id: r.id, name: r.name, category: r.category, price, oldPrice, pct, discount: pct + "% OFF",
    rating: Number(r.rating) || 0, reviews: r.reviews || 0, description: r.description || "",
    image: r.image, images: r.images && r.images.length ? r.images : [r.image],
    stock: r.stock, inStock: r.stock > 0, createdAt: r.createdAt
  };
}

const fetchAllProducts = async (params = "") => (await apiFetch("/api/products" + (params ? "?" + params : "?limit=500"))).data.map(fromApi);
const fetchProduct = async id => fromApi((await apiFetch("/api/products/" + encodeURIComponent(id))).data);
const fetchSuggestions = async q => (await apiFetch("/api/products/suggestions?q=" + encodeURIComponent(q))).data.map(fromApi);

/* ---- Orders API ---- */
const placeOrder = async (orderData) => (await apiFetch("/api/orders", { method: "POST", body: orderData }));
const fetchOrders = async () => (await apiFetch("/api/orders")).data;
const fetchOrder = async (id) => (await apiFetch("/api/orders/" + encodeURIComponent(id))).data;
const cancelOrder = async (id) => (await apiFetch("/api/orders/" + encodeURIComponent(id) + "/cancel", { method: "PUT" }));

/* ---- Addresses API ---- */
const fetchAddresses = async () => (await apiFetch("/api/addresses")).data;
const saveAddress = async (data) => (await apiFetch("/api/addresses", { method: "POST", body: data })).data;
const updateAddress = async (id, data) => (await apiFetch("/api/addresses/" + encodeURIComponent(id), { method: "PUT", body: data })).data;
const deleteAddress = async (id) => (await apiFetch("/api/addresses/" + encodeURIComponent(id), { method: "DELETE" }));
const setDefaultAddress = async (id) => (await apiFetch("/api/addresses/" + encodeURIComponent(id) + "/default", { method: "PUT" }));

/* ---- Reviews API ---- */
const fetchReviews = async (productId) => (await apiFetch("/api/reviews/product/" + encodeURIComponent(productId)));
const submitReview = async (productId, data) => (await apiFetch("/api/reviews/product/" + encodeURIComponent(productId), { method: "POST", body: data }));

/* ---- Wishlist API ---- */
const fetchWishlistApi = async () => (await apiFetch("/api/wishlist"));
const addToWishlistApi = async (productId) => (await apiFetch("/api/wishlist/" + encodeURIComponent(productId), { method: "POST" }));
const removeFromWishlistApi = async (productId) => (await apiFetch("/api/wishlist/" + encodeURIComponent(productId), { method: "DELETE" }));
const syncWishlistApi = async (productIds) => (await apiFetch("/api/wishlist/sync", { method: "POST", body: { productIds } }));

/* ---- Profile & Auth API ---- */
const updateProfile = async (data) => (await apiFetch("/api/auth/profile", { method: "PUT", body: data }));
const changePassword = async (data) => (await apiFetch("/api/auth/change-password", { method: "PUT", body: data }));
const fetchAdminStats = async () => (await apiFetch("/api/auth/admin/stats")).data;

/* ---- Admin API ---- */
const fetchAdminOrders = async () => (await apiFetch("/api/orders/admin/all")).data;
const updateOrderStatus = async (id, statusData) => (await apiFetch("/api/orders/admin/" + encodeURIComponent(id) + "/status", { method: "PUT", body: statusData }));
const createProductApi = async (data) => (await apiFetch("/api/products", { method: "POST", body: data })).data;
const updateProductApi = async (id, data) => (await apiFetch("/api/products/" + encodeURIComponent(id), { method: "PUT", body: data })).data;
const deleteProductApi = async (id) => (await apiFetch("/api/products/" + encodeURIComponent(id), { method: "DELETE" }));
const fetchContactMessages = async () => (await apiFetch("/api/contact")).data;
const submitContactMessage = async (data) => (await apiFetch("/api/contact", { method: "POST", body: data }));
