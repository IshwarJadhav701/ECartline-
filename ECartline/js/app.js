/* ===== ECartline main app: shared UI, rendering, pages ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
const FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23e8f3ec'/><text x='200' y='225' font-size='80' text-anchor='middle'>🛍️</text></svg>";
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
  t.textContent = msg;
  b.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ---- Header & Navigation ---- */
const navLinks = ["All", "Electronics", "Mobiles", "Fashion", "Footwear", "Home & Kitchen", "Sports", "Beauty", "Toys", "Furniture", "Bags", "Accessories"];

function renderHeader() {
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  const userFirst = user ? user.name.split(" ")[0] : "Sign in";

  $("#site-header").innerHTML = `
  <div class="sale-bar">
    🌿 Summer Super Sale: Up to 50% Off on Top Electronics, Mobiles & Fashion!
    <a href="products.html">Shop Deals</a>
  </div>
  <header class="site-header">
    <div class="container hdr">
      <button class="burger" aria-label="Open menu">☰</button>
      <a class="logo" href="index.html" aria-label="ECartline home">E<span>Cartline</span></a>
      <div class="loc">📍 Deliver to<b>India</b></div>

      <div class="search-container">
        <form class="search" action="products.html" role="search" autocomplete="off">
          <select name="category" aria-label="Category">
            <option value="">All</option>
            ${categories.map(c => `<option ${params.get("category") === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
          <input id="hdr-search-input" name="q" type="search" placeholder="Search ECartline for mobiles, gadgets, fashion..." aria-label="Search products" value="${params.get("q") || ""}">
          <button type="submit" aria-label="Search">🔍</button>
        </form>
        <div id="search-suggestions" class="search-suggestions"></div>
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
            <a href="orders.html">Track Existing Orders</a>
            <a href="wishlist.html">Saved Wishlist</a>
          `}
        </div>
      </div>

      <a class="hl" href="${user ? "orders.html" : "login.html?redirect=orders.html"}">
        <small>Returns</small>
        <span>& Orders</span>
      </a>

      <a class="cart-link" href="cart.html" aria-label="Cart">
        🛒<span id="cart-count">0</span>
        <b>Cart</b>
      </a>
    </div>

    <nav class="subnav" aria-label="Main">
      <div class="container">
        ${navLinks.map(c => `<a href="${c === "All" ? "products.html" : "products.html?category=" + encodeURIComponent(c)}">${c}</a>`).join("")}
        <a href="products.html?sort=discount" style="color:var(--accent);font-weight:700;">Today's Deals</a>
        <a href="products.html?sort=newest">New Releases</a>
        <a href="contact.html">Customer Support</a>
        ${isAdmin ? `<a href="admin.html" style="margin-left:auto;background:rgba(255,255,255,0.18);font-weight:700;">⚡ Admin Portal</a>` : ""}
      </div>
    </nav>
  </header>
  <div class="overlay"></div>`;

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
        // Fallback to client filtering
        const local = products.filter(p => (p.name + " " + p.category).toLowerCase().includes(q.toLowerCase())).slice(0, 5);
        if (local.length) {
          box.innerHTML = local.map(p => `
            <a class="sugg-item" href="product-details.html?id=${p.id}">
              <img src="${p.image}" alt="${p.name}">
              <div class="sugg-info"><span class="sugg-name">${p.name}</span></div>
              <span class="sugg-price">${fmt(p.price)}</span>
            </a>
          `).join("");
          box.classList.add("show");
        }
      }
    }, 240);
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
          <h4 style="font-size:1.4rem">E<span>Cartline</span></h4>
          <p>Smart products. Better everyday. Your trusted online shopping destination with authentic brands and lightning-fast delivery.</p>
          <div class="social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X">𝕏</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
          </div>
        </div>
        ${col("Get to Know Us", [["About Us", "about.html"], ["Careers", "about.html"], ["Contact Us", "contact.html"]])}
        ${col("Customer Service", [["My Orders", "orders.html"], ["Shipping Rates", "about.html"], ["Returns & Replacements", "about.html"], ["Help Center", "contact.html"]])}
        ${col("My Account", [["Profile", "profile.html"], ["Wishlist", "wishlist.html"], ["Shopping Cart", "cart.html"], ["Login / Register", "login.html"]])}
        ${col("Policies", [["Privacy Notice", "about.html"], ["Conditions of Use", "about.html"], ["Security", "about.html"]])}
      </div>
      <div class="copy">
        <p>© 2026 ECartline India Private Limited. All rights reserved.</p>
        <p style="margin-top:6px;font-size:0.8rem;color:#888;">Designed with clean modern aesthetics and full-stack MySQL integration.</p>
      </div>
    </div>
  </footer>
  <button id="top-btn" aria-label="Scroll to top">↑</button>`;

  const t = $("#top-btn");
  if (t) {
    t.onclick = () => scrollTo({ top: 0 });
    addEventListener("scroll", () => t.classList.toggle("show", scrollY > 400));
  }
}

/* ---- Product Card ---- */
const starsOf = r => "★".repeat(Math.min(5, Math.max(0, Math.round(r)))) + "☆".repeat(5 - Math.min(5, Math.max(0, Math.round(r))));

function renderProductCard(p) {
  const w = getWishlist().includes(p.id);
  return `
  <article class="card">
    <span class="badge">${p.discount}</span>
    <button class="heart ${w ? "on" : ""}" data-act="wish" data-id="${p.id}" aria-label="Toggle wishlist">${w ? "♥" : "♡"}</button>
    <a class="img" href="product-details.html?id=${p.id}">
      <img loading="lazy" src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
    </a>
    <div class="info">
      <span class="cat-name">${p.category}</span>
      <a class="pname" href="product-details.html?id=${p.id}">${p.name}</a>
      <div class="stars">${starsOf(p.rating)} <small>${p.rating} (${p.reviews.toLocaleString("en-IN")} reviews)</small></div>
      <div class="price">
        <b>${fmt(p.price)}</b>
        <s>${fmt(p.oldPrice)}</s>
        <em>${p.discount}</em>
      </div>
      ${p.inStock ? `<span class="in-stock">In stock (${p.stock})</span>` : '<span class="oos">Out of stock</span>'}
      <div class="acts">
        <button class="btn" data-act="cart" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Add to Cart</button>
        <button class="btn alt" data-act="buy" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Buy Now</button>
      </div>
    </div>
  </article>`;
}

const renderProducts = (list, el) => {
  el.innerHTML = list.length ? list.map(renderProductCard).join("") : '<div class="empty">No products found matching your criteria.</div>';
};

/* ---- Search / Filter / Sort ---- */
function searchProducts(list, q) {
  q = (q || "").toLowerCase().trim();
  return q ? list.filter(p => (p.name + " " + p.category + " " + p.description).toLowerCase().includes(q)) : list;
}

function filterProducts(s) {
  let list = searchProducts(products, s.q);
  return list.filter(p => {
    if (s.category && p.category !== s.category) return false;
    if (s.price) {
      const [a, b] = s.price.split("-").map(Number);
      if (p.price < a || p.price > b) return false;
    }
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
  const q = +($("#qty-val")?.textContent || 1);
  const qty = b.dataset.detail ? q : 1;

  if (act === "cart") addToCart(id, qty);
  else if (act === "buy") {
    addToCart(id, qty);
    const user = getUser();
    location.href = user ? "checkout.html" : "login.html?redirect=checkout.html";
  }
  else if (act === "inc") updateQuantity(id, 1);
  else if (act === "dec") updateQuantity(id, -1);
  else if (act === "remove") removeFromCart(id);
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
    if (s) s.textContent = Math.max(1, Math.min(10, +s.textContent + +b.dataset.d));
  }
});

/* ---- Home Page ---- */
function initHome() {
  const slides = [
    ["NEW SEASON", "Upgrade Your Everyday Life", "Explore trending Electronics, Gadgets, Fashion & Home essentials.", "1607082348824-0a96f2a4b9da"],
    ["SMART GADGETS", "Top Tech at Unbeatable Prices", "Smartwatches, headphones, laptops, and 5G smartphones with verified warranties.", "1498049794561-7780e7231661"],
    ["TRENDING FASHION", "Fashion Fest is Now Live", "Elevate your look with comfortable everyday casuals, watches, and footwear.", "1441986300917-64674bd600d8"]
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

  $(".prev", hero).onclick = () => go(cur - 1);
  $(".next", hero).onclick = () => go(cur + 1);
  $$(".dots i", hero).forEach(d => d.onclick = () => go(+d.dataset.i));
  hero.onmouseenter = () => clearInterval(timer);
  hero.onmouseleave = start;

  const secs = [
    ["Today's Top Deals", sortProducts(products, "discount"), "discount"],
    ["Best Sellers", [...products].sort((a, b) => b.reviews - a.reviews), "featured"],
    ["Trending Tech & Gadgets", products.filter(p => p.category === "Electronics" || p.category === "Mobiles"), "featured"],
    ["Highest Rated by Customers", sortProducts(products, "rating"), "rating"],
  ];

  $("#home-sections").innerHTML = secs.map(s => `
    <section class="container">
      <h2 class="sec-title">${s[0]}<a href="products.html?sort=${s[2]}">View All →</a></h2>
      <div class="grid">${s[1].slice(0, 8).map(renderProductCard).join("")}</div>
    </section>`).join("");
}

function renderCategories() {
  const el = $("#cat-circles");
  if (el) {
    el.innerHTML = categories.map(c => `
      <a class="cat" href="products.html?category=${encodeURIComponent(c)}">
        <img loading="lazy" src="${u(imagePool[c][0])}" alt="${c}" onerror="this.onerror=null;this.src=FALLBACK">
        ${c}
      </a>`).join("");
  }
}

/* ---- Products Page ---- */
function initProducts() {
  const st = {
    q: params.get("q") || "",
    category: params.get("category") || "",
    price: "",
    rating: "",
    discount: "",
    stock: false,
    sort: params.get("sort") || "featured",
    page: 1
  };

  const radios = (name, title, opts) => `
    <h3>${title}</h3>${opts.map(o => `
      <label><input type="radio" name="${name}" value="${o[0]}" ${st[name] === o[0] ? "checked" : ""}>${o[1]}</label>
    `).join("")}`;

  $("#filters").innerHTML = radios("category", "Categories", [["", "All Categories"], ...categories.map(c => [c, c])])
    + radios("price", "Price Range", [["", "Any Price"], ["0-999", "Under ₹1,000"], ["1000-5000", "₹1,000 - ₹5,000"], ["5001-10000", "₹5,000 - ₹10,000"], ["10001-99999999", "Above ₹10,000"]])
    + radios("rating", "Customer Rating", [["", "Any Rating"], ["4", "4★ & above"], ["3", "3★ & above"]])
    + radios("discount", "Discount", [["", "All Discounts"], ["10", "10% & more"], ["20", "20% & more"], ["30", "30% & more"], ["50", "50% & more"]])
    + `<h3>Availability</h3>
       <label><input type="checkbox" id="stock">In stock only</label>
       <button class="btn line" id="clear" style="width:100%;margin-top:14px">Clear All Filters</button>`;

  $("#sort").value = st.sort;
  const grid = $("#grid"), per = 12;

  function draw() {
    const list = sortProducts(filterProducts(st), st.sort);
    const pages = Math.max(1, Math.ceil(list.length / per));
    st.page = Math.min(st.page, pages);
    $("#count").textContent = list.length ? `${list.length} products found` : "No products found.";
    renderProducts(list.slice((st.page - 1) * per, st.page * per), grid);
    $("#pager").innerHTML = pages < 2 ? "" : Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === st.page ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`).join("") + (st.page < pages ? `<button data-p="${st.page + 1}" aria-label="Next page">→</button>` : "");
  }

  const load = () => { grid.innerHTML = '<div class="skel"></div>'.repeat(8); setTimeout(draw, 250); };

  $("#filters").addEventListener("change", e => {
    const t = e.target;
    if (t.id === "stock") st.stock = t.checked;
    else st[t.name] = t.value;
    st.page = 1;
    draw();
  });

  $("#sort").onchange = e => { st.sort = e.target.value; st.page = 1; draw(); };
  $("#pager").onclick = e => {
    const b = e.target.closest("[data-p]");
    if (b) { st.page = +b.dataset.p; draw(); scrollTo({ top: 0, behavior: "smooth" }); }
  };
  $("#clear").onclick = () => {
    Object.assign(st, { q: "", category: "", price: "", rating: "", discount: "", stock: false, page: 1 });
    $$("#filters input").forEach(i => i.checked = i.type === "radio" ? i.value === "" : false);
    if ($("#hdr-search-input")) $("#hdr-search-input").value = "";
    draw();
  };
  $(".f-toggle").onclick = () => $("#filters").classList.toggle("show");
  load();
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

  box.innerHTML = `
  <div>
    <div class="main-img">
      <img id="main" src="${p.images[0]}" alt="${p.name}" onerror="this.onerror=null;this.src=FALLBACK">
    </div>
    <div class="thumbs">
      ${p.images.map((s, i) => `<img src="${s}" class="${i ? "" : "on"}" alt="${p.name} view ${i + 1}" onerror="this.onerror=null;this.src=FALLBACK">`).join("")}
    </div>
  </div>

  <div>
    <span class="cat-name">${p.category}</span>
    <h1>${p.name}</h1>
    <div class="stars">${starsOf(p.rating)} <small>${p.rating} · ${p.reviews.toLocaleString("en-IN")} ratings</small></div>
    <div class="big">${fmt(p.price)} <s style="font-size:1rem;color:var(--muted)">${fmt(p.oldPrice)}</s> <em style="font-size:1.1rem;color:var(--primary);font-weight:700;">${p.discount}</em></div>
    <p style="color:${p.inStock ? "var(--primary)" : "#c00"};font-weight:700">
      ${p.inStock ? `✓ In Stock (${p.stock} available)` : "Out of Stock"}
    </p>
    <p style="margin:12px 0;line-height:1.6;">${p.description}</p>
    <ul>
      <li>100% genuine product with official manufacturer warranty</li>
      <li>Cash on Delivery / UPI / Card payment available</li>
      <li>Rigorous 7-point quality inspection before shipping</li>
      <li>Free doorstep replacement within 7 days</li>
    </ul>

    <div class="qty" style="margin-top:16px;">
      <button data-act="qty" data-d="-1" aria-label="Decrease">−</button>
      <span id="qty-val">1</span>
      <button data-act="qty" data-d="1" aria-label="Increase">+</button>
    </div>

    <div class="row-btns">
      <button class="btn" data-act="cart" data-detail="1" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Add to Cart</button>
      <button class="btn alt" data-act="buy" data-detail="1" data-id="${p.id}" ${p.inStock ? "" : "disabled"}>Buy Now</button>
      <button class="btn line heart-btn" data-act="wish" data-id="${p.id}">
        ${isWish ? "♥ In Wishlist" : "♡ Add to Wishlist"}
      </button>
    </div>

    <div class="box">
      🚚 <b>Delivery:</b> Free express delivery on orders over ₹499.<br>
      ↩️ <b>Returns:</b> 7-day hassle-free return or exchange.
    </div>

    <h3>Specifications</h3>
    <table class="spec">
      <tr><td>Brand</td><td>${p.name.split(" ")[0]}</td></tr>
      <tr><td>Category</td><td>${p.category}</td></tr>
      <tr><td>Warranty</td><td>1 Year Brand Warranty</td></tr>
      <tr><td>Stock Status</td><td>${p.inStock ? "In Stock" : "Temporarily Sold Out"}</td></tr>
      <tr><td>Payment Modes</td><td>Cash on Delivery, UPI, Debit / Credit Cards</td></tr>
    </table>
  </div>`;

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
            <h3>Write a Review</h3>
            <form id="write-review-form" class="rev-form">
              <div class="star-rating-select">
                <span>Your Rating:</span>
                <div class="star-picker" id="star-picker">
                  ${[1, 2, 3, 4, 5].map(n => `<span class="star-pick" data-val="${n}">★</span>`).join("")}
                </div>
                <input type="hidden" id="rev-rating" value="5">
              </div>
              <textarea id="rev-comment" placeholder="What did you like or dislike about this product?" rows="3" required></textarea>
              <button class="btn" type="submit" style="min-height:38px;padding:0 18px;align-self:flex-start;">Submit Review</button>
            </form>
          ` : `
            <div class="rev-login-cta">
              <p>Have you purchased or used this product?</p>
              <a class="btn line" href="login.html?redirect=${encodeURIComponent(location.href)}">Sign in to leave a review</a>
            </div>
          `}
        </div>
      </div>

      <div class="reviews-list">
        ${revs.length ? revs.map(r => `
          <div class="review-card">
            <div class="rev-hdr">
              <span class="rev-user">👤 ${r.user_name || "Customer"}</span>
              <span class="rev-stars">${starsOf(r.rating)}</span>
              <span class="rev-date">${new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <p class="rev-text">${r.comment || "Rated " + r.rating + " stars"}</p>
          </div>
        `).join("") : `<div style="color:var(--muted);padding:20px 0;">No written reviews yet. Be the first to review this product!</div>`}
      </div>
    `;

    // Interactive Star Picker
    const starPicker = $("#star-picker");
    if (starPicker) {
      const stars = $$(".star-pick", starPicker);
      const ratingInput = $("#rev-rating");
      const highlight = (val) => {
        stars.forEach((s, idx) => s.classList.toggle("active", idx < val));
      };
      highlight(5);
      stars.forEach(s => {
        s.onmouseenter = () => highlight(+s.dataset.val);
        s.onclick = () => {
          ratingInput.value = s.dataset.val;
          highlight(+s.dataset.val);
        };
      });
      starPicker.onmouseleave = () => highlight(+ratingInput.value);

      // Submit Review Form
      const revForm = $("#write-review-form");
      if (revForm) {
        revForm.onsubmit = async (e) => {
          e.preventDefault();
          const rating = +ratingInput.value;
          const comment = $("#rev-comment").value.trim();
          try {
            await submitReview(productId, { rating, comment });
            showToast("✓ Thank you! Review saved.");
            loadAndRenderReviews(productId);
          } catch (err) {
            showToast(err.message || "Failed to submit review");
          }
        };
      }
    }
  } catch (err) {
    reviewsContainer.innerHTML = `<p style="color:var(--muted);">Reviews currently unavailable.</p>`;
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
    box.innerHTML = `<div class="empty">♡ Your wishlist is empty.<br><br><a class="btn" href="products.html">Explore Products</a></div>`;
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
        <div class="price"><b>${fmt(p.price)}</b><s>${fmt(p.oldPrice)}</s></div>
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
