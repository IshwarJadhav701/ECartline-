import React, { useState, useMemo } from "react";
import { fmt, FALLBACK_IMAGE } from "../services/productsData";

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

export default function AdminProducts({
  products,
  loading,
  onEdit,
  onDelete,
  onQuickStock,
  onViewDesc,
  onAddClick,
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (catFilter) {
      list = list.filter((p) => p.category === catFilter);
    }
    return list;
  }, [products, search, catFilter]);

  return (
    <div className="admin-products-view">
      {/* Search and Filters Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search products by title, category, specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid var(--adm-border)",
              borderRadius: "8px",
              minWidth: "300px",
              background: "#FFF",
              outline: "none",
            }}
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid var(--adm-border)",
              borderRadius: "8px",
              background: "#FFF",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Categories ({products.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 700, color: "var(--adm-text-muted)", fontSize: "0.9rem" }}>
            Showing {filtered.length} of {products.length} items
          </span>
          <button type="button" className="btn" onClick={onAddClick}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "64px" }}>Image</th>
              <th style={{ minWidth: "180px" }}>Product Name</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>MRP</th>
              <th style={{ width: "90px" }}>Stock</th>
              <th style={{ minWidth: "220px" }}>Description</th>
              <th>Rating</th>
              <th style={{ width: "140px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  ⏳ Loading store catalog products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  🔍 No products match your filter or search query.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.image || FALLBACK_IMAGE}
                      alt={p.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid var(--adm-border)",
                        background: "#FFF",
                        padding: "2px",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </td>
                  <td style={{ maxWidth: "220px" }}>
                    <b style={{ fontSize: "0.92rem", color: "var(--adm-text-main)" }}>{p.name}</b>
                    <div style={{ fontSize: "0.75rem", color: "var(--adm-text-muted)", marginTop: "2px" }}>
                      SKU: #EC-{p.id}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ position: "static", fontSize: "0.72rem" }}>
                      {p.category}
                    </span>
                  </td>
                  <td><b>{fmt(p.price)}</b></td>
                  <td>
                    <s style={{ color: "var(--adm-text-muted)", fontSize: "0.85rem" }}>
                      {p.oldPrice ? fmt(p.oldPrice) : "—"}
                    </s>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.stock != null ? p.stock : 15}
                      title="Edit stock & click away to save"
                      style={{
                        width: "65px",
                        padding: "5px 8px",
                        border: "1px solid var(--adm-border)",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontWeight: 700,
                        background: (p.stock != null ? p.stock : 15) <= 3 ? "#FEF2F2" : "#FFF",
                        color: (p.stock != null ? p.stock : 15) <= 3 ? "#DC2626" : "inherit",
                      }}
                      onBlur={(e) => onQuickStock(p.id, e.target.value)}
                    />
                  </td>
                  <td style={{ maxWidth: "240px" }}>
                    <div className="admin-desc-box">
                      {p.description || "No description provided."}
                    </div>
                    <button
                      type="button"
                      className="btn line"
                      style={{ minHeight: "22px", padding: "1px 6px", fontSize: "0.7rem", marginTop: "4px" }}
                      onClick={() => onViewDesc(p.name, p.description || "No description provided.")}
                    >
                      View Full Details
                    </button>
                  </td>
                  <td>
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ {p.rating || 4.5}</span>
                    <span style={{ color: "var(--adm-text-muted)", fontSize: "0.75rem" }}> ({p.reviews || 0})</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn line"
                        style={{ minHeight: "30px", padding: "0 10px", fontSize: "0.8rem" }}
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn line"
                        style={{ minHeight: "30px", padding: "0 8px", fontSize: "0.8rem", color: "#DC2626", borderColor: "#FECDD3" }}
                        onClick={() => onDelete(p.id)}
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
    </div>
  );
}
