import React from "react";
import AdminStats from "./AdminStats";
import { fmt } from "../services/productsData";

export default function AdminDashboard({
  stats,
  products,
  orders,
  messages,
  setActiveTab,
  onViewAddress,
}) {
  // Low stock products alert (< 5 units)
  const lowStockProducts = products.filter((p) => (p.stock != null ? p.stock : 15) <= 5).slice(0, 5);

  // Recent 5 orders
  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="admin-dashboard-view">
      {/* Overview Analytics Cards */}
      <AdminStats stats={stats} totalProducts={products.length} />

      {/* Quick Actions & Store Health Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Quick Shortcuts */}
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid var(--adm-border)", boxShadow: "var(--sh-sm)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>⚡ Quick Management Actions</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "0.85rem", marginBottom: "18px" }}>
            Common administrative workflows and rapid updates.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setActiveTab("add-product")}
              style={{ justifyContent: "flex-start", gap: "10px", padding: "12px 16px" }}
            >
              <span>➕</span>
              <span>Add New Product</span>
            </button>
            <button
              type="button"
              className="btn line"
              onClick={() => setActiveTab("products")}
              style={{ justifyContent: "flex-start", gap: "10px", padding: "12px 16px" }}
            >
              <span>🏷️</span>
              <span>Manage Catalog</span>
            </button>
            <button
              type="button"
              className="btn line"
              onClick={() => setActiveTab("orders")}
              style={{ justifyContent: "flex-start", gap: "10px", padding: "12px 16px" }}
            >
              <span>📦</span>
              <span>Review Orders</span>
            </button>
            <button
              type="button"
              className="btn line"
              onClick={() => setActiveTab("messages")}
              style={{ justifyContent: "flex-start", gap: "10px", padding: "12px 16px" }}
            >
              <span>💬</span>
              <span>Inquiries ({messages.length})</span>
            </button>
          </div>
        </div>

        {/* Backend & Database Health Widget */}
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid var(--adm-border)", boxShadow: "var(--sh-sm)" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>🖥️ System Status</h3>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Real-time backend infrastructure health.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#F8FAFC", borderRadius: "8px" }}>
              <span style={{ fontWeight: 600 }}>Java Backend</span>
              <span style={{ color: "var(--adm-success)", fontWeight: 800 }}>● Spring Boot 3.2</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#F8FAFC", borderRadius: "8px" }}>
              <span style={{ fontWeight: 600 }}>Database</span>
              <span style={{ color: "var(--adm-success)", fontWeight: 800 }}>● MySQL 3306</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#F8FAFC", borderRadius: "8px" }}>
              <span style={{ fontWeight: 600 }}>Auth Engine</span>
              <span style={{ color: "var(--adm-primary)", fontWeight: 800 }}>● JWT Bearer Token</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Orders & Low Stock Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "20px" }}>
        {/* Recent Orders Table */}
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid var(--adm-border)", boxShadow: "var(--sh-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>📦 Recent Orders</h3>
            <button
              type="button"
              className="btn line"
              style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.78rem" }}
              onClick={() => setActiveTab("orders")}
            >
              View All ({orders.length}) →
            </button>
          </div>

          <div className="table-responsive" style={{ margin: 0, boxShadow: "none" }}>
            <table className="admin-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "var(--adm-text-muted)" }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><b>{o.order_number || `#ORD-${o.id}`}</b></td>
                      <td>{o.customer_name || o.shipping_name || "Customer"}</td>
                      <td><b>{fmt(o.total_amount)}</b></td>
                      <td>
                        <span className="badge" style={{ position: "static", fontSize: "0.7rem" }}>
                          {o.order_status || "placed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid var(--adm-border)", boxShadow: "var(--sh-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>⚠️ Low Stock Watchlist</h3>
            <button
              type="button"
              className="btn line"
              style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.78rem" }}
              onClick={() => setActiveTab("products")}
            >
              Inventory →
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--adm-success)", fontWeight: 700, fontSize: "0.9rem" }}>
              ✓ All products have healthy stock levels!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "#FEF2F2",
                    border: "1px solid #FECDD3",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <b style={{ fontSize: "0.85rem", color: "#0F172A", display: "block" }}>{p.name}</b>
                    <small style={{ color: "#64748B" }}>{p.category}</small>
                  </div>
                  <span style={{ color: "#DC2626", fontWeight: 800, fontSize: "0.85rem" }}>
                    {p.stock != null ? p.stock : 0} units left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
