/* ===== ECartline main app: shared UI, rendering, pages ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
const FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='225' font-size='70' text-anchor='middle'>🛍️</text></svg>";
const getProductById = id => products.find(p => p.id === Number(id));
const params = new URLSearchParams(location.search);

/* ---- Toast Notification ---- */
function showToast(msg) {
  let b = $("#toast-box");
  if (!b) {
    b = document.createElement("div");
    b.id = "toast-box";
    b.setAttribute("role", "status");
    document.body.appendChild(b);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = msg;
  b.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

/* ---- User Location / Pincode Helper ---- */
function getDeliveryPincode() {
  return localStorage.getItem("ec_pincode") || "411001";
}
function setDeliveryPincode(pin) {
  if (/^\d{6}$/.test(pin)) {
    localStorage.setItem("ec_pincode", pin);
    const el = $("#hdr-pincode");
    if (el) el.textContent = pin;
    return true;
  }
  return false;
}

/* ---- Header & Navigation ---- */
const navLinks = ["All", "Mobiles", "Electronics", "Fashion", "Footwear", "Home & Kitchen", "Sports", "Beauty", "Toys", "Furniture", "Bags", "Accessories"];

function renderHeader() {
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  const userFirst = user ? user.name.split(" ")[0] : "Sign in";
  const currentPin = getDeliveryPincode();

  $("#site-header").innerHTML = `
  <div class="sale-bar">
    <span>🌿 Winter Super Sale: Up to 50% Off on Top Electronics, Mobiles & Fashion!</span>
    <a href="products.html?sort=discount">Shop Deals</a>
  </div>
  <header class="site-header">
    <div class="container hdr">
      <button class="burger" aria-label="Open menu">☰</button>
      <a class="logo" href="index.html" aria-label="ECartline home">E<span>Cartline</span></a>
      
      <div class="loc" id="hdr-loc-btn" title="Click to change delivery pincode">
        📍 Deliver to <b id="hdr-pincode">${currentPin}</b>
      </div>

      <div class="search-container">
        <form class="search" action="products.html" role="search" autocomplete="off">
          <select name="category" aria-label="Category">
            <option value="">All Categories</option>
            ${categories.map(c => `<option value="${c}" ${params.get("category") === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
          <input id="hdr-search-input" name="q" type="search" placeholder="Search ECartline for mobiles, laptops, fashion, kitchen..." aria-label="Search products" value="${params.get("q") || ""}">
          <button type="submit" aria-label="Search">🔍</button>
        </form>
        <div id="search-suggestions" class="search-suggestions" aria-label="Search suggestions"></div>
      </div>

      <!-- Account dropdown -->
      <div class="account-menu-wrap">
        <div class="hl acc-trigger" id="acc-trigger" tabindex="0">
          <small>Hello, ${userFirst}</small>
          <span>Account & Lists ▾</span>
        </div>
        <div class="acc-dropdown" id="acc-dropdown">
          ${user ? `
            <div class="acc-hdr">
              <b>${user.name}</b>
              <small>${user.email}</small>
              ${isAdmin ? `<span class="badge" style="position:static;display:inline-block;margin-top:4px;">ADMIN</span>` : ""}
            </div>
            <a href="profile.html">👤 My Account & Addresses</a>
            <a href="orders.html">📦 My Orders & Tracking</a>
            <a href="wishlist.html">♥ Saved Wishlist</a>
            ${isAdmin ? `<a href="admin.html" style="color:var(--primary);font-weight:700;">⚡ Admin Dashboard</a>` : ""}
            <div class="acc-div"></div>
            <button class="logout-btn" onclick="logout()">🚪 Sign Out</button>
          ` : `
            <div style="text-align:center;padding:8px 0 12px;">
              <a class="btn" href="login.html" style="width:100%;margin-bottom:8px;">Sign In</a>
              <small>New customer? <a href="register.html" style="color:var(--primary);font-weight:700;">Start here</a></small>
            </div>
            <div class="acc-div"></div>
            <a href="orders.html">📦 Track Existing Orders</a>
            <a href="wishlist.html">♥ Saved Wishlist</a>
          `}
        </div>
      </div>

      <a class="hl" href="${user ? "orders.html" : "login.html?redirect=orders.html"}">
        <small>Returns</small>
        <span>& Orders</span>
      </a>

      <a class="cart-link" href="cart.html" aria-label="Shopping Cart">
        🛒<span id="cart-count">0</span>
        <b>Cart</b>
      </a>
    </div>

    <nav class="subnav" aria-label="Main navigation">
      <div class="container">
        ${navLinks.map(c => `<a href="${c === "All" ? "products.html" : "products.html?category=" + encodeURIComponent(c)}">${c}</a>`).join("")}
        <a href="products.html?sort=discount" style="color:var(--accent);font-weight:700;">🔥 Today's Deals</a>
        <a href="products.html?sort=newest">✨ New Releases</a>
        <a href="contact.html">🎧 24/7 Support</a>
        ${isAdmin ? `<a href="admin.html" style="margin-left:auto;background:rgba(255,255,255,0.18);font-weight:700;">⚡ Admin Portal</a>` : ""}
      </div>
    </nav>
  </header>
  <div class="overlay"></div>

  <!-- Mobile Bottom App Bar (Flipkart/Amazon style) -->
  <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
    <a href="index.html" class="mobile-nav-item ${location.pathname.endsWith('index.html') || location.pathname === '/' ? 'active' : ''}">
      <span class="icon">🏠</span>
      <span>Home</span>
    </a>
    <a href="categories.html" class="mobile-nav-item ${location.pathname.endsWith('categories.html') ? 'active' : ''}">
      <span class="icon">📑</span>
      <span>Categories</span>
    </a>
    <a href="wishlist.html" class="mobile-nav-item ${location.pathname.endsWith('wishlist.html') ? 'active' : ''}">
      <span class="icon">♥</span>
      <span>Wishlist</span>
    </a>
    <a href="${user ? 'orders.html' : 'login.html?redirect=orders.html'}" class="mobile-nav-item ${location.pathname.endsWith('orders.html') ? 'active' : ''}">
      <span class="icon">📦</span>
      <span>Orders</span>
    </a>
    <a href="cart.html" class="mobile-nav-item ${location.pathname.endsWith('cart.html') ? 'active' : ''}">
      <span class="icon">🛒</span>
      <span>Cart</span>
      <span id="mobile-cart-badge" class="mobile-nav-badge">0</span>
    </a>
  </nav>`;

  // Pincode change click
  const locBtn = $("#hdr-loc-btn");
  if (locBtn) {
    locBtn.onclick = () => {
      const pin = prompt("Enter 6-digit delivery pincode for shipping availability:", getDeliveryPincode());
      if (pin) {
        if (setDeliveryPincode(pin.trim())) {
          showToast(`✓ Delivery location set to ${pin.trim()}`);
        } else {
          showToast("Please enter a valid 6-digit postal pincode.");
        }
      }
    };
  }

  // Hamburger menu toggle
  const nav = $(".subnav"), ov = $(".overlay");
  const toggle = o => { nav.classList.toggle("open", o); ov.classList.toggle("show", o); };
  $(".burger").onclick = () => toggle(true);
  ov.onclick = () => toggle(false);

  // Account dropdown behavior
  const trigger = $("#acc-trigger"), drop = $("#acc-dropdown");
  if (trigger && drop) {
    trigger.onclick = (e) => { e.stopPropagation(); drop.classList.toggle("show"); };
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !drop.contains(e.target)) drop.classList.remove("show");
    });
  }

  // Live Search Auto-suggestions with Debounce
  setupSearchSuggestions();
}

function setupSearchSuggestions() {
  const input = $("#hdr-search-input");
  const box = $("#search-suggestions");
  if (!input || !box) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) {
      box.classList.remove("show");
      box.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const matches = await fetchSuggestions(q);
        if (!matches.length) {
          box.innerHTML = `<div class="sugg-empty">No products matching "${q}"</div>`;
          box.classList.add("show");
          return;
        }

        box.innerHTML = matches.map(p => `
          <a class="sugg-item" href="product-details.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
            <div class="sugg-info">
              <span class="sugg-name">${p.name}</span>
              <span class="sugg-cat">${p.category}</span>
            </div>
            <span class="sugg-price">${fmt(p.price)}</span>
          </a>
        `).join("") + `<a class="sugg-all" href="products.html?q=${encodeURIComponent(q)}">See all results for "${q}" →</a>`;
        box.classList.add("show");
      } catch (e) {
        const local = searchProducts(products, q).slice(0, 5);
        if (local.length) {
          box.innerHTML = local.map(p => `
            <a class="sugg-item" href="product-details.html?id=${p.id}">
              <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
              <div class="sugg-info">
                <span class="sugg-name">${p.name}</span>
                <span class="sugg-cat">${p.category}</span>
              </div>
              <span class="sugg-price">${fmt(p.price)}</span>
            </a>
          `).join("") + `<a class="sugg-all" href="products.html?q=${encodeURIComponent(q)}">See all results for "${q}" →</a>`;
          box.classList.add("show");
        } else {
          box.classList.remove("show");
        }
      }
    }, 220);
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !box.contains(e.target)) box.classList.remove("show");
  });
}

function renderFooter() {
  const col = (t, l) => `<div><h4>${t}</h4>${l.map(x => `<a href="${x[1]}">${x[0]}</a>`).join("")}</div>`;
  $("#site-footer").innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="fgrid">
        <div>
          <h4 style="font-size:1.4rem;display:flex;align-items:center;gap:4px;">E<span style="color:#FFF;">Cartline</span></h4>
          <p>Smart products. Better everyday. Your trusted online shopping destination with authentic brands and lightning-fast doorstep delivery across India.</p>
          <div class="social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X">𝕏</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
          </div>
        </div>
        ${col("About ECartline", [["About Us", "about.html"], ["Careers", "#"], ["Press Releases", "#"], ["ECartline Stories", "#"]])}
        ${col("Help & Support", [["Payments & COD", "checkout.html"], ["Shipping & Delivery", "#"], ["Return Policy", "#"], ["Contact Support", "contact.html"]])}
        ${col("Popular Categories", [["Mobiles", "products.html?category=Mobiles"], ["Electronics", "products.html?category=Electronics"], ["Fashion", "products.html?category=Fashion"], ["Home & Kitchen", "products.html?category=Home%20%26%20Kitchen"]])}
        ${col("My Account", [["Profile & Addresses", "profile.html"], ["My Orders", "orders.html"], ["Wishlist", "wishlist.html"], ["Shopping Cart", "cart.html"], ["⚡ Admin Portal", "admin.html"]])}
      </div>
      <div class="copy">
        © 2026 ECartline India Private Limited. All rights reserved. 100% Genuine Products · Secure 256-bit SSL Checkout
      </div>
    </div>
  </footer>`;
}

/* ---- Product Card (Amazon / Flipkart Inspired) ---- */
const starsOf = r => "★".repeat(Math.min(5, Math.max(0, Math.round(r)))) + "☆".repeat(5 - Math.min(5, Math.max(0, Math.round(r))));

function renderProductCard(p) {
  const w = getWishlist().includes(p.id);
  const discountBadge = p.discount ? `<span class="badge">${p.discount}</span>` : "";
  const inStockHtml = p.inStock
    ? `<span class="in-stock">✓ In stock (${p.stock})</span>`
    : '<span class="oos">Out of stock</span>';

  return `
  <article class="card" data-product-id="${p.id}">
    ${discountBadge}
    <button class="heart ${w ? "on" : ""}" data-act="wish" data-id="${p.id}" aria-label="Toggle wishlist">${w ? "♥" : "♡"}</button>
    <a class="img" href="product-details.html?id=${p.id}" aria-label="${p.name}">
      <img loading="lazy" src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
    </a>
    <div class="info">
      <span class="cat-name">${p.category}</span>
      <a class="pname" href="product-details.html?id=${p.id}" title="${p.name}">${p.name}</a>
      <div class="stars">${starsOf(p.rating)} <small>${p.rating} (${p.reviews.toLocaleString("en-IN")})</small></div>
      <div class="price">
        <b>${fmt(p.price)}</b>
        <s>${fmt(p.oldPrice)}</s>
        <em>${p.discount}</em>
      </div>
      <div class="delivery-tag">Free delivery by <b>Tomorrow</b></div>
      ${inStockHtml}
      <div class="acts">
        <button class="btn" data-act="cart" data-id="${p.id}" ${p.inStock ? "" : "disabled"} title="Add to Cart">Add to Cart</button>
        <button class="btn alt" data-act="buy" data-id="${p.id}" ${p.inStock ? "" : "disabled"} title="Buy Now">Buy Now</button>
      </div>
    </div>
  </article>`;
}

const renderProducts = (list, el) => {
  el.innerHTML = list.length ? list.map(renderProductCard).join("") : '<div class="empty">No products found matching your search and filter criteria.<br><br><button class="btn line" onclick="resetFilters()">Clear All Filters</button></div>';
};

/* ---- Search / Filter / Sort (Token-based multi-term matching) ---- */
function searchProducts(list, q) {
  q = (q || "").toLowerCase().trim();
  if (!q) return list;
  const terms = q.split(/\s+/).filter(Boolean);
  return list.filter(p => {
    const haystack = (p.name + " " + p.category + " " + (p.description || "")).toLowerCase();
    return terms.every(t => haystack.includes(t));
  });
}

function filterProducts(s) {
  let list = searchProducts(products, s.q);
  return list.filter(p => {
    if (s.category && p.category !== s.category) return false;
    if (s.minPrice !== "" && Number.isFinite(+s.minPrice) && p.price < +s.minPrice) return false;
    if (s.maxPrice !== "" && Number.isFinite(+s.maxPrice) && p.price > +s.maxPrice) return false;
    if (s.rating && p.rating < +s.rating) return false;
    if (s.discount && p.pct < +s.discount) return false;
    if (s.stock && !p.inStock) return false;
    return true;
  });
}

function sortProducts(list, k) {
  const f = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => b.id - a.id,
    discount: (a, b) => b.pct - a.pct,
    featured: (a, b) => a.id - b.id
  };
  return [...list].sort(f[k] || f.featured);
}

/* ---- Global Click Delegation ---- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const id = +b.dataset.id;
  const act = b.dataset.act;
  const prod = getProductById(id);
  const q = +($("#qty-val")?.textContent || 1);
  const qty = b.dataset.detail ? q : 1;

  if (act === "cart") {
    addToCart(id, qty);
  }
  else if (act === "buy") {
    addToCart(id, qty);
    const user = getUser();
    location.href = user ? "checkout.html" : "login.html?redirect=checkout.html";
  }
  else if (act === "inc") {
    updateQuantity(id, 1);
  }
  else if (act === "dec") {
    updateQuantity(id, -1);
  }
  else if (act === "remove") {
    removeFromCart(id);
  }
  else if (act === "wish") {
    const on = getWishlist().includes(id);
    on ? removeFromWishlist(id) : addToWishlist(id);
    $$(`[data-act="wish"][data-id="${id}"]`).forEach(h => {
      h.classList.toggle("on", !on);
      h.textContent = on ? "♡" : "♥";
    });
  }
  else if (act === "qty") {
    const s = $("#qty-val");
    if (s && prod) {
      const max = Math.min(10, prod.stock || 10);
      const cur = +s.textContent;
      const next = cur + +b.dataset.d;
      if (next >= 1 && next <= max) {
        s.textContent = next;
      } else if (next > max) {
        showToast(`Only ${max} items available in stock.`);
      }
    }
  }
});

/* ---- Home Page Sections ---- */
function initHome() {
  const slides = [
    ["NEW SEASON", "Upgrade Your Everyday Life", "Explore trending Electronics, Gadgets, Fashion & Home essentials with express delivery.", "1607082348824-0a96f2a4b9da"],
    ["FLAGSHIP MOBILES", "Top Flagships at Unbeatable Prices", "Samsung Galaxy S24 Ultra, Apple iPhone 16 Pro Max, and premium 5G devices with brand warranty.", "1610945265064-0e34e5519bbf"],
    ["TRENDING FASHION", "Fashion Fest is Now Live", "Elevate your look with comfortable everyday casuals, watches, and premium footwear.", "1441986300917-64674bd600d8"]
  ];
  const hero = $("#hero");
  if (!hero) return;

  let cur = 0, timer;
  hero.innerHTML = slides.map((s, i) => `
    <div class="slide ${i ? "" : "on"}" style="background-image:url('${u(s[3])}')">
      <div class="container">
        <small>${s[0]}</small>
        <h1>${s[1]}</h1>
        <p>${s[2]}</p>
        <a class="btn alt" href="products.html">Shop Collection →</a>
      </div>
    </div>`).join("")
    + `<button class="arrow prev" aria-label="Previous slide">←</button><button class="arrow next" aria-label="Next slide">→</button><div class="dots">${slides.map((_, i) => `<i data-i="${i}"></i>`).join("")}</div>`;

  const go = n => {
    cur = (n + slides.length) % slides.length;
    $$(".slide", hero).forEach((s, i) => s.classList.toggle("on", i === cur));
    $$(".dots i", hero).forEach((d, i) => d.classList.toggle("on", i === cur));
  };
  const start = () => timer = setInterval(() => go(cur + 1), 5000);
  go(0);
  start();

  hero.querySelector(".prev").onclick = () => { clearInterval(timer); go(cur - 1); start(); };
  hero.querySelector(".next").onclick = () => { clearInterval(timer); go(cur + 1); start(); };
  $$(".dots i", hero).forEach((d, i) => d.onclick = () => { clearInterval(timer); go(i); start(); });
  hero.onmouseenter = () => clearInterval(timer);
  hero.onmouseleave = start;

  const secs = [
    ["Today's Top Deals", sortProducts(products, "discount"), "discount"],
    ["Flagship Mobiles & Gadgets", products.filter(p => p.category === "Mobiles" || p.category === "Electronics"), "featured"],
    ["Best Sellers", [...products].sort((a, b) => b.reviews - a.reviews), "featured"],
    ["Highest Rated by Customers", sortProducts(products, "rating"), "rating"],
  ];

  $("#home-sections").innerHTML = secs.map(s => `
    <section class="container" style="margin-bottom:28px;">
      <h2 class="sec-title">${s[0]}<a href="products.html?sort=${s[2]}">View All →</a></h2>
      <div class="grid">${s[1].slice(0, 8).map(renderProductCard).join("")}</div>
    </section>`).join("");
}

function renderCategories() {
  const el = $("#cat-circles");
  if (!el) return;

  const categoryMeta = {
    "Mobiles": { img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80", deal: "From ₹6,999" },
    "Electronics": { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80", deal: "Up to 70% Off" },
    "Fashion": { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80", deal: "Min 50% Off" },
    "Footwear": { img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80", deal: "Under ₹1,999" },
    "Home & Kitchen": { img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80", deal: "From ₹399" },
    "Sports": { img: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=300&q=80", deal: "Top Brands" },
    "Beauty": { img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80", deal: "Flat 40% Off" },
    "Toys": { img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=300&q=80", deal: "Under ₹999" },
    "Furniture": { img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80", deal: "Up to 55% Off" },
    "Outdoor": { img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=300&q=80", deal: "Best Picks" },
    "Bags": { img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80", deal: "From ₹799" },
    "Accessories": { img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80", deal: "Starting ₹299" }
  };

  el.innerHTML = categories.map(c => {
    const meta = categoryMeta[c] || {};
    const match = products.find(p => p.category === c);
    const img = meta.img || (match ? match.image : FALLBACK);
    const dealTag = meta.deal || "Explore Deals";

    return `
      <a class="cat cat-slide-item" href="products.html?category=${encodeURIComponent(c)}">
        <div class="cat-slide-img-wrap">
          <img loading="lazy" src="${img}" alt="${c}" onerror="this.onerror=null;this.src=FALLBACK">
        </div>
        <span class="cat-slide-name">${c}</span>
        <span class="cat-slide-deal">${dealTag}</span>
      </a>`;
  }).join("");

  // Setup Side-to-Side Smooth Slide Navigation
  setupCategorySlider();
}

function setupCategorySlider() {
  const track = $("#cat-circles");
  const prevBtn = $("#cat-slide-prev");
  const nextBtn = $("#cat-slide-next");
  if (!track) return;

  const updateArrows = () => {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = track.scrollWidth - track.clientWidth - 6;
    const atStart = track.scrollLeft <= 6;
    const atEnd = track.scrollLeft >= maxScroll;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.classList.toggle("disabled", atStart);
    nextBtn.classList.toggle("disabled", atEnd);
  };

  if (prevBtn) {
    prevBtn.onclick = () => {
      track.scrollBy({ left: -340, behavior: "smooth" });
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      track.scrollBy({ left: 340, behavior: "smooth" });
    };
  }

  track.addEventListener("scroll", updateArrows, { passive: true });
  setTimeout(updateArrows, 150);

  // Mouse drag-to-scroll support for desktop
  let isDown = false, startX, scrollLeftVal;
  track.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeftVal = track.scrollLeft;
  });
  window.addEventListener("mouseup", () => { isDown = false; });
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeftVal - walk;
  });
}

/* ---- Products Catalog Page ---- */
let globalFilterReset = null;

function initProducts() {
  const st = {
    q: params.get("q") || "",
    category: params.get("category") || "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    discount: "",
    stock: false,
    sort: params.get("sort") || "featured",
    page: 1
  };

  const filtersEl = $("#filters");
  if (!filtersEl) return;

  function catRowHtml(c, label) {
    const isAct = (st.category === c) || (c === "" && !st.category);
    return `
      <div class="filter-cat-row ${isAct ? 'active' : ''}" data-cat="${c}" role="button" tabindex="0">
        <span class="cat-name">${label || c}</span>
        ${isAct ? '<span class="cat-check" aria-hidden="true">✓</span>' : ''}
      </div>
    `;
  }

  const radiosGroup = (name, title, opts) => `
    <div class="filter-group" data-filter-id="${name}">
      <div class="filter-head" role="button" tabindex="0">
        <span>${title}</span>
        <span class="filter-chevron">▾</span>
      </div>
      <div class="filter-body">
        ${opts.map(o => `
          <label><input type="radio" name="${name}" value="${o[0]}" ${st[name] === o[0] ? "checked" : ""}>${o[1]}</label>
        `).join("")}
      </div>
    </div>
  `;

  filtersEl.innerHTML = `
    <!-- Sidebar Top Bar with Title and Hide Button -->
    <div class="sidebar-top-bar">
      <div class="sidebar-top-title">
        <span>⚡ Categories & Filters</span>
      </div>
      <button type="button" class="sidebar-hide-btn" id="sidebar-hide-btn" title="Close" aria-label="Close sidebar">
        ✕
      </button>
    </div>

    <!-- Selected Filters Box (Sidebar) -->
    <div class="sidebar-selected-box" id="sidebar-selected-box">
      <div class="sidebar-selected-header">
        <span>Active Filters</span>
        <button type="button" class="sidebar-clear-all-link" id="sidebar-clear-all">Clear All</button>
      </div>
      <div class="sidebar-selected-chips" id="sidebar-selected-chips"></div>
    </div>

    <!-- Categories Group with Scrollable List -->
    <div class="filter-group" data-filter-id="category">
      <div class="filter-head" role="button" tabindex="0">
        <span>Categories</span>
        <span class="filter-chevron">▾</span>
      </div>
      <div class="filter-body" id="cat-filter-body">
        <div class="cat-filter-list" id="cat-filter-list" role="listbox" aria-label="Product categories">
          ${catRowHtml("", "All Categories")}
          ${categories.map(c => catRowHtml(c)).join("")}
        </div>
      </div>
    </div>

    <!-- Price Range Group -->
    <div class="filter-group" data-filter-id="price">
      <div class="filter-head" role="button" tabindex="0">
        <span>Price Range</span>
        <span class="filter-chevron">▾</span>
      </div>
      <div class="filter-body">
        <label><input type="radio" name="price_preset" value="" ${!st.minPrice && !st.maxPrice ? "checked" : ""}>Any Price</label>
        <label><input type="radio" name="price_preset" value="0-999">Under ₹1,000</label>
        <label><input type="radio" name="price_preset" value="1000-5000">₹1,000 - ₹5,000</label>
        <label><input type="radio" name="price_preset" value="5000-20000">₹5,000 - ₹20,000</label>
        <label><input type="radio" name="price_preset" value="20000-60000">₹20,000 - ₹60,000</label>
        <label><input type="radio" name="price_preset" value="60000-99999999">Above ₹60,000</label>
        
        <div class="price-range-inputs">
          <input type="number" id="min-price-inp" placeholder="Min ₹" min="0">
          <input type="number" id="max-price-inp" placeholder="Max ₹" min="0">
          <button type="button" id="apply-price-btn">Go</button>
        </div>
      </div>
    </div>

    <!-- Customer Rating Group -->
    ${radiosGroup("rating", "Customer Rating", [["", "Any Rating"], ["4", "4★ & above"], ["3", "3★ & above"]])}

    <!-- Discount Group -->
    ${radiosGroup("discount", "Discount", [["", "All Discounts"], ["10", "10% & more"], ["20", "20% & more"], ["30", "30% & more"], ["50", "50% & more"]])}

    <!-- Availability Group -->
    <div class="filter-group" data-filter-id="stock">
      <div class="filter-head" role="button" tabindex="0">
        <span>Availability</span>
        <span class="filter-chevron">▾</span>
      </div>
      <div class="filter-body">
        <label><input type="checkbox" id="stock" ${st.stock ? "checked" : ""}>In stock only</label>
      </div>
    </div>

    <button class="btn line" id="clear" style="width:100%;margin-top:16px;">Clear All Filters</button>
  `;

  // Synchronize category highlight and checkmarks
  function syncCatUi() {
    $$("#cat-filter-body .filter-cat-row").forEach(row => {
      const rowCat = row.dataset.cat;
      const isAct = (st.category === rowCat) || (rowCat === "" && !st.category);
      row.classList.toggle("active", isAct);
      let checkEl = row.querySelector(".cat-check");
      if (isAct) {
        if (!checkEl) {
          checkEl = document.createElement("span");
          checkEl.className = "cat-check";
          checkEl.setAttribute("aria-hidden", "true");
          checkEl.textContent = "✓";
          row.appendChild(checkEl);
        }
      } else {
        if (checkEl) checkEl.remove();
      }
    });
  }

  // Handle category item toggle selection
  function handleCatClick(catVal) {
    if (catVal === "") {
      st.category = "";
    } else if (st.category === catVal) {
      // Clicking the already-active category toggles it off!
      st.category = "";
    } else {
      st.category = catVal;
    }
    syncCatUi();
    st.page = 1;
    draw();
    if (typeof toggleSidebar === "function" && isMobile()) {
      toggleSidebar(false);
    }
  }

  // Accordion toggle click & keydown handlers
  filtersEl.querySelectorAll(".filter-head").forEach(h => {
    const toggleGrp = () => {
      const grp = h.closest(".filter-group");
      if (grp) grp.classList.toggle("collapsed");
    };
    h.onclick = toggleGrp;
    h.onkeydown = e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleGrp();
      }
    };
  });

  $("#sort").value = st.sort;
  const grid = $("#grid");
  const per = 12;

  // Insert Filter Chips Container right above grid
  let chipsContainer = $("#filter-chips");
  if (!chipsContainer) {
    chipsContainer = document.createElement("div");
    chipsContainer.id = "filter-chips";
    chipsContainer.className = "filter-chips";
    grid.parentNode.insertBefore(chipsContainer, grid);
  }

  function renderChips() {
    const chips = [];
    if (st.q) chips.push({ label: `Search: "${st.q}"`, clear: () => { st.q = ""; if ($("#hdr-search-input")) $("#hdr-search-input").value = ""; } });
    if (st.category) chips.push({ label: `Category: ${st.category}`, clear: () => { st.category = ""; } });
    if (st.minPrice || st.maxPrice) {
      const minText = st.minPrice ? fmt(st.minPrice) : "₹0";
      const maxText = st.maxPrice ? fmt(st.maxPrice) : "Any";
      chips.push({ label: `Price: ${minText} - ${maxText}`, clear: () => { st.minPrice = ""; st.maxPrice = ""; } });
    }
    if (st.rating) chips.push({ label: `${st.rating}★ & above`, clear: () => { st.rating = ""; } });
    if (st.discount) chips.push({ label: `${st.discount}% off or more`, clear: () => { st.discount = ""; } });
    if (st.stock) chips.push({ label: "In Stock Only", clear: () => { st.stock = false; } });

    // 1. Sidebar Selected Filters box
    const sideBox = $("#sidebar-selected-box");
    const sideChipsEl = $("#sidebar-selected-chips");
    if (sideBox && sideChipsEl) {
      if (chips.length > 0) {
        sideBox.classList.add("show");
        sideChipsEl.innerHTML = chips.map((c, i) => `
          <span class="sidebar-chip">
            ${c.label}
            <button type="button" data-chip-idx="${i}" aria-label="Remove filter">✕</button>
          </span>
        `).join("");
        sideChipsEl.querySelectorAll("[data-chip-idx]").forEach(b => {
          b.onclick = (e) => {
            e.stopPropagation();
            chips[+b.dataset.chipIdx].clear();
            syncFiltersUi();
            st.page = 1;
            draw();
          };
        });
        const sideClear = $("#sidebar-clear-all");
        if (sideClear) sideClear.onclick = resetFilters;
      } else {
        sideBox.classList.remove("show");
        sideChipsEl.innerHTML = "";
      }
    }

    // 2. Main Grid Chips
    if (!chips.length) {
      chipsContainer.innerHTML = "";
      return;
    }

    chipsContainer.innerHTML = chips.map((c, i) => `
      <span class="chip">
        ${c.label}
        <button type="button" data-chip-idx="${i}" aria-label="Remove filter">✕</button>
      </span>
    `).join("") + `<button type="button" class="btn line" style="min-height:28px;padding:2px 10px;font-size:0.78rem;" id="clear-all-chips">Clear All</button>`;

    chipsContainer.querySelectorAll("[data-chip-idx]").forEach(b => {
      b.onclick = () => {
        chips[+b.dataset.chipIdx].clear();
        syncFiltersUi();
        st.page = 1;
        draw();
      };
    });

    const clrAll = $("#clear-all-chips");
    if (clrAll) clrAll.onclick = resetFilters;
  }

  function syncFiltersUi() {
    syncCatUi();
    $$("#filters input[type='radio']").forEach(r => {
      if (r.name === "rating") r.checked = r.value === st.rating;
      if (r.name === "discount") r.checked = r.value === st.discount;
    });
    const stockChk = $("#stock");
    if (stockChk) stockChk.checked = st.stock;
    if (!st.minPrice && !st.maxPrice) {
      $$("input[name='price_preset']").forEach(r => r.checked = r.value === "");
      if ($("#min-price-inp")) $("#min-price-inp").value = "";
      if ($("#max-price-inp")) $("#max-price-inp").value = "";
    }
  }

  function draw() {
    renderChips();
    const list = sortProducts(filterProducts(st), st.sort);
    const pages = Math.max(1, Math.ceil(list.length / per));
    st.page = Math.min(st.page, pages);

    const countEl = $("#count");
    if (countEl) {
      countEl.textContent = list.length
        ? `Showing ${(st.page - 1) * per + 1}–${Math.min(st.page * per, list.length)} of ${list.length} products`
        : "No products found.";
    }

    renderProducts(list.slice((st.page - 1) * per, st.page * per), grid);

    $("#pager").innerHTML = pages < 2 ? "" : `
      <button ${st.page === 1 ? "disabled style='opacity:0.4;cursor:not-allowed'" : ""} data-p="${st.page - 1}" aria-label="Previous page">←</button>
      ${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === st.page ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`).join("")}
      <button ${st.page === pages ? "disabled style='opacity:0.4;cursor:not-allowed'" : ""} data-p="${st.page + 1}" aria-label="Next page">→</button>
    `;
  }

  function resetFilters() {
    Object.assign(st, { q: "", category: "", minPrice: "", maxPrice: "", rating: "", discount: "", stock: false, page: 1 });
    syncFiltersUi();
    if ($("#hdr-search-input")) $("#hdr-search-input").value = "";
    draw();
  }
  globalFilterReset = resetFilters;

  // Event handlers
  filtersEl.addEventListener("click", e => {
    const catRow = e.target.closest(".filter-cat-row");
    if (catRow) {
      e.preventDefault();
      handleCatClick(catRow.dataset.cat || "");
    }
  });

  filtersEl.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      const catRow = e.target.closest(".filter-cat-row");
      if (catRow) {
        e.preventDefault();
        handleCatClick(catRow.dataset.cat || "");
      }
    }
  });

  filtersEl.addEventListener("change", e => {
    const t = e.target;
    if (t.id === "stock") {
      st.stock = t.checked;
    } else if (t.name === "price_preset") {
      if (!t.value) {
        st.minPrice = "";
        st.maxPrice = "";
      } else {
        const [min, max] = t.value.split("-");
        st.minPrice = min;
        st.maxPrice = max;
      }
      if ($("#min-price-inp")) $("#min-price-inp").value = "";
      if ($("#max-price-inp")) $("#max-price-inp").value = "";
    } else if (t.name === "rating" || t.name === "discount") {
      st[t.name] = t.value;
    }
    st.page = 1;
    draw();
  });

  const applyBtn = $("#apply-price-btn");
  if (applyBtn) {
    applyBtn.onclick = () => {
      const minVal = $("#min-price-inp").value.trim();
      const maxVal = $("#max-price-inp").value.trim();
      st.minPrice = minVal ? Math.max(0, +minVal) : "";
      st.maxPrice = maxVal ? Math.max(0, +maxVal) : "";
      $$("input[name='price_preset']").forEach(r => r.checked = false);
      st.page = 1;
      draw();
    };
  }

  $("#sort").onchange = e => { st.sort = e.target.value; st.page = 1; draw(); };
  $("#pager").onclick = e => {
    const b = e.target.closest("[data-p]");
    if (b && !b.disabled) { st.page = +b.dataset.p; draw(); scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const clearBtn = $("#clear");
  if (clearBtn) clearBtn.onclick = resetFilters;

  // Slide Sidebar Toggle Logic (Desktop & Mobile)
  const shopEl = $(".shop");
  const fToggle = $(".f-toggle");
  const hideBtn = $("#sidebar-hide-btn");

  let backdrop = $("#sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);
  }

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function updateToggleButtons(hidden) {
    if (isMobile()) {
      if (fToggle) fToggle.innerHTML = hidden ? `<span style="font-size:1.15rem;line-height:1;margin-right:4px;">☰</span> <span>Filters</span>` : `✕ Close Filters`;
    } else {
      if (fToggle) {
        fToggle.innerHTML = `<span style="font-size:1.15rem;line-height:1;margin-right:4px;">☰</span> <span>Filters</span>`;
        fToggle.classList.toggle("active", !hidden);
        fToggle.setAttribute("title", hidden ? "Show sidebar filters (☰)" : "Hide sidebar filters (☰)");
      }
    }
  }

  function toggleSidebar(forceState) {
    if (isMobile()) {
      const willShow = forceState !== undefined ? forceState : !filtersEl.classList.contains("show");
      filtersEl.classList.toggle("show", willShow);
      backdrop.classList.toggle("show", willShow);
      updateToggleButtons(!willShow);
    } else {
      const willCollapse = forceState !== undefined ? forceState : !(shopEl && shopEl.classList.contains("sidebar-collapsed"));
      if (shopEl) shopEl.classList.toggle("sidebar-collapsed", willCollapse);
      filtersEl.classList.toggle("sidebar-hidden", willCollapse);
      updateToggleButtons(willCollapse);
    }
  }

  if (fToggle) {
    fToggle.onclick = () => toggleSidebar();
  }

  if (hideBtn) {
    hideBtn.onclick = () => {
      if (isMobile()) {
        toggleSidebar(false);
      } else {
        toggleSidebar(true);
      }
    };
  }

  backdrop.onclick = () => toggleSidebar(false);

  updateToggleButtons(false);

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      filtersEl.classList.remove("show");
      backdrop.classList.remove("show");
      const isCollapsed = shopEl ? shopEl.classList.contains("sidebar-collapsed") : false;
      updateToggleButtons(isCollapsed);
    } else {
      const isDrawerOpen = filtersEl.classList.contains("show");
      updateToggleButtons(!isDrawerOpen);
    }
  });

  draw();
}

/* ---- Product Details & Reviews ---- */
async function initDetails() {
  const box = $("#detail");
  if (!box) return;
  const id = params.get("id");
  let p = null;

  try {
    p = await fetchProduct(id);
  } catch (e) {
    if (e.status === 404) p = null;
    else p = getProductById(id);
  }

  if (!p) {
    box.innerHTML = '<div class="empty">Product not found. <br><br><a class="btn" href="products.html">Browse all products</a></div>';
    return;
  }

  document.title = `${p.name} | ECartline`;
  const isWish = getWishlist().includes(p.id);
  const maxStock = Math.min(10, p.stock || 10);
  const userPin = getDeliveryPincode();

  box.innerHTML = `
  <div class="detail-left">
    <div class="main-img">
      <img id="main" src="${p.images[0]}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
    </div>
    <div class="thumbs">
      ${p.images.map((s, i) => `<img src="${s}" class="${i ? "" : "on"}" alt="${p.name} view ${i + 1}" onerror="this.onerror=null;this.src=FALLBACK">`).join("")}
    </div>
  </div>

  <div class="detail-right">
    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">
      <a href="index.html">Home</a> &gt; <a href="products.html?category=${encodeURIComponent(p.category)}">${p.category}</a> &gt; <b>${p.name}</b>
    </div>
    
    <h1>${p.name}</h1>
    
    <div class="stars" style="margin-bottom:8px;">
      ${starsOf(p.rating)} 
      <small style="font-size:0.9rem;font-weight:600;">${p.rating} · ${p.reviews.toLocaleString("en-IN")} customer ratings</small>
    </div>

    <div class="big">
      ${fmt(p.price)} 
      <s>${fmt(p.oldPrice)}</s> 
      <em>${p.discount}</em>
    </div>

    <div style="font-size:0.88rem;color:var(--discount-green);font-weight:700;margin-bottom:12px;">
      You save ${fmt(p.oldPrice - p.price)} (${p.discount})
    </div>

    <p style="color:${p.inStock ? "var(--primary)" : "#DC2626"};font-weight:700;display:flex;align-items:center;gap:6px;">
      ${p.inStock ? `✓ In Stock (${p.stock} available)` : "✖ Temporarily Out of Stock"}
    </p>

    <!-- Flipkart / Amazon style Bank Offers Box -->
    <div class="offers-card">
      <h4>⚡ Available Offers & Deals</h4>
      <ul>
        <li><b>Bank Offer:</b> 5% Unlimited Cashback on Axis Bank Credit Cards.</li>
        <li><b>Special Price:</b> Extra ₹1,000 instant discount on orders above ₹15,000.</li>
        <li><b>No Cost EMI:</b> Avail No Cost EMI on select credit cards.</li>
        <li><b>Partner Offer:</b> Free 12-month extended brand warranty registration.</li>
      </ul>
    </div>

    <!-- Pincode Delivery Availability Checker -->
    <div class="pincode-box">
      <span>📍 Delivery to:</span>
      <input type="text" id="detail-pin-input" value="${userPin}" maxlength="6" inputmode="numeric">
      <button class="btn line" type="button" id="check-pin-btn" style="min-height:36px;padding:0 14px;">Check</button>
      <span id="pin-status" style="font-size:0.85rem;color:var(--primary);font-weight:700;">✓ Free Delivery by Tomorrow</span>
    </div>

    <p style="margin:16px 0;line-height:1.7;color:var(--text-body);font-size:0.98rem;">${p.description}</p>

    <!-- Quantity Selector -->
    <div style="display:flex;align-items:center;gap:12px;margin:16px 0;">
      <span style="font-weight:700;font-size:0.92rem;">Quantity:</span>
      <div class="qty">
        <button data-act="qty" data-d="-1" data-id="${p.id}" aria-label="Decrease quantity" ${p.inStock ? "" : "disabled"}>−</button>
        <span id="qty-val">1</span>
        <button data-act="qty" data-d="1" data-id="${p.id}" aria-label="Increase quantity" ${p.inStock ? "" : "disabled"}>+</button>
      </div>
      <small style="color:var(--text-muted);">(Max ${maxStock} per order)</small>
    </div>

    <!-- Action Buttons -->
    <div class="row-btns">
      <button class="btn" data-act="cart" data-detail="1" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>
        🛒 Add to Cart
      </button>
      <button class="btn alt" data-act="buy" data-detail="1" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>
        ⚡ Buy Now
      </button>
      <button class="btn line heart-btn" data-act="wish" data-id="${p.id}">
        ${isWish ? "♥ In Wishlist" : "♡ Add to Wishlist"}
      </button>
    </div>

    <div class="box">
      🚚 <b>Doorstep Delivery:</b> Free express delivery on orders over ₹499.<br>
      ↩️ <b>Return Policy:</b> 7-day hassle-free replacement or return.<br>
      🛡️ <b>Warranty:</b> 100% Original Brand Guarantee with manufacturer warranty.
    </div>

    <h3 style="margin-top:24px;">Product Specifications</h3>
    <table class="spec">
      <tr><td>Product Name</td><td>${p.name}</td></tr>
      <tr><td>Brand / Manufacturer</td><td>${p.name.split(" ")[0]}</td></tr>
      <tr><td>Category</td><td>${p.category}</td></tr>
      <tr><td>Availability</td><td>${p.inStock ? "In Stock (" + p.stock + " units)" : "Out of Stock"}</td></tr>
      <tr><td>Warranty Period</td><td>1 Year Official Brand Warranty</td></tr>
      <tr><td>Payment Modes</td><td>Cash on Delivery (COD), UPI, Credit & Debit Cards</td></tr>
    </table>
  </div>`;

  // Pincode checker button
  const pinInput = $("#detail-pin-input");
  const pinStatus = $("#pin-status");
  const checkPinBtn = $("#check-pin-btn");
  if (checkPinBtn) {
    checkPinBtn.onclick = () => {
      const val = pinInput.value.trim();
      if (/^\d{6}$/.test(val)) {
        setDeliveryPincode(val);
        pinStatus.textContent = `✓ Free Delivery to ${val} by Tomorrow`;
        pinStatus.style.color = "var(--primary)";
      } else {
        pinStatus.textContent = "Please enter a valid 6-digit postal pincode.";
        pinStatus.style.color = "#DC2626";
      }
    };
  }

  // Thumbnail clicks
  $$(".thumbs img").forEach(t => t.onclick = () => {
    $("#main").src = t.src;
    $$(".thumbs img").forEach(x => x.classList.remove("on"));
    t.classList.add("on");
  });

  // Render Reviews Section
  loadAndRenderReviews(p.id);
}

async function loadAndRenderReviews(productId) {
  let reviewsContainer = $("#reviews-section");
  if (!reviewsContainer) {
    reviewsContainer = document.createElement("section");
    reviewsContainer.id = "reviews-section";
    reviewsContainer.className = "reviews-section";
    $("#detail").parentNode.appendChild(reviewsContainer);
  }

  const user = getUser();

  try {
    const res = await fetchReviews(productId);
    const revs = res.data || [];
    const avg = res.averageRating || 0;
    const count = res.count || 0;

    reviewsContainer.innerHTML = `
      <div class="sec-title" style="margin-top:40px;">
        <h2>Customer Ratings & Reviews (${count})</h2>
      </div>

      <div class="rev-summary-box">
        <div class="rev-big-score">
          <span class="score-num">${avg}</span>
          <span class="score-stars">${starsOf(avg)}</span>
          <small>${count} verified rating${count === 1 ? "" : "s"}</small>
        </div>
        <div class="rev-form-container">
          ${user ? `
            <h3 style="font-size:1.1rem;font-weight:700;">Rate & Review this Product</h3>
            <form id="write-review-form" class="rev-form">
              <div class="star-rating-select">
                <span>Your Rating:</span>
                <div class="star-picker" id="star-picker">
                  ${[1, 2, 3, 4, 5].map(n => `<span class="star-pick" data-val="${n}">★</span>`).join("")}
                </div>
                <input type="hidden" id="rev-rating" value="5">
              </div>
              <textarea id="rev-comment" placeholder="What did you like or dislike about this product? Share your experience with other shoppers." rows="3" required></textarea>
              <button class="btn" type="submit" style="min-height:38px;padding:0 20px;align-self:flex-start;">Submit Review</button>
            </form>
          ` : `
            <div style="background:#FFFFFF;border:1px solid var(--border);border-radius:var(--r-md);padding:18px;text-align:center;">
              <p style="color:var(--text-muted);margin-bottom:10px;">Have you purchased or used this item? Share your review with fellow shoppers.</p>
              <a class="btn line" href="login.html?redirect=product-details.html?id=${productId}">Sign In to Write a Review</a>
            </div>
          `}
        </div>
      </div>

      <div class="reviews-list">
        ${revs.length ? revs.map(r => `
          <div class="review-card">
            <div class="rev-hdr">
              <span class="rev-user">👤 ${r.user_name || "Verified Buyer"} <span class="badge" style="position:static;font-size:0.7rem;padding:2px 7px;">VERIFIED PURCHASE</span></span>
              <span class="rev-stars">${starsOf(r.rating)}</span>
              <span class="rev-date">${new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <p class="rev-text">${r.comment || "Great product, works exactly as described."}</p>
          </div>
        `).join("") : `<div class="empty" style="padding:30px;">Be the first customer to review this product!</div>`}
      </div>`;

    if (user) {
      // Star picker interactive logic
      const picker = $("#star-picker");
      const ratingInput = $("#rev-rating");
      if (picker && ratingInput) {
        const updateStars = val => {
          ratingInput.value = val;
          picker.querySelectorAll(".star-pick").forEach(s => {
            s.classList.toggle("active", +s.dataset.val <= val);
          });
        };
        updateStars(5);

        picker.querySelectorAll(".star-pick").forEach(s => {
          s.onclick = () => updateStars(+s.dataset.val);
        });
      }

      // Submit Review Form
      const revForm = $("#write-review-form");
      if (revForm) {
        revForm.onsubmit = async (e) => {
          e.preventDefault();
          const rating = +$("#rev-rating").value;
          const comment = $("#rev-comment").value.trim();
          try {
            await submitReview(productId, { rating, comment });
            showToast("✓ Thank you! Your review has been saved.");
            loadAndRenderReviews(productId);
          } catch (err) {
            showToast(err.message || "Failed to submit review");
          }
        };
      }
    }
  } catch (err) {
    reviewsContainer.innerHTML = `<p style="color:var(--text-muted);">Reviews currently unavailable.</p>`;
  }
}

/* ---- Wishlist Page ---- */
async function renderWishlist() {
  const box = $("#wish-grid");
  if (!box) return;

  let items = [];
  if (getToken()) {
    try {
      const res = await fetchWishlistApi();
      items = res.data || [];
      saveWishlist(items.map(p => p.id));
    } catch (e) {
      items = getWishlist().map(getProductById).filter(Boolean);
    }
  } else {
    items = getWishlist().map(getProductById).filter(Boolean);
  }

  if (!items.length) {
    box.innerHTML = `<div class="empty">♡ Your wishlist is currently empty.<br><br><a class="btn" href="products.html">Explore Products</a></div>`;
    return;
  }

  box.innerHTML = items.map(p => `
    <article class="card">
      <span class="badge">${p.discount}</span>
      <button class="heart on" data-act="wish" data-id="${p.id}" aria-label="Remove from wishlist">♥</button>
      <a class="img" href="product-details.html?id=${p.id}">
        <img loading="lazy" src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
      </a>
      <div class="info">
        <span class="cat-name">${p.category}</span>
        <a class="pname" href="product-details.html?id=${p.id}">${p.name}</a>
        <div class="stars">${starsOf(p.rating)} <small>${p.rating}</small></div>
        <div class="price"><b>${fmt(p.price)}</b><s>${fmt(p.oldPrice)}</s><em>${p.discount}</em></div>
        <div class="acts">
          <button class="btn" data-act="cart" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Add to Cart</button>
          <button class="btn line" onclick="removeFromWishlist(${p.id})">Remove</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ---- Init Application ---- */
document.addEventListener("DOMContentLoaded", async () => {
  await productsReady;
  renderHeader();
  renderFooter();
  updateCartCount();
  renderCategories();

  if ($("#hero")) initHome();
  if ($("#grid")) initProducts();
  if ($("#detail")) initDetails();
  if ($("#cart-root")) renderCart();
  if ($("#wish-grid")) renderWishlist();

  // Load server-persisted user cart & wishlist
  loadServerCart();
  loadServerWishlist();
});
