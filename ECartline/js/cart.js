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

const maxQty = id => {
  const p = getProductById(id);
  return Math.min(10, p && p.stock != null ? p.stock : 10);
};

function addToCart(id, qty = 1) {
  const p = getProductById(id);
  if (!p || p.stock <= 0) {
    showToast("Sorry, this product is currently out of stock.");
    return;
  }
  const c = getCart();
  const it = c.find(x => x.id === id);
  const m = maxQty(id);

  if (it) {
    if (it.qty >= m) {
      showToast(`Maximum available stock limit (${m}) reached.`);
      return;
    }
    it.qty = Math.min(m, it.qty + qty);
  } else {
    c.push({ id, qty: Math.min(m, Math.max(1, qty)) });
  }

  saveCart(c);
  showToast("✓ Product added to your cart!");
  cartApi("POST", "/api/cart", { productId: id, quantity: qty });
}

function removeFromCart(id) {
  saveCart(getCart().filter(x => x.id !== id));
  showToast("Item removed from cart");
  renderCart();
  cartApi("DELETE", "/api/cart/" + id);
}

function updateQuantity(id, d) {
  const c = getCart();
  const it = c.find(x => x.id === id);
  if (!it) return;
  const m = maxQty(id);

  if (d > 0 && it.qty >= m) {
    showToast(`Maximum quantity available in stock (${m}) reached.`);
    return;
  }

  const nextQty = it.qty + d;
  if (nextQty <= 0) {
    removeFromCart(id);
    return;
  }

  it.qty = Math.min(m, nextQty);
  saveCart(c);
  renderCart();
  cartApi("PUT", "/api/cart/" + id, { quantity: it.qty });
}

function clearCart() {
  if (!getCart().length) return;
  if (confirm("Are you sure you want to remove all items from your cart?")) {
    saveCart([]);
    showToast("Cart has been cleared");
    renderCart();
    if (getToken()) cartApi("DELETE", "/api/cart");
  }
}

function moveToWishlist(id) {
  addToWishlist(id);
  removeFromCart(id);
  showToast("✓ Moved to your Wishlist");
}

function updateCartCount() {
  const n = getCart().reduce((s, x) => s + x.qty, 0);
  document.querySelectorAll("#cart-count, #mobile-cart-badge").forEach(e => e.textContent = n);
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
  showToast("♥ Added to Wishlist");
  if (getToken()) {
    try { await addToWishlistApi(id); } catch (e) {}
  }
}

async function removeFromWishlist(id) {
  saveWishlist(getWishlist().filter(x => x !== id));
  showToast("Removed from Wishlist");
  if (document.getElementById("wish-grid")) renderWishlist();
  if (getToken()) {
    try { await removeFromWishlistApi(id); } catch (e) {}
  }
}

/* ---- Render Shopping Cart (Flipkart / Amazon Usability) ---- */
function renderCart() {
  const box = $("#cart-root");
  if (!box) return;

  const rawCart = getCart();
  const items = rawCart.map(x => ({ ...x, product: getProductById(x.id) })).filter(x => x.product);

  if (!items.length) {
    box.innerHTML = `
      <div class="empty">
        <div style="font-size:3.5rem;margin-bottom:12px;">🛒</div>
        <h2 style="font-size:1.4rem;font-weight:800;color:var(--text-main);margin-bottom:8px;">Your Shopping Cart is empty</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;">Explore our catalog to discover trending electronics, smartphones, fashion & home essentials.</p>
        <a class="btn" href="products.html">Start Shopping Now →</a>
      </div>`;
    return;
  }

  const t = getCartTotal();
  const user = getUser();
  const checkoutHref = user ? "checkout.html" : "login.html?redirect=checkout.html";
  const hasOutOfStock = items.some(x => !x.product.inStock || x.product.stock <= 0);

  box.innerHTML = `
  <div class="cart-wrap">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:#FFFFFF;padding:14px 18px;border-radius:var(--r-md);border:1px solid var(--border);">
        <span style="font-weight:700;color:var(--text-main);font-size:1.05rem;">
          Shopping Cart (${items.length} item${items.length > 1 ? "s" : ""})
        </span>
        <button class="btn line" style="min-height:34px;padding:0 14px;font-size:0.82rem;" onclick="clearCart()">
          Clear Cart
        </button>
      </div>

      ${items.map(x => {
        const p = x.product;
        const isOos = !p.inStock || p.stock <= 0;
        const isLow = !isOos && p.stock <= 4;
        const curMax = maxQty(p.id);

        return `
        <div class="item ${isOos ? 'item-oos' : ''}">
          <a href="product-details.html?id=${p.id}" class="img-link" aria-label="${p.name}">
            <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
          </a>
          <div>
            <a href="product-details.html?id=${p.id}" class="item-title">
              <b>${p.name}</b>
            </a>
            <div style="font-size:0.8rem;color:var(--text-muted);margin:2px 0;">Category: ${p.category}</div>
            
            <div class="price" style="margin:4px 0;">
              <b>${fmt(p.price)}</b>
              <s>${fmt(p.oldPrice)}</s>
              <em>${p.discount}</em>
            </div>

            ${isOos
              ? '<span class="oos" style="display:block;margin:4px 0;">✖ Out of stock</span>'
              : (isLow ? `<span style="color:#D97706;font-size:0.8rem;font-weight:700;display:block;margin:4px 0;">⚠️ Only ${p.stock} left in stock - order soon</span>` : '<span class="in-stock" style="display:block;margin:4px 0;">✓ In Stock</span>')
            }

            <div style="display:flex;align-items:center;gap:16px;margin-top:10px;flex-wrap:wrap;">
              <div class="qty">
                <button data-act="dec" data-id="${p.id}" aria-label="Decrease quantity" ${isOos ? "disabled" : ""}>−</button>
                <span>${x.qty}</span>
                <button data-act="inc" data-id="${p.id}" aria-label="Increase quantity" ${isOos || x.qty >= curMax ? "disabled" : ""}>+</button>
              </div>
              <button class="btn line" style="min-height:32px;padding:0 10px;font-size:0.8rem;" onclick="moveToWishlist(${p.id})">Save for Later</button>
              <button class="rm" data-act="remove" data-id="${p.id}" style="font-size:0.82rem;">Remove</button>
            </div>
          </div>
          <div style="text-align:right;">
            <b style="font-size:1.15rem;color:var(--text-main);">${fmt(p.price * x.qty)}</b>
          </div>
        </div>`;
      }).join("")}
    </div>

    <!-- Right Price Details Summary Card -->
    <aside class="summary">
      <h2>PRICE DETAILS</h2>
      <div class="r">
        <span>Price (${items.reduce((s, i) => s + i.qty, 0)} items)</span>
        <span>${fmt(t.mrp)}</span>
      </div>
      <div class="r" style="color:var(--discount-green);font-weight:700;">
        <span>Discount Savings</span>
        <span>-${fmt(t.discount)}</span>
      </div>
      <div class="r">
        <span>Delivery Charges</span>
        <span>${t.delivery ? fmt(t.delivery) : "<b style='color:var(--primary)'>FREE Delivery</b>"}</span>
      </div>
      <div class="r t">
        <span>Total Amount</span>
        <span>${fmt(t.total)}</span>
      </div>

      <div class="savings-pill">
        🎉 You will save ${fmt(t.discount)} on this order!
      </div>

      ${hasOutOfStock ? `
        <div style="color:#DC2626;font-size:0.85rem;font-weight:700;margin-bottom:10px;text-align:center;">
          ⚠️ Please remove out-of-stock items before checkout.
        </div>
      ` : ""}

      <a class="btn ${hasOutOfStock ? 'disabled' : ''}" href="${hasOutOfStock ? '#' : checkoutHref}" style="width:100%;font-size:1.05rem;min-height:48px;" ${hasOutOfStock ? 'onclick="showToast(\'Remove out-of-stock items first\');return false;"' : ''}>
        Proceed to Checkout →
      </a>
      
      <a class="btn line" href="products.html" style="width:100%;margin-top:10px;">
        Continue Shopping
      </a>

      <p style="font-size:0.8rem;color:var(--text-muted);text-align:center;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:6px;">
        🔒 Safe & Secure 256-bit SSL Checkout
      </p>
    </aside>
  </div>`;
}
