/* ===== Cart & Wishlist (with MySQL backend sync) ===== */
const readLS = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const getCart = () => readLS("ec_cart");
const getWishlist = () => readLS("ec_wish");
function saveCart(c) { localStorage.setItem("ec_cart", JSON.stringify(c)); updateCartCount(); }
function saveWishlist(w) { localStorage.setItem("ec_wish", JSON.stringify(w)); }

/* ---- Backend sync (for logged-in users; guests use localStorage) ---- */
const cartFromApi = d => d.items.map(i => ({ id: i.productId, qty: i.quantity }));

async function cartApi(method, path, body) {
  if (!getToken()) return; // guest: keep local
  try {
    const j = await apiFetch(path, { method, body });
    saveCart(cartFromApi(j.data));
    if (document.getElementById("cart-root")) renderCart();
  } catch (e) {
    showToast(e.message);
    loadServerCart();
  }
}

async function loadServerCart() {
  if (!getToken()) return;
  try {
    const j = await apiFetch("/api/cart");
    saveCart(cartFromApi(j.data));
    if (document.getElementById("cart-root")) renderCart();
  } catch (e) {}
}

async function mergeGuestCart() {
  const items = getCart().map(x => ({ productId: x.id, quantity: x.qty }));
  try {
    const j = await apiFetch("/api/cart/merge", { method: "POST", body: { items } });
    saveCart(cartFromApi(j.data));
  } catch (e) {}
}

/* ---- Wishlist sync ---- */
async function loadServerWishlist() {
  if (!getToken()) return;
  try {
    const j = await fetchWishlistApi();
    if (j.ids) {
      saveWishlist(j.ids);
      if (document.getElementById("wish-grid")) renderWishlist();
    }
  } catch (e) {}
}

async function mergeGuestWishlist() {
  if (!getToken()) return;
  const ids = getWishlist();
  if (!ids.length) return;
  try {
    const j = await syncWishlistApi(ids);
    if (j.ids) saveWishlist(j.ids);
  } catch (e) {}
}

const maxQty = id => { const p = getProductById(id); return Math.min(10, p && p.stock != null ? p.stock : 10); };

function addToCart(id, qty = 1) {
  const c = getCart(), it = c.find(x => x.id === id), m = maxQty(id);
  it ? it.qty = Math.min(m, it.qty + qty) : c.push({ id, qty: Math.min(m, qty) });
  saveCart(c);
  showToast("✓ Product added to cart");
  cartApi("POST", "/api/cart", { productId: id, quantity: qty });
}

function removeFromCart(id) {
  saveCart(getCart().filter(x => x.id !== id));
  showToast("Product removed from cart");
  renderCart();
  cartApi("DELETE", "/api/cart/" + id);
}

function updateQuantity(id, d) {
  const c = getCart(), it = c.find(x => x.id === id);
  if (!it) return;
  it.qty = Math.max(1, Math.min(maxQty(id), it.qty + d));
  saveCart(c);
  renderCart();
  cartApi("PUT", "/api/cart/" + id, { quantity: it.qty });
}

function clearCart() {
  saveCart([]);
  showToast("Cart cleared");
  renderCart();
  if (getToken()) cartApi("DELETE", "/api/cart");
}

function updateCartCount() {
  const n = getCart().reduce((s, x) => s + x.qty, 0);
  document.querySelectorAll("#cart-count").forEach(e => e.textContent = n);
}

function getCartTotal() {
  let mrp = 0, subtotal = 0;
  getCart().forEach(x => {
    const p = getProductById(x.id);
    if (p) {
      mrp += (p.oldPrice || p.price) * x.qty;
      subtotal += p.price * x.qty;
    }
  });
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  return { mrp, subtotal, discount: mrp - subtotal, delivery, total: subtotal + delivery };
}

async function addToWishlist(id) {
  const w = getWishlist();
  if (!w.includes(id)) {
    w.push(id);
    saveWishlist(w);
  }
  showToast("♥ Added to wishlist");
  if (getToken()) {
    try { await addToWishlistApi(id); } catch (e) {}
  }
}

async function removeFromWishlist(id) {
  saveWishlist(getWishlist().filter(x => x !== id));
  showToast("Removed from wishlist");
  if (document.getElementById("wish-grid")) renderWishlist();
  if (getToken()) {
    try { await removeFromWishlistApi(id); } catch (e) {}
  }
}

function renderCart() {
  const box = $("#cart-root");
  if (!box) return;
  const items = getCart().filter(x => getProductById(x.id));
  if (!items.length) {
    box.innerHTML = `<div class="empty">🛒 Your cart is empty.<br><br><a class="btn" href="products.html">Start Shopping</a></div>`;
    return;
  }
  const t = getCartTotal();
  const user = getUser();
  const checkoutHref = user ? "checkout.html" : "login.html?redirect=checkout.html";

  box.innerHTML = `<div class="cart-wrap">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <span style="font-weight:600;color:var(--muted);">${items.length} unique item${items.length > 1 ? "s" : ""}</span>
        <button class="btn line" style="min-height:36px;padding:0 12px;font-size:0.85rem;" onclick="clearCart()">Empty Cart</button>
      </div>
      ${items.map(x => {
        const p = getProductById(x.id);
        return `
        <div class="item">
          <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
          <div>
            <a href="product-details.html?id=${p.id}"><b>${p.name}</b></a>
            <div class="price"><b>${fmt(p.price)}</b><s>${fmt(p.oldPrice)}</s></div>
            <div class="qty">
              <button data-act="dec" data-id="${p.id}" aria-label="Decrease">−</button>
              <span>${x.qty}</span>
              <button data-act="inc" data-id="${p.id}" aria-label="Increase">+</button>
            </div>
          </div>
          <div>
            <b>${fmt(p.price * x.qty)}</b><br>
            <button class="rm" data-act="remove" data-id="${p.id}">Remove</button>
          </div>
        </div>`;
      }).join("")}
    </div>
    <aside class="summary">
      <h2>Order Summary</h2>
      <div class="r"><span>Subtotal (MRP)</span><span>${fmt(t.mrp)}</span></div>
      <div class="r"><span>Delivery Charges</span><span>${t.delivery ? fmt(t.delivery) : "<span style='color:var(--primary);font-weight:700'>FREE</span>"}</span></div>
      <div class="r" style="color:var(--primary)"><span>Total Discount</span><span>-${fmt(t.discount)}</span></div>
      <div class="r t"><span>Final Total</span><span>${fmt(t.total)}</span></div>
      <a class="btn" href="${checkoutHref}">Proceed to Checkout →</a>
      <a class="btn line" href="products.html">Continue Shopping</a>
      ${!user ? `<p style="font-size:0.82rem;color:var(--muted);text-align:center;margin-top:10px;">💡 You'll be asked to sign in or register to complete your order.</p>` : ""}
    </aside>
  </div>`;
}
