import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const handleNewsletter = (e) => {
    e.preventDefault();
    const input = e.target.elements.newsletter_email;
    if (input && input.value.trim()) {
      showToast("✓ Thank you for subscribing to ECartline updates!");
      input.value = "";
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <footer className="site-footer">
        <div className="container ftop">
          <div className="fcol">
            <h2 className="logo" style={{ color: "#fff", display: "inline-block", marginBottom: "14px" }}>
              E<span>Cartline</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6" }}>
              Smart products. Better everyday. Delivering authentic electronics, smartphones, fashion, home essentials, and lifestyle brands with fast pan-India delivery.
            </p>
            <div className="social" style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
              <span className="soc-badge" title="Twitter / X">𝕏</span>
              <span className="soc-badge" title="Facebook">f</span>
              <span className="soc-badge" title="Instagram">📸</span>
              <span className="soc-badge" title="LinkedIn">in</span>
            </div>
          </div>

          <div className="fcol">
            <h3>Quick Links</h3>
            <Link to="/products">All Products</Link>
            <Link to="/categories">Product Categories</Link>
            <Link to="/orders">Track Your Orders</Link>
            <Link to="/wishlist">My Wishlist</Link>
            <Link to="/contact">Customer Support</Link>
          </div>

          <div className="fcol">
            <h3>Customer Care</h3>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Support</Link>
            <a href="#shipping" onClick={(e) => { e.preventDefault(); showToast("Standard delivery: 2–4 business days across India."); }}>
              Shipping Policy
            </a>
            <a href="#returns" onClick={(e) => { e.preventDefault(); showToast("Easy 7-day return policy on eligible products."); }}>
              Returns & Refunds
            </a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast("Your data is strictly encrypted and protected."); }}>
              Privacy & Security
            </a>
            <Link to="/admin/login" style={{ color: "var(--accent)", fontWeight: 700, marginTop: "6px" }}>
              ⚡ Admin Portal
            </Link>
          </div>

          <div className="fcol">
            <h3>Stay In The Loop</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "12px" }}>
              Subscribe for exclusive seasonal offers, discount coupons & new gadget launches.
            </p>
            <form className="newsletter" onSubmit={handleNewsletter} style={{ display: "flex", gap: "6px" }}>
              <input
                type="email"
                name="newsletter_email"
                placeholder="Enter your email"
                required
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#fff",
                  fontSize: "0.88rem"
                }}
              />
              <button type="submit" className="btn" style={{ minWidth: "80px", padding: "8px 14px", fontSize: "0.85rem" }}>
                Join
              </button>
            </form>
            <div style={{ marginTop: "16px", color: "#64748b", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🛡️</span>
              <span>100% Secure & Verified Payments</span>
            </div>
          </div>
        </div>

        <div className="container fbottom">
          <p>© 2026 ECartline India. All rights reserved. Inspired by India’s favorite shopping experience.</p>
          <div className="pay-badges">
            <span className="pay-tag">UPI</span>
            <span className="pay-tag">RuPay</span>
            <span className="pay-tag">VISA</span>
            <span className="pay-tag">Mastercard</span>
            <span className="pay-tag">NetBanking</span>
            <span className="pay-tag">Cash on Delivery</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <Link to="/" className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}>
          <span className="icon">🏠</span>
          <span>Home</span>
        </Link>
        <Link to="/categories" className={`mobile-nav-item ${isActive("/categories") ? "active" : ""}`}>
          <span className="icon">🗂️</span>
          <span>Categories</span>
        </Link>
        <Link to="/wishlist" className={`mobile-nav-item ${isActive("/wishlist") ? "active" : ""}`}>
          <span className="icon">♡</span>
          <span>Wishlist</span>
          {wishlistCount > 0 && <span className="mobile-nav-badge">{wishlistCount}</span>}
        </Link>
        <Link to="/cart" className={`mobile-nav-item ${isActive("/cart") ? "active" : ""}`}>
          <span className="icon">🛒</span>
          <span>Cart</span>
          {cartCount > 0 && <span className="mobile-nav-badge">{cartCount}</span>}
        </Link>
        <Link to={isAuthenticated ? "/profile" : "/login"} className={`mobile-nav-item ${isActive("/profile") || isActive("/login") ? "active" : ""}`}>
          <span className="icon">👤</span>
          <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
        </Link>
      </nav>
    </>
  );
}
