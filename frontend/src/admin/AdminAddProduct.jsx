import React, { useState } from "react";
import { fmt, FALLBACK_IMAGE } from "../services/productsData";

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

export default function AdminAddProduct({ onAddProduct, adding }) {
  const [form, setForm] = useState({
    name: "",
    category: "Electronics",
    price: "",
    oldPrice: "",
    stock: 25,
    image: PRESET_IMAGES.mobile,
    description: "",
  });

  const appendTemplate = (type) => {
    let snippet = "";
    if (type === "specs") {
      snippet = "\n\nSpecifications:\n• Battery: 5000 mAh All-Day Endurance\n• Display: 6.7-inch AMOLED, 120Hz Refresh Rate\n• Processor: High-Efficiency Octa-Core Chipset\n• Connectivity: 5G Dual SIM, Wi-Fi 6, Bluetooth 5.3";
    } else if (type === "highlights") {
      snippet = "\n\nKey Highlights:\n• Ergonomic, lightweight, and durable build\n• Engineered for everyday high performance\n• Includes fast charging adapter and cable in box";
    } else if (type === "warranty") {
      snippet = "\n\nWarranty:\n• 1 Year Comprehensive Brand Replacement Warranty across India.";
    }
    setForm((prev) => ({
      ...prev,
      description: (prev.description ? prev.description.trim() + snippet : snippet.trimStart()),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct(form);
  };

  const discountPercent =
    form.price && form.oldPrice && Number(form.oldPrice) > Number(form.price)
      ? `${Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)}% OFF`
      : null;

  return (
    <div className="admin-add-product-grid">
      {/* Product Creation Form */}
      <div className="admin-form-card">
        <h2 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>Add Product to Catalog</h2>
        <p style={{ color: "var(--adm-text-muted)", fontSize: "0.88rem", marginBottom: "22px" }}>
          Publish a new inventory item directly to the ECartline storefront database.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="p-name"><b>Product Title / Name *</b></label>
            <input
              id="p-name"
              type="text"
              required
              placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px" }}
            />
          </div>

          <div className="field-grid" style={{ marginTop: "14px" }}>
            <div className="field">
              <label htmlFor="p-cat"><b>Category *</b></label>
              <select
                id="p-cat"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px", background: "#FFF" }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-stock"><b>Inventory Stock Units *</b></label>
              <input
                id="p-stock"
                type="number"
                min="0"
                required
                placeholder="25"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px" }}
              />
            </div>
          </div>

          <div className="field-grid" style={{ marginTop: "14px" }}>
            <div className="field">
              <label htmlFor="p-price"><b>Selling Price (₹) *</b></label>
              <input
                id="p-price"
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="e.g. 74999"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px" }}
              />
            </div>
            <div className="field">
              <label htmlFor="p-old-price"><b>MRP / Old Slashed Price (₹)</b></label>
              <input
                id="p-old-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 89999"
                value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px" }}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: "14px" }}>
            <label htmlFor="p-img"><b>Product Image URL *</b></label>
            <input
              id="p-img"
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px" }}
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--adm-text-muted)", fontWeight: 600 }}>Sample Photos:</span>
              {Object.keys(PRESET_IMAGES).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="desc-template-btn"
                  onClick={() => setForm({ ...form, image: PRESET_IMAGES[key] })}
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

          <div className="field" style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
              <label htmlFor="p-desc" style={{ margin: 0 }}>
                <b>Product Features & Description *</b>
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button type="button" className="desc-template-btn" onClick={() => appendTemplate("specs")}>
                  + Add Specs
                </button>
                <button type="button" className="desc-template-btn" onClick={() => appendTemplate("highlights")}>
                  + Add Highlights
                </button>
                <button type="button" className="desc-template-btn" onClick={() => appendTemplate("warranty")}>
                  + Add Warranty
                </button>
                <button type="button" className="desc-template-btn" onClick={() => setForm({ ...form, description: "" })} style={{ color: "#DC2626" }}>
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="p-desc"
              rows={6}
              required
              placeholder="Describe key features, box contents, tech specs..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "1px solid var(--adm-border)", borderRadius: "8px", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn"
              disabled={adding}
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
            >
              {adding ? "🚀 Publishing Product..." : "🚀 Publish Product to Catalog"}
            </button>
          </div>
        </form>
      </div>

      {/* Live Storefront Preview Card */}
      <div className="admin-preview-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "1.05rem" }}>✨ Live Storefront Preview</h3>
          <span className="badge" style={{ position: "static", fontSize: "0.7rem" }}>LIVE PREVIEW</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--adm-text-muted)", marginBottom: "16px" }}>
          Here is how this product card will appear on the customer storefront:
        </p>

        <div className="card" style={{ maxWidth: "300px", margin: "0 auto", boxShadow: "var(--sh-md)" }}>
          {discountPercent && <span className="badge">{discountPercent}</span>}
          <div className="img">
            <img
              src={form.image || FALLBACK_IMAGE}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />
          </div>
          <div className="info">
            <span className="cat-name">{form.category || "Electronics"}</span>
            <span className="pname" style={{ fontWeight: 700 }}>
              {form.name || "Product Title Preview"}
            </span>
            <div className="stars">
              <span style={{ color: "var(--star-gold)" }}>★★★★★</span>
              <small> 5.0 (New)</small>
            </div>
            <div className="price">
              <b>{form.price ? fmt(form.price) : "₹0"}</b>
              {form.oldPrice && Number(form.oldPrice) > Number(form.price) && (
                <s>{fmt(form.oldPrice)}</s>
              )}
              {discountPercent && <em>{discountPercent}</em>}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--discount-green)", fontWeight: 700, marginTop: "2px" }}>
              ✓ In stock ({form.stock || 25})
            </div>
            <div className="acts single-act" style={{ marginTop: "12px" }}>
              <button className="btn" type="button" style={{ width: "100%", opacity: 0.85, pointerEvents: "none" }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
