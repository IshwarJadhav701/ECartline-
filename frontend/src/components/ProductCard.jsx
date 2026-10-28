import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { fmt, FALLBACK_IMAGE } from "../services/productsData";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const inStock = product.inStock !== false && (product.stock == null || product.stock > 0);

  // Helper for star display
  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = rating - full >= 0.5;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
  };

  return (
    <article className="card" id={`product-card-${product.id}`}>
      {/* Discount Badge */}
      {product.discount && <span className="badge">{product.discount}</span>}

      {/* Heart Wishlist Button */}
      <button
        type="button"
        className={`heart ${isFavorited ? "on" : ""}`}
        aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
      >
        {isFavorited ? "♥" : "♡"}
      </button>

      {/* Thumbnail Link */}
      <Link className="img" to={`/products/${product.id}`} aria-label={product.name}>
        <img
          loading="lazy"
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="info">
        <span className="cat-name">{product.category}</span>
        <Link className="pname" to={`/products/${product.id}`} title={product.name}>
          {product.name}
        </Link>

        {/* Ratings */}
        <div className="stars">
          <span style={{ color: "var(--star-gold)" }}>{renderStars(product.rating)}</span>
          <small>{product.rating} {product.reviews ? `(${Number(product.reviews).toLocaleString("en-IN")})` : ""}</small>
        </div>

        {/* Pricing */}
        <div className="price">
          <b>{fmt(product.price)}</b>
          {product.oldPrice && product.oldPrice > product.price && <s>{fmt(product.oldPrice)}</s>}
          {product.discount && <em>{product.discount}</em>}
        </div>

        {/* Delivery & Stock indicators */}
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Free delivery by <b style={{ color: "var(--primary)" }}>Tomorrow</b>
        </div>
        <div style={{ fontSize: "0.78rem", color: inStock ? "var(--discount-green)" : "#DC2626", fontWeight: "700", marginTop: "2px" }}>
          {inStock ? `✓ In stock (${product.stock ?? 15})` : "✕ Out of stock"}
        </div>

        {/* Add to Cart CTA - Pinned to bottom of card */}
        <div className="acts single-act">
          <button
            type="button"
            className="btn"
            style={{ width: "100%" }}
            disabled={!inStock}
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </article>
  );
}
