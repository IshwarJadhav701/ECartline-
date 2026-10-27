import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { fetchAllProducts } from "../services/api";
import { fallbackProducts, fmt, FALLBACK_IMAGE } from "../services/productsData";

export default function Cart() {
  const { cart, cartCount, updateQuantity, removeFromCart, clearCart, calculateTotals } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (data && data.length) setProducts(data);
      } catch {}
    })();
  }, []);

  // Map cart items with real product info
  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);

  const totals = calculateTotals(products);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  const handleMoveToWishlist = (product) => {
    if (!isInWishlist(product.id)) {
      toggleWishlist(product.id);
    }
    removeFromCart(product.id);
  };

  if (!cartItems.length) {
    return (
      <main className="container" style={{ padding: "60px 16px", minHeight: "55vh" }}>
        <div className="empty" style={{ textAlign: "center", maxWidth: "480px", margin: "40px auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🛒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
            Your Shopping Cart is empty
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
            Explore our catalog to discover trending smartphones, electronics, fashion, and home essentials.
          </p>
          <Link className="btn" to="/products" style={{ padding: "12px 28px", fontSize: "1rem" }}>
            Start Shopping Now →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ margin: "28px auto 60px" }}>
      <h1 className="sec-title" style={{ marginBottom: "20px" }}>
        Shopping Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
      </h1>

      <div className="cart-wrap">
        {/* Left Column: Cart Items List */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--border)"
            }}
          >
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Items in your cart</span>
            <button
              type="button"
              className="btn line"
              style={{ minHeight: "28px", padding: "2px 10px", fontSize: "0.8rem", color: "#DC2626", borderColor: "#FCA5A5" }}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cartItems.map(({ id, qty, product }) => {
              const maxStock = Math.min(10, product.stock ?? 10);
              const inStock = product.inStock !== false && (product.stock == null || product.stock > 0);

              return (
                <div
                  key={id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: "18px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px",
                    boxShadow: "var(--sh-sm)"
                  }}
                >
                  {/* Thumbnail */}
                  <Link to={`/products/${product.id}`} style={{ display: "block", height: "110px" }}>
                    <img
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--r-sm)" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </Link>

                  {/* Info & Quantity */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <Link
                          to={`/products/${product.id}`}
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            color: "var(--text-main)",
                            textDecoration: "none",
                            lineHeight: "1.4"
                          }}
                        >
                          {product.name}
                        </Link>
                        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <b style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                            {fmt(product.price * qty)}
                          </b>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              <s>{fmt(product.oldPrice * qty)}</s>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Category: {product.category}
                      </div>

                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          color: inStock ? "var(--discount-green)" : "#DC2626",
                          marginTop: "4px"
                        }}
                      >
                        {inStock ? "✓ In Stock" : "✕ Out of Stock"}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "14px"
                      }}
                    >
                      {/* Quantity Controller */}
                      <div className="qty">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1, maxStock)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          disabled={qty >= maxStock}
                          onClick={() => updateQuantity(product.id, 1, maxStock)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Move to Wishlist / Remove */}
                      <div style={{ display: "flex", gap: "14px" }}>
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: 0
                          }}
                          onClick={() => handleMoveToWishlist(product)}
                        >
                          ♡ Move to Wishlist
                        </button>
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#DC2626",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            padding: 0
                          }}
                          onClick={() => removeFromCart(product.id)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Price Summary */}
        <div className="summary" style={{ position: "sticky", top: "90px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Price Details
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", color: "var(--text-body)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Price ({cartCount} items)</span>
              <span>{fmt(totals.mrp)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--discount-green)", fontWeight: "600" }}>
              <span>Discount</span>
              <span>− {fmt(totals.discount)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery Charges</span>
              <span>
                {totals.delivery === 0 ? (
                  <b style={{ color: "var(--discount-green)" }}>FREE</b>
                ) : (
                  fmt(totals.delivery)
                )}
              </span>
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)" }}>
              <span>Total Payable</span>
              <span>{fmt(totals.total)}</span>
            </div>
          </div>

          {totals.discount > 0 && (
            <div
              style={{
                marginTop: "16px",
                padding: "8px 12px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "var(--r-sm)",
                color: "var(--primary-dark)",
                fontSize: "0.85rem",
                fontWeight: "700",
                textAlign: "center"
              }}
            >
              🎉 You will save {fmt(totals.discount)} on this order!
            </div>
          )}

          <button
            type="button"
            className="btn alt"
            style={{ width: "100%", marginTop: "20px", padding: "14px", fontSize: "1rem" }}
            onClick={handleCheckout}
          >
            Proceed to Checkout →
          </button>

          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span>🔒</span>
            <span>Safe and Secure 256-bit Encrypted Payments</span>
          </div>
        </div>
      </div>
    </main>
  );
}
