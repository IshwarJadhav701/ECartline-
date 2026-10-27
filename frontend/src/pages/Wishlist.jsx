import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { fetchProductsApi } from "../services/api";
import { fallbackProducts, fmt, FALLBACK_IMAGE } from "../services/productsData";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await fetchProductsApi();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const wishItems = wishlist
    .map((id) => products.find((p) => String(p.id) === String(id)))
    .filter(Boolean);

  const renderStars = (rating = 4.5) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  };

  return (
    <main className="container">
      <div style={{ margin: "28px 0 60px" }}>
        <h1 className="sec-title">My Wishlist</h1>

        {loading ? (
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skel" style={{ height: "340px" }} />
            ))}
          </div>
        ) : wishItems.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>♡</div>
            <h3>Your wishlist is currently empty.</h3>
            <p style={{ margin: "12px 0 20px" }}>Save items you love here to easily find and purchase them later.</p>
            <Link className="btn" to="/products">
              Explore Products
            </Link>
          </div>
        ) : (
          <div id="wish-grid" className="grid">
            {wishItems.map((p) => (
              <article key={p.id} className="card">
                {p.discount && <span className="badge">{p.discount}</span>}
                <button
                  className="heart on"
                  onClick={() => {
                    removeFromWishlist(p.id);
                    showToast("Removed from Wishlist");
                  }}
                  aria-label="Remove from wishlist"
                >
                  ♥
                </button>
                <Link className="img" to={`/product/${p.id}`}>
                  <img
                    loading="lazy"
                    src={p.image || FALLBACK_IMAGE}
                    alt={p.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </Link>
                <div className="info">
                  <span className="cat-name">{p.category}</span>
                  <Link className="pname" to={`/product/${p.id}`}>
                    {p.name}
                  </Link>
                  <div className="stars">
                    {renderStars(p.rating)} <small>{p.rating}</small>
                  </div>
                  <div className="price">
                    <b>{fmt(p.price)}</b>
                    {p.oldPrice && <s>{fmt(p.oldPrice)}</s>}
                    {p.discount && <em>{p.discount}</em>}
                  </div>
                  <div className="acts">
                    <button
                      className="btn"
                      disabled={p.inStock === false || p.stock === 0}
                      onClick={() => {
                        addToCart(p);
                        showToast(`✓ Added ${p.name} to Cart`, "success");
                      }}
                    >
                      {p.inStock === false || p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      className="btn line"
                      onClick={() => {
                        removeFromWishlist(p.id);
                        showToast("Removed from Wishlist");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
