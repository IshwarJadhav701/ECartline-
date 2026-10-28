import React, { useState } from "react";
import { fmt } from "../services/productsData";

export default function AdminOrders({ orders, loading, onStatusChange, onViewAddress }) {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "all") return true;
    return (o.order_status || "").toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="admin-orders-view">
      {/* Header and status filter pills */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "placed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn line ${filterStatus === st ? "active" : ""}`}
              style={{
                minHeight: "34px",
                padding: "0 12px",
                fontSize: "0.82rem",
                textTransform: "capitalize",
                background: filterStatus === st ? "var(--adm-primary)" : "#FFF",
                color: filterStatus === st ? "#FFF" : "inherit",
                borderColor: filterStatus === st ? "var(--adm-primary)" : "var(--adm-border)",
              }}
              onClick={() => setFilterStatus(st)}
            >
              {st === "all" ? `All Orders (${orders.length})` : st}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Shipping Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  ⏳ Loading customer orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  📦 No orders found matching "{filterStatus}".
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const dateStr = o.created_at
                  ? new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <tr key={o.id}>
                    <td><b>{o.order_number || `#ORD-${o.id}`}</b></td>
                    <td>
                      <b style={{ color: "var(--adm-text-main)" }}>{o.customer_name || o.shipping_name || "Customer"}</b>
                      <div style={{ fontSize: "0.75rem", color: "var(--adm-text-muted)" }}>
                        {o.customer_email || "customer@example.com"}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{dateStr}</td>
                    <td><b>{o.total_items || (o.items ? o.items.length : 1)}</b> items</td>
                    <td><b style={{ color: "var(--adm-primary)" }}>{fmt(o.total_amount)}</b></td>
                    <td>
                      <span className="badge" style={{ position: "static", fontSize: "0.7rem", background: "#F1F5F9", color: "#334155", border: "1px solid var(--adm-border)" }}>
                        {(o.payment_method || "COD").toUpperCase()} • {(o.payment_status || "Pending")}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={o.order_status || "placed"}
                        onChange={(e) => onStatusChange(o.id, e.target.value)}
                        style={{
                          color:
                            o.order_status === "delivered"
                              ? "var(--adm-success)"
                              : o.order_status === "cancelled"
                              ? "var(--adm-danger)"
                              : "var(--adm-primary)",
                          fontWeight: 700,
                        }}
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
                        type="button"
                        className="btn line"
                        style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.78rem" }}
                        onClick={() => onViewAddress(o)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
