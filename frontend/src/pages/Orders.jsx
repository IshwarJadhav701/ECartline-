import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchOrders, cancelOrder } from "../services/api";
import { fmt, FALLBACK_IMAGE } from "../services/productsData";

export default function Orders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? Any deducted inventory will be restored.")) {
      return;
    }
    try {
      await cancelOrder(orderId);
      showToast("✓ Order cancelled successfully", "success");
      loadOrders();
    } catch (err) {
      showToast(err.message || "Failed to cancel order", "error");
    }
  };

  if (!user) {
    return (
      <main className="container">
        <div className="orders-page" style={{ margin: "28px 0 60px" }}>
          <div className="empty">
            <h3>Please sign in to view your order history.</h3>
            <p style={{ margin: "16px 0 24px" }}>Sign in to track orders, manage addresses, and request refunds.</p>
            <Link className="btn" to="/login?redirect=orders">
              Sign In Now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusColors = {
    placed: "var(--accent)",
    processing: "#17a2b8",
    shipped: "#007bff",
    delivered: "var(--primary)",
    cancelled: "#dc3545",
  };

  const steps = ["placed", "processing", "shipped", "delivered"];

  return (
    <main className="container">
      <div className="orders-page" style={{ margin: "28px 0 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <h1 className="sec-title" style={{ margin: 0 }}>My Orders</h1>
          <Link className="btn line" to="/products">
            Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div>
            <div className="skel" style={{ height: "180px", marginBottom: "16px" }} />
            <div className="skel" style={{ height: "180px" }} />
          </div>
        ) : error ? (
          <div className="empty" style={{ color: "#c00" }}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📦</div>
            <h3>You have not placed any orders yet.</h3>
            <p style={{ margin: "12px 0 20px" }}>Explore thousands of items across all our top departments.</p>
            <Link className="btn" to="/products">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const dateStr = o.created_at
              ? new Date(o.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            const canCancel = ["placed", "processing"].includes(o.order_status);
            const currentStepIdx = steps.indexOf(o.order_status);

            return (
              <article key={o.id} className="order-card" style={{ marginBottom: "24px" }}>
                <div className="order-hdr">
                  <div>
                    <small>ORDER PLACED</small>
                    <b>{dateStr}</b>
                  </div>
                  <div>
                    <small>TOTAL AMOUNT</small>
                    <b>{fmt(o.total_amount)}</b>
                  </div>
                  <div>
                    <small>SHIP TO</small>
                    <b>{o.shipping_name}</b>
                  </div>
                  <div className="order-num-col">
                    <small>ORDER # {o.order_number}</small>
                    <span
                      className="order-badge"
                      style={{ background: statusColors[o.order_status] || "#666" }}
                    >
                      {(o.order_status || "").toUpperCase()}
                    </span>
                  </div>
                </div>

                {o.order_status !== "cancelled" ? (
                  <div className="tracking-bar">
                    {steps.map((st, i) => (
                      <div
                        key={st}
                        className={`track-step ${i <= currentStepIdx ? "active" : ""}`}
                      >
                        <div className="track-dot">✓</div>
                        <span>{st.charAt(0).toUpperCase() + st.slice(1)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cancelled-notice">
                    ⚠️ This order was cancelled.
                  </div>
                )}

                <div className="order-body">
                  <div className="order-items">
                    {(o.items || []).map((it, idx) => (
                      <div key={idx} className="order-item-row">
                        <img
                          src={it.product_image || FALLBACK_IMAGE}
                          alt={it.product_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Link to={`/product/${it.product_id}`}>
                            <b>{it.product_name}</b>
                          </Link>
                          <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                            Qty: {it.quantity} × {fmt(it.price)}
                          </div>
                        </div>
                        <b>{fmt(it.price * it.quantity)}</b>
                      </div>
                    ))}
                  </div>

                  <div className="order-details-side">
                    <h4>Delivery Details</h4>
                    <p>{o.shipping_address}</p>
                    <p style={{ marginTop: "4px" }}>📞 {o.shipping_phone}</p>
                    <p style={{ marginTop: "8px" }}>
                      💳 <b>Payment:</b> {(o.payment_method || "").toUpperCase()} ({(o.payment_status || "").toUpperCase()})
                    </p>

                    {canCancel && (
                      <button
                        className="btn line"
                        style={{ marginTop: "16px", color: "#c00", borderColor: "#c00", width: "100%" }}
                        onClick={() => handleCancelOrder(o.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
