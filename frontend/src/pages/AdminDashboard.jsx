import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  loginApi,
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminStats,
  fetchContactMessages,
} from "../services/api";
import { fallbackProducts, fmt, FALLBACK_IMAGE } from "../services/productsData";

const PRESET_IMAGES = {
  mobile: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=70",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=70",
  headphone: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=70",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=70",
  watch: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=70",
};

const CATEGORIES = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Footwear",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Toys",
  "Furniture",
  "Outdoor",
  "Bags",
  "Accessories",
];

export default function AdminDashboard() {
  const { user, loginUser, logoutUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Navigation tab: 'products', 'add-product', 'orders', 'messages'
  const [activeTab, setActiveTab] = useState("products");

  // Login form state for denied view
  const [loginEmail, setLoginEmail] = useState("admin@ecartline.in");
  const [loginPass, setLoginPass] = useState("Admin@12345");
  const [loggingIn, setLoggingIn] = useState(false);

  // Overview stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    outOfStockCount: 0,
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCatFilter, setProdCatFilter] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Add Product form state
  const [addForm, setAddForm] = useState({
    name: "",
    category: "",
    price: "",
    oldPrice: "",
    stock: 25,
    image: "",
    description: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Description Viewer Modal state
  const [descModal, setDescModal] = useState({ open: false, title: "", content: "" });

  // Load all initial data once admin is verified
  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadProducts();
      loadOrders();
      loadMessages();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      if (data) {
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0,
          totalCustomers: data.totalCustomers || 0,
          outOfStockCount: data.outOfStockCount || 0,
        });
      }
    } catch {
      // Fallback stats
      setStats({
        totalRevenue: 84590,
        totalOrders: 12,
        totalProducts: products.length || fallbackProducts.length,
        totalCustomers: 28,
        outOfStockCount: 0,
      });
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let list = [];
      try {
        list = await fetchProductsApi();
      } catch {
        list = [...fallbackProducts];
      }

      // Apply persistent localStorage overrides
      try {
        const overrides = JSON.parse(localStorage.getItem("ec_product_overrides") || "{}");
        list = list.map((p) => {
          if (overrides[p.id]) {
            return { ...p, ...overrides[p.id] };
          }
          return p;
        });
      } catch {}

      // Merge local custom products
      try {
        const custom = JSON.parse(localStorage.getItem("ec_custom_products") || "[]");
        if (custom && custom.length) {
          custom.forEach((cp) => {
            const existingIdx = list.findIndex((p) => String(p.id) === String(cp.id));
            if (existingIdx > -1) {
              list[existingIdx] = { ...list[existingIdx], ...cp };
            } else {
              list.unshift(cp);
            }
          });
        }
      } catch {}

      setProducts(list);
    } catch (err) {
      showToast(err.message || "Failed to load products", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const list = await fetchAdminOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const list = await fetchContactMessages();
      setMessages(Array.isArray(list) ? list : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 1-Click Direct Admin Login
  const handleDirectAdminLogin = async () => {
    setLoggingIn(true);
    try {
      const res = await loginApi({ id: "admin@ecartline.in", password: "Admin@12345" });
      loginUser(res.token, res.user);
      showToast("✓ Welcome Administrator!", "success");
    } catch {
      // Offline fallback
      loginUser("mock-admin-token-" + Date.now(), {
        id: 1,
        name: "ECartline Admin",
        email: "admin@ecartline.in",
        role: "admin",
      });
      showToast("✓ Direct Admin Access granted", "success");
    } finally {
      setLoggingIn(false);
    }
  };

  // Manual Login Form
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await loginApi({ id: loginEmail.trim(), password: loginPass });
      if (res.user && res.user.role === "admin") {
        loginUser(res.token, res.user);
        showToast("✓ Welcome, " + res.user.name, "success");
      } else {
        showToast("Account signed in is not an Administrator.", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to log in", "error");
    } finally {
      setLoggingIn(false);
    }
  };

  // Add Product Form
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    const payload = {
      name: addForm.name.trim(),
      category: addForm.category,
      price: Number(addForm.price),
      oldPrice: addForm.oldPrice ? Number(addForm.oldPrice) : null,
      stock: Number(addForm.stock || 25),
      image: addForm.image.trim() || PRESET_IMAGES.mobile,
      description: addForm.description.trim(),
    };

    try {
      let created = null;
      try {
        created = await createProductApi(payload);
      } catch {
        created = {
          id: Date.now(),
          ...payload,
          rating: 4.5,
          reviews: 1,
          inStock: payload.stock > 0,
        };
        const custom = JSON.parse(localStorage.getItem("ec_custom_products") || "[]");
        custom.unshift(created);
        localStorage.setItem("ec_custom_products", JSON.stringify(custom));
      }

      showToast("✓ Product added successfully with description!", "success");
      setAddForm({
        name: "",
        category: "",
        price: "",
        oldPrice: "",
        stock: 25,
        image: "",
        description: "",
      });
      await loadProducts();
      loadStats();
      setActiveTab("products");
    } catch (err) {
      showToast(err.message || "Failed to add product", "error");
    } finally {
      setAddingProduct(false);
    }
  };

  // Edit Product Modal Handlers
  const openEditModal = (p) => {
    setEditProduct({
      id: p.id,
      name: p.name,
      category: p.category,
      stock: p.stock != null ? p.stock : 10,
      price: p.price,
      oldPrice: p.oldPrice || "",
      image: p.image,
      description: p.description || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    setSavingEdit(true);

    const payload = {
      name: editProduct.name.trim(),
      category: editProduct.category,
      stock: Number(editProduct.stock),
      price: Number(editProduct.price),
      oldPrice: editProduct.oldPrice ? Number(editProduct.oldPrice) : null,
      image: editProduct.image.trim(),
      description: editProduct.description.trim(),
    };

    try {
      // 1. Immediately persist in local overrides
      try {
        const overrides = JSON.parse(localStorage.getItem("ec_product_overrides") || "{}");
        overrides[editProduct.id] = { ...(overrides[editProduct.id] || {}), ...payload, id: editProduct.id };
        localStorage.setItem("ec_product_overrides", JSON.stringify(overrides));
      } catch {}

      // 2. Local state update
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(editProduct.id) ? { ...p, ...payload } : p))
      );

      // 3. Database update
      try {
        await updateProductApi(editProduct.id, payload);
      } catch {}

      showToast(`✓ Product updated to: ${payload.name}`, "success");
      setEditModalOpen(false);
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // Quick Stock Update
  const handleQuickStock = async (id, newStock) => {
    const stockNum = Number(newStock);
    try {
      const overrides = JSON.parse(localStorage.getItem("ec_product_overrides") || "{}");
      overrides[id] = { ...(overrides[id] || {}), stock: stockNum, inStock: stockNum > 0 };
      localStorage.setItem("ec_product_overrides", JSON.stringify(overrides));
    } catch {}

    setProducts((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, stock: stockNum, inStock: stockNum > 0 } : p))
    );

    try {
      await updateProductApi(id, { stock: stockNum });
      showToast("✓ Stock updated", "success");
      loadStats();
    } catch {
      showToast("✓ Stock updated locally", "success");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;
    try {
      try {
        await deleteProductApi(id);
      } catch {}

      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));

      try {
        const custom = JSON.parse(localStorage.getItem("ec_custom_products") || "[]").filter(
          (p) => String(p.id) !== String(id)
        );
        localStorage.setItem("ec_custom_products", JSON.stringify(custom));
        const overrides = JSON.parse(localStorage.getItem("ec_product_overrides") || "{}");
        delete overrides[id];
        localStorage.setItem("ec_product_overrides", JSON.stringify(overrides));
      } catch {}

      showToast("✓ Product deleted", "success");
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      showToast(`✓ Order #${orderId} updated to ${newStatus}`, "success");
      loadStats();
    } catch (err) {
      showToast(err.message || "Failed to update order status", "error");
    }
  };

  // Description helpers
  const appendDescTemplate = (type) => {
    let addition = "";
    if (type === "specs") {
      addition = "\n• Specifications:\n  - Screen / Size: Ultra Clear Display\n  - Battery / Power: Long-lasting performance\n  - Build: Ergonomic premium materials";
    } else if (type === "highlights") {
      addition = "\n• Key Highlights:\n  - Fast & reliable performance\n  - High quality certified craftsmanship\n  - Easy to use right out of the box";
    } else if (type === "warranty") {
      addition = "\n• Warranty & Support:\n  - 1 Year Official Manufacturer Warranty included\n  - 7-Day Hassle-free Replacement Guarantee";
    }
    setAddForm((prev) => ({
      ...prev,
      description: (prev.description.trim() + addition).trim(),
    }));
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const q = prodSearch.toLowerCase().trim();
    const matchesQuery = !q || (p.name + " " + p.category + " " + (p.description || "")).toLowerCase().includes(q);
    const matchesCat = !prodCatFilter || p.category === prodCatFilter;
    return matchesQuery && matchesCat;
  });

  // Calculate live preview discount
  const previewSellingPrice = Number(addForm.price) || 0;
  const previewOldPrice = Number(addForm.oldPrice) || 0;
  const previewDiscount =
    previewOldPrice > previewSellingPrice && previewSellingPrice > 0
      ? Math.round(((previewOldPrice - previewSellingPrice) / previewOldPrice) * 100)
      : 0;

  // Render Denied / Authentication Gate
  if (!isAdmin) {
    return (
      <main className="container" style={{ margin: "28px auto 60px" }}>
        <div className="admin-auth-card">
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔐</div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Admin Portal Authentication</h2>
          <p style={{ color: "var(--muted)", marginBottom: "24px", lineHeight: "1.5" }}>
            This area is restricted to ECartline store managers and administrators.
          </p>

          <button
            className="btn"
            disabled={loggingIn}
            onClick={handleDirectAdminLogin}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "1rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span>{loggingIn ? "⚡ Unlocking Portal..." : "⚡ Direct Admin Access (One-Click)"}</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0", color: "var(--muted)", fontSize: "0.85rem" }}>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--border)" }} />
            <span>OR SIGN IN MANUALLY</span>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--border)" }} />
          </div>

          <form onSubmit={handleManualLogin} style={{ textAlign: "left" }}>
            <div className="field">
              <label htmlFor="adm-email">Admin Email</label>
              <input
                id="adm-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
              />
            </div>
            <div className="field" style={{ marginTop: "12px" }}>
              <label htmlFor="adm-pass">Password</label>
              <input
                id="adm-pass"
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
              />
            </div>
            <button
              type="submit"
              className="btn line"
              disabled={loggingIn}
              style={{ width: "100%", marginTop: "16px", padding: "12px" }}
            >
              {loggingIn ? "Signing In..." : "Sign In as Admin"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "0.85rem" }}>
            <Link to="/" style={{ color: "var(--muted)" }}>
              ← Back to Storefront
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Render Full Admin Portal
  return (
    <main className="container" style={{ margin: "28px auto 60px" }}>
      {/* Top Bar Header */}
      <div className="admin-top-bar">
        <div>
          <h1 style={{ fontSize: "1.8rem", display: "flex", alignItems: "center", gap: "10px" }}>
            ⚡ ECartline Admin Portal
            <span className="badge" style={{ position: "static", fontSize: "0.75rem" }}>
              ADMINISTRATOR
            </span>
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "4px" }}>
            Manage store catalog, products, full descriptions, orders, inventory, and inquiries.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => setActiveTab("add-product")}>
            ➕ Add New Product
          </button>
          <Link className="btn line" to="/">
            View Storefront ↗
          </Link>
          <button
            className="btn line"
            style={{ color: "#c00", borderColor: "#fca5a5" }}
            onClick={() => {
              logoutUser();
              showToast("Signed out of Admin Portal");
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <small>TOTAL SALES REVENUE</small>
          <b>{fmt(stats.totalRevenue)}</b>
          <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>✓ Confirmed Orders</span>
        </div>
        <div className="admin-stat-card">
          <small>TOTAL ORDERS PLACED</small>
          <b>{stats.totalOrders}</b>
          <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>All customer orders</span>
        </div>
        <div className="admin-stat-card">
          <small>CATALOG PRODUCTS</small>
          <b>{products.length}</b>
          <span style={{ color: stats.outOfStockCount ? "#c00" : "var(--primary)", fontSize: "0.8rem" }}>
            {stats.outOfStockCount ? `${stats.outOfStockCount} Out of stock` : `Ready for purchase`}
          </span>
        </div>
        <div className="admin-stat-card">
          <small>REGISTERED CUSTOMERS</small>
          <b>{stats.totalCustomers}</b>
          <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>Active accounts</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🏷️ Products Catalog
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "add-product" ? "active" : ""}`}
          onClick={() => setActiveTab("add-product")}
        >
          ➕ Add New Product
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 Orders Management
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          💬 Customer Inquiries
        </button>
      </div>

      {/* Tab 1: Products Catalog Section */}
      {activeTab === "products" && (
        <section className="admin-panel active">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="search"
                placeholder="Search products by name, category, or description..."
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "8px", minWidth: "320px" }}
              />
              <select
                value={prodCatFilter}
                onChange={(e) => setProdCatFilter(e.target.value)}
                style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "#FFF", fontWeight: 600 }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: 700, color: "var(--muted)" }}>{filteredProducts.length} products</span>
              <button className="btn" onClick={() => setActiveTab("add-product")}>
                + Add Product
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Image</th>
                  <th style={{ minWidth: "180px" }}>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>MRP</th>
                  <th style={{ width: "80px" }}>Stock</th>
                  <th style={{ minWidth: "240px" }}>Description</th>
                  <th>Rating</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px" }}>
                      Loading catalog products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                      No products found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.image || FALLBACK_IMAGE}
                          alt={p.name}
                          style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                      </td>
                      <td style={{ maxWidth: "200px" }}>
                        <b style={{ fontSize: "0.92rem" }}>{p.name}</b>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>ID: #{p.id}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ position: "static", fontSize: "0.75rem" }}>
                          {p.category}
                        </span>
                      </td>
                      <td><b>{fmt(p.price)}</b></td>
                      <td><s style={{ color: "var(--muted)" }}>{p.oldPrice ? fmt(p.oldPrice) : "—"}</s></td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          defaultValue={p.stock != null ? p.stock : 15}
                          style={{ width: "65px", padding: "5px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", fontWeight: 600 }}
                          onBlur={(e) => handleQuickStock(p.id, e.target.value)}
                        />
                      </td>
                      <td style={{ maxWidth: "260px" }}>
                        <div className="admin-desc-box">{p.description || "No description provided."}</div>
                        <button
                          className="btn line"
                          style={{ minHeight: "22px", padding: "2px 6px", fontSize: "0.7rem", marginTop: "4px" }}
                          onClick={() => setDescModal({ open: true, title: p.name, content: p.description || "No description provided." })}
                        >
                          View Full Text
                        </button>
                      </td>
                      <td>
                        <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ {p.rating || 4.5}</span>
                        <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}> ({p.reviews || 0})</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn line"
                            style={{ minHeight: "30px", padding: "0 10px", fontSize: "0.8rem" }}
                            onClick={() => openEditModal(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn line"
                            style={{ minHeight: "30px", padding: "0 8px", fontSize: "0.8rem", color: "#c00", borderColor: "#fca5a5" }}
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 2: Direct Add Product Section with Live Store Preview */}
      {activeTab === "add-product" && (
        <section className="admin-panel active">
          <div className="admin-add-product-grid">
            {/* Direct Product Creation Form */}
            <div className="admin-form-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    ➕ Add New Product
                  </h2>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                    Fill in the product details, set pricing & inventory, and write a complete description.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn line"
                  style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                  onClick={() =>
                    setAddForm({
                      name: "",
                      category: "",
                      price: "",
                      oldPrice: "",
                      stock: 25,
                      image: "",
                      description: "",
                    })
                  }
                >
                  Reset
                </button>
              </div>

              <form onSubmit={handleAddProduct}>
                <div className="field">
                  <label htmlFor="add-p-name"><b>Product Title / Name *</b></label>
                  <input
                    id="add-p-name"
                    required
                    placeholder="e.g. Apple iPhone 15 (128 GB) - Blue"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                </div>

                <div className="field-grid" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label htmlFor="add-p-cat"><b>Category *</b></label>
                    <select
                      id="add-p-cat"
                      required
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "#FFF" }}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="add-p-stock"><b>Stock Inventory Quantity *</b></label>
                    <input
                      id="add-p-stock"
                      type="number"
                      min={0}
                      required
                      placeholder="e.g. 25"
                      value={addForm.stock}
                      onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                  </div>
                </div>

                <div className="field-grid" style={{ marginTop: "14px" }}>
                  <div className="field">
                    <label htmlFor="add-p-price"><b>Selling Price (₹) *</b></label>
                    <input
                      id="add-p-price"
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      placeholder="e.g. 69999"
                      value={addForm.price}
                      onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="add-p-old"><b>MRP / Old Price (₹)</b> <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>(Optional)</span></label>
                    <input
                      id="add-p-old"
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="e.g. 79900"
                      value={addForm.oldPrice}
                      onChange={(e) => setAddForm({ ...addForm, oldPrice: e.target.value })}
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                  </div>
                </div>

                <div className="field" style={{ marginTop: "14px" }}>
                  <label htmlFor="add-p-img"><b>Product Primary Image URL *</b></label>
                  <input
                    id="add-p-img"
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={addForm.image}
                    onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Sample Photos:</span>
                    {Object.keys(PRESET_IMAGES).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className="desc-template-btn"
                        onClick={() => setAddForm({ ...addForm, image: PRESET_IMAGES[key] })}
                      >
                        {key === "mobile" && "📱 Mobile"}
                        {key === "laptop" && "💻 Laptop"}
                        {key === "headphone" && "🎧 Headphone"}
                        {key === "shoes" && "👟 Shoes"}
                        {key === "watch" && "⌚ Smartwatch"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Input & Templates */}
                <div className="field" style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                    <label htmlFor="add-p-desc" style={{ margin: 0 }}>
                      <b>Product Description & Features *</b>
                    </label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button type="button" className="desc-template-btn" onClick={() => appendDescTemplate("specs")}>
                        + Add Specs
                      </button>
                      <button type="button" className="desc-template-btn" onClick={() => appendDescTemplate("highlights")}>
                        + Add Bullet Points
                      </button>
                      <button type="button" className="desc-template-btn" onClick={() => appendDescTemplate("warranty")}>
                        + Add Warranty
                      </button>
                      <button type="button" className="desc-template-btn" onClick={() => setAddForm({ ...addForm, description: "" })} style={{ color: "#c00" }}>
                        Clear
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="add-p-desc"
                    rows={6}
                    required
                    placeholder="Enter a comprehensive overview, key features, technical specifications, and warranty details..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "inherit", lineHeight: 1.5 }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Shoppers see this description on the product details card and page.</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>{addForm.description.length} characters</span>
                  </div>
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={addingProduct}
                    style={{ flex: 1, padding: "14px", fontSize: "1rem" }}
                  >
                    {addingProduct ? "Publishing Product..." : "🚀 Publish Product to Catalog"}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Store Preview Card */}
            <div className="admin-preview-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  ✨ Live Storefront Preview
                </h3>
                <span className="preview-tag">STORE PREVIEW</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "16px" }}>
                Here is how this product and description will display to customers in ECartline:
              </p>

              <div className="card" style={{ margin: 0, boxShadow: "var(--sh)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", background: "#FFF" }}>
                <div style={{ position: "relative", background: "#F8FAFC", padding: "16px", textAlign: "center" }}>
                  {previewDiscount > 0 && (
                    <span className="pct" style={{ position: "absolute", top: "10px", left: "10px" }}>
                      {previewDiscount}% OFF
                    </span>
                  )}
                  <img
                    src={addForm.image.trim() || PRESET_IMAGES.mobile}
                    alt="Preview"
                    style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain", margin: "0 auto" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="body" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span className="badge" style={{ position: "static", fontSize: "0.75rem" }}>
                      {addForm.category || "Mobiles"}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: Number(addForm.stock) > 0 ? "var(--primary)" : "#c00" }}>
                      {Number(addForm.stock) > 0 ? `● In Stock (${addForm.stock})` : `● Out of Stock`}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "4px 0 6px", lineHeight: 1.3 }}>
                    {addForm.name || "Product Name Preview"}
                  </h4>

                  <div style={{ color: "#F59E0B", fontSize: "0.85rem", marginBottom: "8px" }}>
                    ★★★★★ <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>(4.5 rating)</span>
                  </div>

                  <div className="price" style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
                    <b style={{ fontSize: "1.25rem" }}>{fmt(previewSellingPrice)}</b>
                    {previewOldPrice > previewSellingPrice && (
                      <s style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{fmt(previewOldPrice)}</s>
                    )}
                  </div>

                  <div style={{ marginTop: "10px", padding: "10px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #EDF2F7" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                      Description Preview:
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.45, whiteSpace: "pre-line" }}>
                      {addForm.description || "Detailed specifications, features, and overview will appear here as you type..."}
                    </div>
                  </div>

                  <button className="btn" type="button" style={{ width: "100%", marginTop: "14px", pointerEvents: "none", opacity: 0.9 }}>
                    🛒 Add to Cart (Demo)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === "orders" && (
        <section className="admin-panel active">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px" }}>
                      Loading customer orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const dateStr = o.created_at
                      ? new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";

                    return (
                      <tr key={o.id}>
                        <td><b>{o.order_number}</b></td>
                        <td>
                          <b>{o.customer_name || o.shipping_name}</b>
                          <br />
                          <small style={{ color: "var(--muted)" }}>{o.customer_email || "customer@example.com"}</small>
                        </td>
                        <td>{dateStr}</td>
                        <td>{o.total_items || (o.items ? o.items.length : 1)} items</td>
                        <td><b>{fmt(o.total_amount)}</b></td>
                        <td>
                          <span style={{ fontSize: "0.85rem" }}>
                            {(o.payment_method || "COD").toUpperCase()} ({(o.payment_status || "Pending")})
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={o.order_status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            style={{ padding: "6px 10px", borderRadius: "6px", fontWeight: 600 }}
                          >
                            <option value="placed">Placed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn line"
                            style={{ minHeight: "30px", padding: "0 8px", fontSize: "0.8rem" }}
                            onClick={() =>
                              alert(
                                `Recipient: ${o.shipping_name}\nAddress: ${o.shipping_address}\nPhone: ${o.shipping_phone}`
                              )
                            }
                          >
                            View Address
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 4: Customer Inquiries */}
      {activeTab === "messages" && (
        <section className="admin-panel active">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {loadingMessages ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>
                      Loading inquiries...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                      No customer inquiries received yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr key={m.id || Math.random()}>
                      <td>{m.created_at ? new Date(m.created_at).toLocaleDateString("en-IN") : "—"}</td>
                      <td><b>{m.name}</b></td>
                      <td><a href={`mailto:${m.email}`} style={{ color: "var(--primary)" }}>{m.email}</a></td>
                      <td>{m.phone || "—"}</td>
                      <td style={{ maxWidth: "320px", lineHeight: 1.4 }}>{m.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && editProduct && (
        <div
          className="modal-overlay"
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-box"
            style={{
              background: "#FFF",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              padding: "28px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--sh-xl)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.3rem" }}>Edit Product #{editProduct.id}</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.6rem", cursor: "pointer", color: "var(--muted)" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="field">
                <label htmlFor="pm-name"><b>Product Name *</b></label>
                <input
                  id="pm-name"
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>

              <div className="field-grid" style={{ marginTop: "12px" }}>
                <div className="field">
                  <label htmlFor="pm-cat"><b>Category *</b></label>
                  <select
                    id="pm-cat"
                    required
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", background: "#FFF" }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="pm-stock"><b>Stock Quantity *</b></label>
                  <input
                    id="pm-stock"
                    type="number"
                    min={0}
                    required
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                </div>
              </div>

              <div className="field-grid" style={{ marginTop: "12px" }}>
                <div className="field">
                  <label htmlFor="pm-price"><b>Selling Price (₹) *</b></label>
                  <input
                    id="pm-price"
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pm-old"><b>MRP / Old Price (₹)</b></label>
                  <input
                    id="pm-old"
                    type="number"
                    step="0.01"
                    min={0}
                    value={editProduct.oldPrice}
                    onChange={(e) => setEditProduct({ ...editProduct, oldPrice: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: "12px" }}>
                <label htmlFor="pm-img"><b>Product Image URL *</b></label>
                <input
                  id="pm-img"
                  type="url"
                  required
                  value={editProduct.image}
                  onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
              </div>

              <div className="field" style={{ marginTop: "12px" }}>
                <label htmlFor="pm-desc"><b>Product Description *</b></label>
                <textarea
                  id="pm-desc"
                  rows={4}
                  required
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn line"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Description Viewer Modal */}
      {descModal.open && (
        <div
          className="modal-overlay"
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-box"
            style={{
              background: "#FFF",
              borderRadius: "16px",
              maxWidth: "540px",
              width: "100%",
              padding: "24px",
              boxShadow: "var(--sh-xl)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>{descModal.title}</h3>
              <button
                onClick={() => setDescModal({ open: false, title: "", content: "" })}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--muted)" }}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--text)",
                whiteSpace: "pre-line",
                maxHeight: "360px",
                overflowY: "auto",
                background: "#F8FAFC",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              {descModal.content}
            </div>
            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <button
                className="btn line"
                onClick={() => setDescModal({ open: false, title: "", content: "" })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
