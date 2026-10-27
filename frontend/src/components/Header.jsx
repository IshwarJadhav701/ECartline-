import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { fetchSuggestions } from "../services/api";
import { navLinks } from "../services/productsData";

const defaultNavLinks = ["All", "Mobiles", "Electronics", "Fashion", "Footwear", "Home & Kitchen", "Sports", "Beauty", "Toys", "Furniture", "Bags", "Accessories"];

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [pincode, setPincode] = useState(() => localStorage.getItem("ec_pincode") || "411001");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearching(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearching(false);
    setShowAccountMenu(false);
  }, [location.pathname, location.search]);

  // Live search suggestions with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(q);
        setSuggestions(results.slice(0, 5));
        setIsSearching(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearching(false);
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/products");
    }
  };

  const handlePincodeClick = () => {
    const pin = prompt("Enter 6-digit delivery pincode:", pincode);
    if (pin && /^\d{6}$/.test(pin.trim())) {
      const cleanPin = pin.trim();
      setPincode(cleanPin);
      try {
        localStorage.setItem("ec_pincode", cleanPin);
      } catch {}
      showToast(`📍 Delivery location updated to ${cleanPin}`);
    } else if (pin !== null) {
      showToast("Please enter a valid 6-digit Indian pincode.");
    }
  };

  const userFirstName = user ? user.name.split(" ")[0] : "Sign in";

  return (
    <div id="site-header">
      {/* Top Sale Bar */}
      <div className="sale-bar">
        <span>🌿 Winter Super Sale: Up to 50% Off on Top Electronics, Mobiles & Fashion!</span>
        <Link to="/products?sort=discount">Shop Deals</Link>
      </div>

      {/* Main Header */}
      <header className="site-header">
        <div className="container hdr">
          {/* Mobile Hamburger Button */}
          <button
            className="burger"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>

          {/* Logo */}
          <Link className="logo" to="/" aria-label="ECartline home">
            E<span>Cartline</span>
          </Link>

          {/* Delivery Pincode */}
          <div
            className="loc"
            id="hdr-loc-btn"
            title="Click to change delivery pincode"
            onClick={handlePincodeClick}
            style={{ cursor: "pointer" }}
          >
            📍 Deliver to <b>{pincode}</b>
          </div>

          {/* Search Bar Container */}
          <div className="search-container" ref={searchRef}>
            <form className="search" onSubmit={handleSearchSubmit}>
              <input
                id="hdr-search-input"
                type="search"
                placeholder="Search products, brands, smartphones, fashion, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length) setIsSearching(true);
                }}
                autoComplete="off"
              />
              <button type="submit" aria-label="Search">🔍</button>
            </form>

            {/* Suggestions Dropdown */}
            {isSearching && suggestions.length > 0 && (
              <div className="search-suggest show">
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    className="suggest-item"
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery("");
                      navigate(`/products/${p.id}`);
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="suggest-info">
                      <span className="suggest-title">{p.name}</span>
                      <span className="suggest-meta">in {p.category} • ₹{p.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Navigation Icons */}
          <div className="hl">
            {/* Account Dropdown */}
            <div className="hdr-account-wrap" ref={accountRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="hdr-auth-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                  } else {
                    setShowAccountMenu(!showAccountMenu);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  color: "var(--text-main)",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.92rem"
                }}
              >
                <span>👤</span>
                <span>{userFirstName}</span>
                {isAuthenticated && <small style={{ fontSize: "0.75rem" }}>▾</small>}
              </button>

              {/* Dropdown Menu for Logged In User */}
              {isAuthenticated && showAccountMenu && (
                <div
                  className="account-dropdown show"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    boxShadow: "var(--sh-lg)",
                    minWidth: "190px",
                    zIndex: 2000,
                    padding: "8px 0"
                  }}
                >
                  <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Signed in as <br /><b style={{ color: "var(--text-main)" }}>{user?.email}</b>
                  </div>
                  <Link
                    to="/profile"
                    style={{ display: "block", padding: "8px 16px", color: "var(--text-main)", fontSize: "0.9rem" }}
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    to="/orders"
                    style={{ display: "block", padding: "8px 16px", color: "var(--text-main)", fontSize: "0.9rem" }}
                  >
                    📦 My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{ display: "block", padding: "8px 16px", color: "var(--primary)", fontWeight: "700", fontSize: "0.9rem" }}
                    >
                      ⚡ Admin Portal
                    </Link>
                  )}
                  <div style={{ borderTop: "1px solid var(--border)", marginTop: "4px" }} />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountMenu(false);
                      logout();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 16px",
                      background: "none",
                      border: "none",
                      color: "#DC2626",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link className="wish" to="/wishlist" aria-label="Wishlist">
              ♡<span id="wish-count">{wishlistCount}</span>
            </Link>

            {/* Cart Link */}
            <Link className="cart" to="/cart" aria-label="Shopping Cart">
              🛒<span id="cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Subnav Departments Bar */}
      <nav className={`subnav ${mobileMenuOpen ? "open" : ""}`} aria-label="Product categories">
        <div className="container">
          {defaultNavLinks.map((cat) => {
            const path = cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
            return (
              <Link key={cat} to={path}>
                {cat}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
